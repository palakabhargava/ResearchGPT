import { OpenAIService } from '../services/OpenAIService';
import { dbService } from '../utils/db';

export class ReportGenerator {
  static async run(
    sessionId: string,
    query: string,
    answer: string,
    summary: string,
    findings: any[],
    sources: any[],
    supportingEvidence: string[],
    contradictoryEvidence: string[],
    onStepUpdate: (title: string, message: string, status: 'RUNNING' | 'COMPLETED' | 'FAILED') => void
  ): Promise<string> {
    const stepId = await dbService.step.create({
      data: {
        sessionId,
        agentName: 'REPORT_GENERATOR',
        title: 'Assembling research report',
        status: 'RUNNING',
        message: 'Formatting final research report in comprehensive Markdown with tables, highlights, and citations.'
      }
    });
    onStepUpdate('Assembling research report', 'Formatting final research report in comprehensive Markdown with tables, highlights, and citations.', 'RUNNING');

    try {
      const sourcesContext = sources.map((s, idx) => `[Source ${idx + 1}] Title: ${s.title}, URL: ${s.url}, Snippet: ${s.description}`).join('\n');

      const reportPrompt = `
      You are the Report Generator Agent in a multi-agent research team.
      Your task is to generate a comprehensive, highly professional, production-grade Markdown report answering: "${query}".

      You MUST synthesize the information provided below into a detailed document. Include markdown tables, lists, and bold headings to ensure the report looks premium and matches a $100M startup presentation.

      Inputs:
      - Direct Answer: ${answer}
      - Executive Summary: ${summary}
      - Scraped Findings Count: ${findings.length}
      - Sources List:
      ${sourcesContext}
      - Supporting Consensus Points:
      ${JSON.stringify(supportingEvidence, null, 2)}
      - Contradictions/Outliers:
      ${JSON.stringify(contradictoryEvidence, null, 2)}

      Report Layout Requirements:
      1. # [Title of Research] (Make it professional and specific)
      2. ## Direct Answer (Place in a highlighted or blockquote style)
      3. ## Executive Summary
      4. ## Key Analytical Insights (In-depth analysis of metrics, market size, growth trends, etc. Include at least one data comparison table!)
      5. ## Consensus & Discrepancies (Compare supporting vs. contradictory data points)
      6. ## Citation References (List sources numerically with active clickable markdown links)

      Use inline citations like [1] or [2] linking to your numbered references at the end.
      Ensure clean Markdown formatting. Do not output JSON, return ONLY the raw Markdown text.
      `;

      const markdownReport = await OpenAIService.chatCompletion([
        { role: 'system', content: 'You are an elite research report writer. Return pure Markdown.' },
        { role: 'user', content: reportPrompt }
      ], false);

      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'COMPLETED',
          message: 'Research report compiled successfully.'
        }
      });
      onStepUpdate('Assembling research report', 'Research report compiled successfully.', 'COMPLETED');

      return markdownReport;

    } catch (error: any) {
      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'FAILED',
          message: error.message
        }
      });
      onStepUpdate('Report assembly failed', error.message, 'FAILED');
      throw error;
    }
  }
}
