import { prisma, isDbConnected } from '../../config/db.js';
import { logger } from '../../config/logger.js';

export interface AIAuditEntry {
  userId?: string;
  role: string;
  queryIntent?: string;
  model: string;
  toolsUsed?: string[];
  sourcesCited?: string[];
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR' | 'RATE_LIMITED' | 'SAFETY_BLOCKED' | 'FALLBACK';
  errorMessage?: string;
}

// In-memory audit ring buffer for development / fallback
const IN_MEMORY_LOGS: Array<AIAuditEntry & { id: string; createdAt: Date }> = [];

export class AIAuditService {
  static async log(entry: AIAuditEntry) {
    try {
      const memoryEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...entry,
        createdAt: new Date(),
      };
      IN_MEMORY_LOGS.unshift(memoryEntry);
      if (IN_MEMORY_LOGS.length > 200) IN_MEMORY_LOGS.pop();

      if (isDbConnected()) {
        await prisma.aIAuditLog.create({
          data: {
            userId: entry.userId,
            role: entry.role,
            queryIntent: entry.queryIntent,
            model: entry.model,
            toolsUsed: entry.toolsUsed as any,
            sourcesCited: entry.sourcesCited as any,
            latencyMs: entry.latencyMs,
            status: entry.status,
            errorMessage: entry.errorMessage,
          },
        });
      }
    } catch (err: any) {
      logger.warn({ error: err.message }, 'Failed to write AI audit log');
    }
  }

  static async getMetrics() {
    let totalRequests = IN_MEMORY_LOGS.length;
    let successfulRequests = IN_MEMORY_LOGS.filter((l) => l.status === 'SUCCESS').length;
    let errorRequests = IN_MEMORY_LOGS.filter((l) => l.status === 'ERROR').length;
    let rateLimitedRequests = IN_MEMORY_LOGS.filter((l) => l.status === 'RATE_LIMITED').length;
    let totalLatency = IN_MEMORY_LOGS.reduce((acc, l) => acc + l.latencyMs, 0);
    let avgLatencyMs = totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 120;
    let recentLogs: any[] = IN_MEMORY_LOGS.slice(0, 20);

    const toolUsageMap: Record<string, number> = {};
    IN_MEMORY_LOGS.forEach((log) => {
      if (log.toolsUsed) {
        log.toolsUsed.forEach((tool) => {
          toolUsageMap[tool] = (toolUsageMap[tool] || 0) + 1;
        });
      }
    });

    if (isDbConnected()) {
      try {
        const count = await prisma.aIAuditLog.count();
        if (count > 0) {
          totalRequests = count;
          const errors = await prisma.aIAuditLog.count({ where: { status: 'ERROR' } });
          errorRequests = errors;
          successfulRequests = await prisma.aIAuditLog.count({ where: { status: 'SUCCESS' } });
          rateLimitedRequests = await prisma.aIAuditLog.count({ where: { status: 'RATE_LIMITED' } });
          const dbLogs = await prisma.aIAuditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
              user: {
                select: {
                  email: true,
                  profile: { select: { firstName: true, lastName: true } },
                },
              },
            },
          });
          recentLogs = dbLogs;
        }
      } catch {
        // use memory
      }
    }

    return {
      totalRequests,
      successfulRequests,
      errorRequests,
      rateLimitedRequests,
      avgLatencyMs,
      toolUsage: toolUsageMap,
      recentLogs,
    };
  }
}
