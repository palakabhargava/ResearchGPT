import { OpenAIService } from '../services/OpenAIService';
import { dbService } from '../utils/db';

export interface SummarizationOutput {
  answer: string;
  summary: string;
}

export class SummarizationAgent {
  static async run(
    sessionId: string,
    query: string,
    assertions: any[],
    supportingEvidence: string[],
    contradictoryEvidence: string[],
    onStepUpdate: (title: string, message: string, status: 'RUNNING' | 'COMPLETED' | 'FAILED') => void
  ): Promise<SummarizationOutput> {
    const stepId = await dbService.step.create({
      data: {
        sessionId,
        agentName: 'SUMMARIZATION_AGENT',
        title: 'Synthesizing key insights',
        status: 'RUNNING',
        message: 'Drafting high-level answer and executive summary.'
      }
    });
    onStepUpdate('Synthesizing key insights', 'Drafting high-level answer and executive summary.', 'RUNNING');

    try {
      const summarizerPrompt = `
      You are the Summarization Agent in a multi-agent research team.
      The user asked: "${query}"

      Here is our verified evidence data:
      Assertions:
      ${JSON.stringify(assertions, null, 2)}
      
      Supporting Consensus:
      ${JSON.stringify(supportingEvidence, null, 2)}

      Contradictions & Outliers:
      ${JSON.stringify(contradictoryEvidence, null, 2)}

      Draft two items:
      1. "answer": A direct, brief answer to the user's question (1-3 sentences, bold key figures).
      2. "summary": A structured executive summary paragraph summarizing the overall landscape, segments, and timeline.

      Return the result strictly in JSON format matching this schema:
      {
        "answer": "Direct answer text here...",
        "summary": "Detailed executive summary paragraph..."
      }
      `;

      const responseText = await OpenAIService.chatCompletion([
        { role: 'system', content: 'You are an executive summaries editor. Return JSON.' },
        { role: 'user', content: summarizerPrompt }
      ], true);

      let result: SummarizationOutput = {
        answer: '',
        summary: ''
      };

      try {
        const parsed = JSON.parse(responseText);
        result = {
          answer: parsed.answer || 'No direct answer available.',
          summary: parsed.summary || 'No summary available.'
        };
      } catch (e) {
        console.warn('[SummarizationAgent] JSON parse error in Summarizer, generating fallback summary.');
      }

      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'COMPLETED',
          message: 'Insights summarized and executive drafts finalized.'
        }
      });
      onStepUpdate('Synthesizing key insights', 'Insights summarized and executive drafts finalized.', 'COMPLETED');

      return result;

    } catch (error: any) {
      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'FAILED',
          message: error.message
        }
      });
      onStepUpdate('Summarization failed', error.message, 'FAILED');
      throw error;
    }
  }
}
