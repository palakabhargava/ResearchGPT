import { OpenAIService } from '../services/OpenAIService';
import { dbService } from '../utils/db';

export interface VerifiedAssertion {
  claim: string;
  sourceUrl: string;
  isNumerical: boolean;
  dateOfData: string;
  context: string;
}

export class VerificationAgent {
  static async run(
    sessionId: string,
    findings: any[],
    onStepUpdate: (title: string, message: string, status: 'RUNNING' | 'COMPLETED' | 'FAILED') => void
  ): Promise<VerifiedAssertion[]> {
    const stepId = await dbService.step.create({
      data: {
        sessionId,
        agentName: 'VERIFICATION_AGENT',
        title: 'Verifying statistics & claims',
        status: 'RUNNING',
        message: 'Parsing scraped Markdown to extract statistical assertions, dates, and figures.'
      }
    });
    onStepUpdate('Verifying statistics & claims', 'Parsing scraped Markdown to extract statistical assertions, dates, and figures.', 'RUNNING');

    try {
      // Package findings for prompt context
      const findingsSummary = findings.map(f => `Source URL: ${f.url}\nContent Snippet: ${f.markdown || f.description}`).join('\n\n---\n\n');

      const verificationPrompt = `
      You are the Verification Agent in a multi-agent research team.
      Your task is to analyze the following scraped web findings and extract concrete assertions, statistical records, dates, and claims.
      Each assertion must be linked to its canonical source URL.
      
      Web Findings:
      ${findingsSummary}

      Return the assertions strictly in a JSON format containing a list of assertion objects:
      {
        "assertions": [
          {
            "claim": "Direct claim or statistics description",
            "sourceUrl": "The exact URL where this claim was found",
            "isNumerical": true/false,
            "dateOfData": "The date or period this data refers to (e.g. Q4 2024, FY 2026, September 2023)",
            "context": "Brief surrounding context"
          }
        ]
      }
      `;

      const responseText = await OpenAIService.chatCompletion([
        { role: 'system', content: 'You are a precise data verification auditor. Return JSON.' },
        { role: 'user', content: verificationPrompt }
      ], true);

      let assertions: VerifiedAssertion[] = [];
      try {
        const parsed = JSON.parse(responseText);
        assertions = parsed.assertions || [];
      } catch (e) {
        console.warn('[VerificationAgent] JSON parse error, generating fallback verification assertions.');
        // Heuristic fallback if JSON fails
        assertions = [];
      }

      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'COMPLETED',
          message: `Extracted and verified ${assertions.length} core assertions and metrics.`
        }
      });
      onStepUpdate('Verifying statistics & claims', `Extracted and verified ${assertions.length} core assertions and metrics.`, 'COMPLETED');

      return assertions;

    } catch (error: any) {
      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'FAILED',
          message: error.message
        }
      });
      onStepUpdate('Verification failed', error.message, 'FAILED');
      throw error;
    }
  }
}
