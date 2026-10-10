import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/aiApi.js';
import { AIAuditLogEntry, AIStats } from '../../types/ai.js';
import {
  ShieldAlert,
  Bot,
  Activity,
  Cpu,
  Clock,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const AdminAIPage: React.FC = () => {
  const [logs, setLogs] = useState<AIAuditLogEntry[]>([]);
  const [stats, setStats] = useState<AIStats>({
    totalQueries: 0,
    toolInvocations: 0,
    policyBlocks: 0,
    averageLatencyMs: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        aiApi.getAdminLogs({ limit: 50 }),
        aiApi.getAdminStats(),
      ]);
      setLogs(logsRes.logs || []);
      setStats(statsRes);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.userId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.modelUsed?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.toolsInvoked?.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-on-surface">
              Campus Intelligence Admin Console
            </h1>
            <p className="text-xs text-on-surface-variant">
              Live audit logging, tool invocations, model latency, and safety policy enforcement
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
              Total AI Queries
            </span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-display text-on-surface">
            {stats.totalQueries}
          </div>
          <span className="text-[11px] text-on-surface-variant">Conversational exchanges</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
              Tool Invocations
            </span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-display text-on-surface">
            {stats.toolInvocations}
          </div>
          <span className="text-[11px] text-on-surface-variant">Grounded institutional queries</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
              Avg Latency
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-display text-on-surface">
            {stats.averageLatencyMs}ms
          </div>
          <span className="text-[11px] text-on-surface-variant">Gemini API & tool execution</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
              Policy Interceptions
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-display text-rose-600 dark:text-rose-400">
            {stats.policyBlocks}
          </div>
          <span className="text-[11px] text-on-surface-variant">Injections & PII filtered</span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-surface-container-low border border-surface-container overflow-hidden">
        <div className="p-4 border-b border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-on-surface">AI Safety & Execution Audit Trail</h3>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[11px]">
              {filteredLogs.length} events
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, model, tool..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-high/50 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Model Used</th>
                <th className="py-3 px-4">Tools Invoked</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Policy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant text-xs">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-on-surface">{log.userId}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                      {log.modelUsed}
                    </td>
                    <td className="py-3 px-4">
                      {log.toolsInvoked && log.toolsInvoked.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {log.toolsInvoked.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-mono text-[10px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-[11px] italic">Direct Reasoning</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-3 px-4">
                      {log.flaggedPolicy ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>Safe</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminAIPage;
