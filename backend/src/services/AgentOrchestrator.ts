import { dbService } from '../utils/db';
import { SearchAgent } from '../agents/SearchAgent';
import { VerificationAgent } from '../agents/VerificationAgent';
import { FactChecker } from '../agents/FactChecker';
import { SummarizationAgent } from '../agents/SummarizationAgent';
import { ReportGenerator } from '../agents/ReportGenerator';

export interface AgentUpdate {
  type: 'timeline' | 'data' | 'complete' | 'error';
  title?: string;
  message?: string;
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED';
  data?: any;
}

export class AgentOrchestrator {
  /**
   * Run the full multi-agent research pipeline for a given query and session.
   * Sends real-time progress callbacks to stream via SSE.
   */
  static async executeResearch(
    sessionId: string,
    query: string,
    onUpdate: (update: AgentUpdate) => void
  ): Promise<void> {
    console.log(`[Orchestrator] Starting deep research session ${sessionId} for query: "${query}"`);

    // Helper to send timeline progress steps
    const sendTimelineUpdate = (title: string, message: string, status: 'RUNNING' | 'COMPLETED' | 'FAILED') => {
      onUpdate({
        type: 'timeline',
        title,
        message,
        status
      });
    };

    try {
      // Step 1: SEARCH_AGENT
      await dbService.session.update({
        where: { id: sessionId },
        data: { status: 'SEARCHING' }
      });
      
      const { findings, sources, images } = await SearchAgent.run(
        sessionId,
        query,
        sendTimelineUpdate
      );

      // Stream updated sources and images to the client
      onUpdate({
        type: 'data',
        data: { sources, images }
      });

      if (findings.length === 0) {
        throw new Error('No research findings or search results could be retrieved.');
      }

      // Step 2: VERIFICATION_AGENT
      await dbService.session.update({
        where: { id: sessionId },
        data: { status: 'VERIFYING' }
      });

      const assertions = await VerificationAgent.run(
        sessionId,
        findings,
        sendTimelineUpdate
      );

      // Step 3: FACT_CHECKER
      await dbService.session.update({
        where: { id: sessionId },
        data: { status: 'FACTCHECKING' }
      });

      const factCheck = await FactChecker.run(
        sessionId,
        assertions,
        sendTimelineUpdate
      );

      // Step 4: SUMMARIZATION_AGENT
      await dbService.session.update({
        where: { id: sessionId },
        data: { status: 'SUMMARIZING' }
      });

      const summaryData = await SummarizationAgent.run(
        sessionId,
        query,
        assertions,
        factCheck.supportingEvidence,
        factCheck.contradictoryEvidence,
        sendTimelineUpdate
      );

      // Step 5: REPORT_GENERATOR
      await dbService.session.update({
        where: { id: sessionId },
        data: { status: 'REPORTING' }
      });

      const reportMarkdown = await ReportGenerator.run(
        sessionId,
        query,
        summaryData.answer,
        summaryData.summary,
        findings,
        sources,
        factCheck.supportingEvidence,
        factCheck.contradictoryEvidence,
        sendTimelineUpdate
      );

      // Finalize database record
      const updatedSession = await dbService.session.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          confidenceScore: factCheck.confidenceScore,
          answer: summaryData.answer,
          summary: summaryData.summary,
          report: reportMarkdown,
          supportingEvidence: factCheck.supportingEvidence,
          contradictoryEvidence: factCheck.contradictoryEvidence
        }
      });

      // Retrieve full populated session details to send to client
      const fullSession = await dbService.session.findUnique({
        where: { id: sessionId }
      });

      console.log(`[Orchestrator] Research session ${sessionId} successfully completed.`);
      onUpdate({
        type: 'complete',
        data: fullSession
      });

    } catch (error: any) {
      console.error(`[Orchestrator] Execution failed for session ${sessionId}:`, error.message);
      
      await dbService.session.update({
        where: { id: sessionId },
        data: { status: 'FAILED' }
      });

      onUpdate({
        type: 'error',
        message: error.message || 'An unexpected error occurred during autonomous research.'
      });
    }
  }
}
