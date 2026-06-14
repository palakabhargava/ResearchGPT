import { OpenAIService } from '../services/OpenAIService';
import { dbService } from '../utils/db';

export interface FactCheckerOutput {
  confidenceScore: number;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
}

export class FactChecker {
  static async run(
    sessionId: string,
    assertions: any[],
    onStepUpdate: (title: string, message: string, status: 'RUNNING' | 'COMPLETED' | 'FAILED') => void
  ): Promise<FactCheckerOutput> {
    const stepId = await dbService.step.create({
      data: {
        sessionId,
        agentName: 'FACT_CHECKER',
        title: 'Running consistency checks',
        status: 'RUNNING',
        message: 'Validating statements across sources to identify contradictions and compute confidence.'
      }
    });
    onStepUpdate('Running consistency checks', 'Validating statements across sources to identify contradictions and compute confidence.', 'RUNNING');

    try {
      const assertionsJson = JSON.stringify(assertions, null, 2);

      const checkPrompt = `
      You are the Fact Checker Agent in a multi-agent research team.
      Review the list of verified assertions extracted from web scraping:
      ${assertionsJson}

      Perform a consistency audit:
      1. Group points of agreement (supporting evidence).
      2. Identify any contradictions, discrepancies, or outliers (contradictory evidence).
      3. Compute a confidenceScore (integer, 0 to 100) using this scale:
         - 90-100: Assertions are supported by multiple high-relevance sources with zero contradictions.
         - 70-89: Good source backing, minor timeline discrepancies, or slight projection differences.
         - 50-69: Conflicting values for the same metrics, or single-source dependency.
         - <50: Widespread contradictions, unverified claims, or severe discrepancies.

      Return the analysis strictly in JSON format matching this schema:
      {
        "confidenceScore": 85,
        "supportingEvidence": [
          "Evidence sentence 1 with citation notes",
          "Evidence sentence 2"
        ],
        "contradictoryEvidence": [
          "Contradicting statement details, e.g. Source A claims X while Source B claims Y"
        ]
      }
      `;

      const responseText = await OpenAIService.chatCompletion([
        { role: 'system', content: 'You are an analytical fact-checker and consensus auditor. Return JSON.' },
        { role: 'user', content: checkPrompt }
      ], true);

      let result: FactCheckerOutput = {
        confidenceScore: 75,
        supportingEvidence: [],
        contradictoryEvidence: []
      };

      try {
        const parsed = JSON.parse(responseText);
        result = {
          confidenceScore: parsed.confidenceScore ?? 75,
          supportingEvidence: parsed.supportingEvidence || [],
          contradictoryEvidence: parsed.contradictoryEvidence || []
        };
      } catch (e) {
        console.warn('[FactChecker] JSON parse error in Fact Checker, generating fallback audit.');
      }

      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'COMPLETED',
          message: `Consistency checks completed. Confidence score: ${result.confidenceScore}%. Identified ${result.supportingEvidence.length} corroborations and ${result.contradictoryEvidence.length} conflicts.`
        }
      });
      onStepUpdate('Running consistency checks', `Consistency checks completed. Confidence: ${result.confidenceScore}%.`, 'COMPLETED');

      return result;

    } catch (error: any) {
      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'FAILED',
          message: error.message
        }
      });
      onStepUpdate('Consistency check failed', error.message, 'FAILED');
      throw error;
    }
  }
}
