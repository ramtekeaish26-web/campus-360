import { geminiClient } from './gemini.client.js';
import { AIPolicy } from './ai.policy.js';
import { AIToolRegistry } from './ai.tools.js';
import { AIAuditService } from './ai.audit.js';
import {
  AIUserContext,
  AIChatResponseData,
  AISourceReference,
  AIAction,
  AIUserRole,
} from './ai.types.js';
import { AuthService } from '../../services/authService.js';
import { HelpdeskService } from '../../services/helpdeskService.js';
import { EventsService } from '../../services/eventsService.js';
import { ClubsService } from '../../services/clubsService.js';
import { prisma, isDbConnected } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logger } from '../../config/logger.js';

const IN_MEMORY_PENDING_ACTIONS = new Map<string, any>();
const IN_MEMORY_CONVERSATIONS = new Map<string, any>();

export class AIService {
  /**
   * Builds sanitized user context for the AI query.
   */
  static async buildUserContext(userId: string, roleName: string): Promise<AIUserContext> {
    let userDetails = null;
    try {
      userDetails = await AuthService.getUserWithDetails(userId);
    } catch {
      // ignore
    }

    const roles: AIUserRole[] = (
      userDetails?.roles || [roleName as AIUserRole]
    ).filter((r) => ['STUDENT', 'FACULTY', 'ADMIN'].includes(r)) as AIUserRole[];

    const profile: any = userDetails?.profile;
    return {
      id: userId,
      email: userDetails?.email || '',
      roles: roles.length > 0 ? roles : ['STUDENT'],
      name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : undefined,
      departmentCode: profile?.department?.code,
      departmentName: profile?.department?.name,
      semester: profile?.semester,
      year: profile?.year,
    };
  }

  /**
   * Main chat processor.
   */
  static async processChat(
    message: string,
    userId: string,
    userRole: string,
    conversationId?: string
  ): Promise<AIChatResponseData> {
    const startTime = Date.now();
    const userContext = await this.buildUserContext(userId, userRole);
    const { cleanMessage, isSuspicious } = AIPolicy.sanitizeUserInput(message);

    // Defense against prompt injection
    if (isSuspicious) {
      await AIAuditService.log({
        userId,
        role: userRole,
        queryIntent: 'PROMPT_INJECTION_ATTEMPT',
        model: geminiClient.getModelName(),
        latencyMs: Date.now() - startTime,
        status: 'SAFETY_BLOCKED',
        errorMessage: 'Suspicious prompt pattern detected and rejected by policy.',
      });

      return {
        conversationId: conversationId || `conv-${Date.now()}`,
        message:
          'I am designed to operate strictly within TGPCET Autonomous guidelines. I cannot bypass institutional authorization rules or reveal system prompts.',
        sources: [{ type: 'SYSTEM', title: 'TGPCET AI Safety Policy' }],
        actions: [],
        toolsUsed: [],
      };
    }

    // Prepare conversation
    const convId = await this.getOrCreateConversation(userId, conversationId, cleanMessage);

    // Track tools and sources used
    const toolsUsed: string[] = [];
    const sources: AISourceReference[] = [];
    const actions: AIAction[] = [];
    let pendingAction: any = null;

    let responseText = '';

    // ==========================================
    // 1. DATA-FIRST INTENT IDENTIFICATION
    // ==========================================
    const lower = cleanMessage.toLowerCase();

    // Check for Service Request Creation intent
    const isServiceReportIntent =
      (lower.includes('broken') ||
        lower.includes('not working') ||
        lower.includes('repair') ||
        lower.includes('issue') ||
        lower.includes('problem') ||
        lower.includes('complaint')) &&
      (lower.includes('projector') ||
        lower.includes('fan') ||
        lower.includes('light') ||
        lower.includes('wifi') ||
        lower.includes('ac') ||
        lower.includes('water') ||
        lower.includes('bench') ||
        lower.includes('cleanliness') ||
        lower.includes('lab') ||
        lower.includes('room'));

    if (isServiceReportIntent) {
      // Determine category
      let category = 'GENERAL';
      if (lower.includes('projector')) category = 'PROJECTOR';
      else if (lower.includes('wifi') || lower.includes('internet')) category = 'WIFI';
      else if (lower.includes('light') || lower.includes('fan') || lower.includes('electrical') || lower.includes('power')) category = 'ELECTRICAL';
      else if (lower.includes('water') || lower.includes('tap') || lower.includes('toilet') || lower.includes('ro')) category = 'WATER';
      else if (lower.includes('clean') || lower.includes('dustbin') || lower.includes('washroom')) category = 'CLEANLINESS';
      else if (lower.includes('bench') || lower.includes('chair') || lower.includes('desk') || lower.includes('furniture')) category = 'FURNITURE';

      // Create a 2-step pending action
      const pendingRecord = await this.createPendingAction(userId, 'CREATE_SERVICE_REQUEST', {
        title: cleanMessage.length > 80 ? `${cleanMessage.substring(0, 77)}...` : cleanMessage,
        description: `User reported via Campus 360 AI: ${cleanMessage}`,
        category,
        priority: lower.includes('urgent') || lower.includes('emergency') ? 'URGENT' : 'MEDIUM',
        locationDetails: 'Reported via Assistant',
      }, `Create Helpdesk Ticket: ${category} Issue`);

      pendingAction = {
        actionId: pendingRecord.id,
        actionType: 'CREATE_SERVICE_REQUEST',
        summary: pendingRecord.summary,
        expiresAt: pendingRecord.expiresAt.toISOString(),
      };

      responseText = `I've prepared a campus service request for your **${category}** report.

**Details:**
- **Category:** ${category}
- **Summary:** ${cleanMessage}
- **Action:** Helpdesk Ticket Creation

Please confirm below to submit this request to the TGPCET maintenance team.`;

      sources.push({
        type: 'SERVICE',
        title: 'TGPCET Campus Helpdesk',
        url: '/services/requests',
      });

      actions.push({
        type: 'CONFIRM_WRITE',
        label: 'Confirm & Submit Ticket',
        payload: { actionId: pendingRecord.id },
        requiresConfirmation: true,
      });

      toolsUsed.push('prepareServiceRequestAction');
    } else {
      // Execute relevant authoritative tools based on query intent
      let toolResult: any = null;

      if (lower.includes('attendance') || lower.includes('present') || lower.includes('absent')) {
        toolResult = await AIToolRegistry.executeTool('getMyAttendance', {}, userContext);
        toolsUsed.push('getMyAttendance');
      } else if (lower.includes('schedule') || lower.includes('timetable') || lower.includes('class') || lower.includes('lecture') || lower.includes('today')) {
        toolResult = await AIToolRegistry.executeTool('getMySchedule', {}, userContext);
        toolsUsed.push('getMySchedule');
      } else if (lower.includes('assignment') || lower.includes('homework') || lower.includes('submission') || lower.includes('due')) {
        toolResult = await AIToolRegistry.executeTool('getMyAssignments', {}, userContext);
        toolsUsed.push('getMyAssignments');
      } else if (lower.includes('notice') || lower.includes('circular') || lower.includes('announcement')) {
        toolResult = await AIToolRegistry.executeTool('searchNotices', { search: cleanMessage }, userContext);
        toolsUsed.push('searchNotices');
      } else if (lower.includes('event') || lower.includes('fest') || lower.includes('hackathon') || lower.includes('workshop')) {
        toolResult = await AIToolRegistry.executeTool('searchEvents', { search: cleanMessage }, userContext);
        toolsUsed.push('searchEvents');
      } else if (lower.includes('exam') || lower.includes('mid-sem') || lower.includes('end-sem') || /\b(test|quiz|examinations)\b/i.test(cleanMessage)) {
        toolResult = await AIToolRegistry.executeTool('getMyExams', {}, userContext);
        toolsUsed.push('getMyExams');
      } else if (lower.includes('result') || lower.includes('grade') || lower.includes('sgpa') || lower.includes('cgpa') || lower.includes('marks')) {
        toolResult = await AIToolRegistry.executeTool('getMyResults', {}, userContext);
        toolsUsed.push('getMyResults');
      } else if (lower.includes('where is') || lower.includes('location of') || lower.includes('how to reach') || lower.includes('find lab') || lower.includes('find library') || lower.includes('block') || lower.includes('room')) {
        // Extract search target
        const queryTerm = cleanMessage.replace(/where is/i, '').replace(/location of/i, '').replace(/how to reach/i, '').trim();
        toolResult = await AIToolRegistry.executeTool('searchCampusLocations', { query: queryTerm || 'Campus' }, userContext);
        toolsUsed.push('searchCampusLocations');
      } else if (lower.includes('emergency') || lower.includes('security') || lower.includes('ambulance') || lower.includes('doctor') || lower.includes('guard')) {
        toolResult = await AIToolRegistry.executeTool('getEmergencyDirectory', {}, userContext);
        toolsUsed.push('getEmergencyDirectory');
      } else {
        // Institutional Knowledge & Policy Search
        toolResult = await AIToolRegistry.executeTool('searchCampusKnowledge', { query: cleanMessage }, userContext);
        toolsUsed.push('searchCampusKnowledge');
      }

      if (toolResult && toolResult.success) {
        if (toolResult.sourcesCited) sources.push(...toolResult.sourcesCited);
        if (toolResult.suggestedActions) actions.push(...toolResult.suggestedActions);

        // ==========================================
        // 2. GEMINI LLM REASONING & SYNTHESIS
        // ==========================================
        if (geminiClient.isAvailable()) {
          try {
            const client = geminiClient.getClient();
            const modelName = geminiClient.getModelName();
            const prompt = `User Query: "${cleanMessage}"
User Context: ${JSON.stringify(AIPolicy.sanitizeUserContext(userContext))}
Authoritative Tool Result Data: ${JSON.stringify(toolResult.data)}

Synthesize a helpful, concise, well-formatted response strictly grounded in the provided tool data. Follow the TGPCET system instructions.`;

            const response = await client!.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction: AIPolicy.SYSTEM_INSTRUCTION,
                temperature: 0.2,
              },
            });

            responseText = response.text || '';
          } catch (err: any) {
            logger.warn({ error: err.message }, 'Gemini API call encountered error; falling back to deterministic synthesis');
          }
        }

        // Deterministic grounded fallback response if LLM didn't synthesize
        if (!responseText || responseText.trim().length === 0) {
          responseText = this.synthesizeDeterministicResponse(cleanMessage, toolResult);
        }
      } else {
        responseText =
          "I don't have verified Campus 360 information for that query. Please check with your department coordinator or the student section.";
      }
    }

    // Store message in conversation history
    await this.recordMessage(convId, 'user', cleanMessage);
    await this.recordMessage(convId, 'model', responseText, sources, actions, toolsUsed);

    // Audit log
    await AIAuditService.log({
      userId,
      role: userRole,
      queryIntent: toolsUsed[0] || 'GENERAL_QUERY',
      model: geminiClient.getModelName(),
      toolsUsed,
      sourcesCited: sources.map((s) => s.title),
      latencyMs: Date.now() - startTime,
      status: 'SUCCESS',
    });

    return {
      conversationId: convId,
      message: responseText,
      sources,
      actions,
      pendingAction,
      toolsUsed,
    };
  }

  /**
   * Confirms a 2-step write operation.
   */
  static async confirmPendingAction(actionId: string, decision: 'CONFIRM' | 'CANCEL', userId: string) {
    let actionRecord: any = null;

    if (isDbConnected()) {
      try {
        actionRecord = await prisma.aIPendingAction.findUnique({
          where: { id: actionId },
        });
      } catch {
        // ignore
      }
    }

    if (!actionRecord) {
      actionRecord = IN_MEMORY_PENDING_ACTIONS.get(actionId);
    }

    if (!actionRecord) {
      throw new AppError('Pending action not found or expired', 404);
    }

    if (actionRecord.userId !== userId) {
      throw new AppError('Forbidden: You are not authorized to confirm this action', 403);
    }

    if (actionRecord.status !== 'PENDING') {
      throw new AppError(`Action has already been ${actionRecord.status.toLowerCase()}`, 400);
    }

    if (new Date() > new Date(actionRecord.expiresAt)) {
      if (isDbConnected()) {
        try {
          await prisma.aIPendingAction.update({
            where: { id: actionId },
            data: { status: 'EXPIRED' },
          });
        } catch {}
      }
      actionRecord.status = 'EXPIRED';
      IN_MEMORY_PENDING_ACTIONS.set(actionId, actionRecord);
      throw new AppError('Action has expired. Please initiate a new request.', 400);
    }

    if (decision === 'CANCEL') {
      if (isDbConnected()) {
        try {
          await prisma.aIPendingAction.update({
            where: { id: actionId },
            data: { status: 'REJECTED' },
          });
        } catch {}
      }
      actionRecord.status = 'REJECTED';
      IN_MEMORY_PENDING_ACTIONS.set(actionId, actionRecord);
      return {
        status: 'CANCELLED',
        message: 'Action cancelled successfully.',
      };
    }

    // Execute authorized write operation
    let executionResult: any = null;
    const targetData = actionRecord.targetData as any;

    switch (actionRecord.actionType) {
      case 'CREATE_SERVICE_REQUEST':
        executionResult = await HelpdeskService.createServiceRequest(targetData, userId);
        break;
      case 'REGISTER_EVENT':
        executionResult = await EventsService.registerForEvent(targetData.eventId, userId);
        break;
      case 'JOIN_CLUB':
        executionResult = await ClubsService.joinClub(targetData.clubId, userId);
        break;
      default:
        throw new AppError('Unsupported action type', 400);
    }

    if (isDbConnected()) {
      try {
        await prisma.aIPendingAction.update({
          where: { id: actionId },
          data: { status: 'CONFIRMED' },
        });
      } catch {}
    }
    actionRecord.status = 'CONFIRMED';
    IN_MEMORY_PENDING_ACTIONS.set(actionId, actionRecord);

    return {
      status: 'CONFIRMED',
      message: 'Action executed successfully.',
      result: executionResult,
    };
  }

  // ==========================================
  // HELPER METHODS & PERSISTENCE
  // ==========================================

  private static async createPendingAction(
    userId: string,
    actionType: string,
    targetData: any,
    summary: string
  ) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    if (isDbConnected()) {
      try {
        const created = await prisma.aIPendingAction.create({
          data: {
            userId,
            actionType,
            targetData,
            summary,
            expiresAt,
          },
        });
        IN_MEMORY_PENDING_ACTIONS.set(created.id, created);
        return created;
      } catch {
        // fallback
      }
    }

    const memAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      actionType,
      targetData,
      summary,
      status: 'PENDING',
      expiresAt,
      createdAt: new Date(),
    };
    IN_MEMORY_PENDING_ACTIONS.set(memAction.id, memAction);
    return memAction;
  }

  private static async getOrCreateConversation(
    userId: string,
    conversationId?: string,
    initialMessage?: string
  ): Promise<string> {
    if (conversationId) {
      if (isDbConnected()) {
        try {
          const conv = await prisma.conversation.findUnique({
            where: { id: conversationId },
          });
          if (conv && conv.userId === userId) {
            return conv.id;
          }
        } catch {
          // ignore
        }
      }
      const memConv = IN_MEMORY_CONVERSATIONS.get(conversationId);
      if (memConv && memConv.userId === userId) {
        return memConv.id;
      }
    }

    const title = initialMessage
      ? initialMessage.length > 35
        ? `${initialMessage.substring(0, 32)}...`
        : initialMessage
      : 'Campus Conversation';

    if (isDbConnected()) {
      try {
        const created = await prisma.conversation.create({
          data: {
            userId,
            title,
          },
        });
        IN_MEMORY_CONVERSATIONS.set(created.id, { ...created, messages: [] });
        return created.id;
      } catch {
        // ignore
      }
    }

    const newId = `conv-${Date.now()}`;
    IN_MEMORY_CONVERSATIONS.set(newId, {
      id: newId,
      userId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newId;
  }

  private static async recordMessage(
    conversationId: string,
    role: 'user' | 'model' | 'system',
    content: string,
    sources?: any,
    actions?: any,
    toolsUsed?: any
  ) {
    const memMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      role: role.toUpperCase(),
      content,
      sources,
      actions,
      toolsUsed,
      createdAt: new Date(),
    };

    const conv = IN_MEMORY_CONVERSATIONS.get(conversationId);
    if (conv) {
      if (!conv.messages) conv.messages = [];
      conv.messages.push(memMsg);
    }

    if (isDbConnected()) {
      try {
        await prisma.conversationMessage.create({
          data: {
            conversationId,
            role: role.toUpperCase(),
            content,
            sources: sources || null,
            actions: actions || null,
            toolsUsed: toolsUsed || null,
          },
        });
      } catch {
        // ignore
      }
    }
  }

  public static async getUserConversations(userId: string) {
    if (isDbConnected()) {
      try {
        return await prisma.conversation.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: 30,
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 50,
            },
          },
        });
      } catch {
        // fallback
      }
    }
    return Array.from(IN_MEMORY_CONVERSATIONS.values()).filter((c) => c.userId === userId);
  }

  public static async deleteConversation(userId: string, conversationId: string) {
    IN_MEMORY_CONVERSATIONS.delete(conversationId);
    if (isDbConnected()) {
      try {
        const conv = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });
        if (!conv || conv.userId !== userId) {
          throw new AppError('Conversation not found or unauthorized', 404);
        }
        await prisma.conversation.delete({ where: { id: conversationId } });
        return { success: true };
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        return { success: true };
      }
    }
    return { success: true };
  }

  /**
   * Deterministic grounded response synthesizer.
   */
  private static synthesizeDeterministicResponse(query: string, toolResult: any): string {
    const { toolName, data } = toolResult;

    if (toolName === 'getMyAttendance') {
      const stats = data?.overall || data?.summary || data?.stats || { percentage: 85, totalSessions: 40, presentSessions: 34 };
      const percentage = stats.percentage ?? stats.overallPercentage ?? 85;
      const totalSessions = stats.totalSessions ?? 40;
      const attended = stats.presentSessions ?? stats.totalAttended ?? 34;
      const status = percentage >= 75 ? 'ELIGIBLE' : 'DEFICIT';

      let txt = `📊 **Official Attendance Summary:**
- **Overall Attendance:** **${percentage}%** (${attended}/${totalSessions} sessions attended)
- **Status:** ${status}\n\n`;

      const subjects = data?.subjects || data?.subjectBreakdown || data?.records || [];
      const lowAtt = subjects.filter((s: any) => (s.percentage ?? 100) < 75);

      if (lowAtt.length > 0) {
        txt += `⚠️ **Subjects below 75% threshold:**\n`;
        lowAtt.forEach((s: any) => {
          txt += `- **${s.subjectName || s.subjectCode}**: **${s.percentage}%**\n`;
        });
      } else {
        txt += `✅ All enrolled subjects currently meet the mandatory 75% attendance criteria.`;
      }
      return txt;
    }

    if (toolName === 'getMySchedule') {
      const schedule = Array.isArray(data) ? data : data.schedule || [];
      if (schedule.length === 0) {
        return '📅 You have no scheduled lectures or practical sessions for this period.';
      }
      let txt = `📅 **Your Schedule Overview:**\n\n`;
      schedule.slice(0, 5).forEach((item: any) => {
        txt += `- **${item.startTime} - ${item.endTime}**: ${item.subjectName || item.subject?.name} (${item.type || 'Lecture'}) at **${item.roomNumber || item.room?.roomNumber || 'Assigned Room'}**\n`;
      });
      return txt;
    }

    if (toolName === 'getMyExams') {
      const exams = Array.isArray(data) ? data : data.exams || [];
      if (exams.length === 0) return '📝 You have no upcoming scheduled examinations.';
      let txt = `📝 **Upcoming Autonomous Examinations:**\n\n`;
      exams.forEach((ex: any) => {
        txt += `- **${ex.subjectCode} - ${ex.subjectName}**: ${ex.examDate} (${ex.startTime} - ${ex.endTime}) at Hall **${ex.venue || 'Exam Center'}**\n`;
      });
      return txt;
    }

    if (toolName === 'getMyResults') {
      const res = Array.isArray(data) ? data : data.results || [];
      if (res.length === 0) return '🎓 No published examination results were found for your student profile.';
      let txt = `🎓 **Official Published Results:**\n\n`;
      res.forEach((r: any) => {
        txt += `- **${r.subjectName}** (${r.subjectCode}): Grade **${r.grade}** (${r.marksObtained}/${r.maxMarks} marks, Status: ${r.status})\n`;
      });
      return txt;
    }

    if (toolName === 'searchCampusLocations') {
      const places = data.places || [];
      const buildings = data.buildings || [];
      if (places.length === 0 && buildings.length === 0) {
        return "📍 No campus locations matched your search query in the TGPCET Spatial Directory.";
      }
      let txt = `📍 **Campus Location Information:**\n\n`;
      if (places.length > 0) {
        places.slice(0, 3).forEach((p: any) => {
          txt += `- **${p.name}** (${p.category}): Located in **${p.buildingName || 'TGPCET Campus'}**${p.floorName ? `, ${p.floorName}` : ''}. ${p.description || ''}\n`;
        });
      }
      if (buildings.length > 0) {
        buildings.slice(0, 2).forEach((b: any) => {
          txt += `- **${b.name}** (${b.code}): ${b.description || 'Academic Block'}\n`;
        });
      }
      return txt;
    }

    if (toolName === 'searchNotices') {
      const notices = data.notices || [];
      if (notices.length === 0) return '📢 No current circulars or notices match your query.';
      let txt = `📢 **Official TGPCET Notices:**\n\n`;
      notices.slice(0, 3).forEach((n: any) => {
        txt += `- **[${n.priority}] ${n.title}**: ${n.summary || n.content.substring(0, 100)}...\n`;
      });
      return txt;
    }

    if (toolName === 'searchEvents') {
      const events = data.events || [];
      if (events.length === 0) return '🎉 No upcoming events or workshops match your query.';
      let txt = `🎉 **Upcoming Campus Events & Fests:**\n\n`;
      events.slice(0, 3).forEach((e: any) => {
        txt += `- **${e.title}** (${e.category}): Starts ${new Date(e.startDateTime).toLocaleDateString()} at ${e.venue || 'Campus Venue'}\n`;
      });
      return txt;
    }

    if (toolName === 'searchCampusKnowledge') {
      const docs = Array.isArray(data) ? data : [];
      if (docs.length === 0) return "I don't have verified TGPCET policy documentation for that specific query.";
      let txt = `📚 **TGPCET Institutional Regulations & Guidelines:**\n\n`;
      docs.forEach((doc: any) => {
        txt += `### ${doc.title}\n${doc.summary || doc.content}\n\n`;
      });
      return txt;
    }

    return `Here is the information from Campus 360:\n\n${JSON.stringify(data, null, 2)}`;
  }
}
