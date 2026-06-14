import { OpenAIService } from '../services/OpenAIService';
import { ContextService } from '../services/ContextService';
import { dbService } from '../utils/db';

export interface SearchAgentOutput {
  findings: any[];
  sources: any[];
  images: any[];
}

export class SearchAgent {
  static async run(
    sessionId: string,
    query: string,
    onStepUpdate: (title: string, message: string, status: 'RUNNING' | 'COMPLETED' | 'FAILED') => void
  ): Promise<SearchAgentOutput> {
    const stepId = await dbService.step.create({
      data: {
        sessionId,
        agentName: 'SEARCH_AGENT',
        title: 'Generating search strategies',
        status: 'RUNNING',
        message: 'Decomposing search query into conceptual strategies.'
      }
    });

    onStepUpdate('Generating search strategies', 'Decomposing search query into conceptual strategies.', 'RUNNING');

    try {
      // 1. Decompose Query
      const decompositionPrompt = `
      You are the Search Agent in a multi-agent research team.
      Your task is to decompose the user's research question: "${query}" into 3 specific, distinct search queries that will yield high-quality, comprehensive information.
      Return the output strictly in JSON format as a list of strings:
      {
        "strategies": [
          "query 1",
          "query 2",
          "query 3"
        ]
      }
      `;

      const decompositionResponse = await OpenAIService.chatCompletion([
        { role: 'system', content: 'You are a professional search query optimizer. Return JSON.' },
        { role: 'user', content: decompositionPrompt }
      ], true);

      let strategies: string[] = [];
      try {
        const parsed = JSON.parse(decompositionResponse);
        strategies = parsed.strategies || [];
      } catch (e) {
        // Fallback strategy if JSON parsing fails
        strategies = [query];
      }

      await dbService.step.update({
        where: { id: stepId.id },
        data: {
          status: 'COMPLETED',
          message: `Decomposed query into: ${strategies.join(', ')}`
        }
      });
      onStepUpdate('Generating search strategies', `Decomposed query into: ${strategies.join(', ')}`, 'COMPLETED');

      // 2. Perform Web Search & Scraping
      const searchStep = await dbService.step.create({
        data: {
          sessionId,
          agentName: 'SEARCH_AGENT',
          title: 'Scraping search results',
          status: 'RUNNING',
          message: 'Initiating web searches using Context.dev API...'
        }
      });
      onStepUpdate('Scraping search results', 'Initiating web searches using Context.dev API...', 'RUNNING');

      const findingsList: any[] = [];
      const sourcesList: any[] = [];
      const imagesList: any[] = [];

      // Run searches in parallel
      const searchPromises = strategies.map(async (strategy) => {
        const searchResponse = await ContextService.search(strategy);
        
        for (const result of searchResponse.results.slice(0, 2)) { // Take top 2 results per strategy to optimize performance and rate limits
          // Save Finding
          const finding = await dbService.finding.create({
            data: {
              sessionId,
              url: result.url,
              title: result.title,
              description: result.description,
              markdown: result.markdown?.markdown || ''
            }
          });
          findingsList.push(finding);

          // Save Source
          const source = await dbService.source.create({
            data: {
              sessionId,
              url: result.url,
              title: result.title,
              description: result.description,
              relevance: result.relevance,
              screenshotUrl: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80&auto=format&fit=crop` // Default visual mockup
            }
          });
          sourcesList.push(source);

          // Scrape images for high relevance results
          if (result.relevance === 'high') {
            const scrapedImages = await ContextService.scrapeImages(result.url);
            for (const img of scrapedImages.slice(0, 2)) { // Limit to top 2 images per site
              const imageRecord = await dbService.image.create({
                data: {
                  sessionId,
                  url: result.url,
                  src: img.src,
                  type: img.type,
                  alt: img.alt || 'Scraped image asset',
                  width: img.enrichment?.width,
                  height: img.enrichment?.height,
                  category: img.enrichment?.type || 'other'
                }
              });
              imagesList.push(imageRecord);
            }
          }
        }
      });

      await Promise.all(searchPromises);

      await dbService.step.update({
        where: { id: searchStep.id },
        data: {
          status: 'COMPLETED',
          message: `Scraped ${findingsList.length} total findings and ${imagesList.length} images/charts.`
        }
      });
      onStepUpdate('Scraping search results', `Scraped ${findingsList.length} total findings and ${imagesList.length} images/charts.`, 'COMPLETED');

      return {
        findings: findingsList,
        sources: sourcesList,
        images: imagesList
      };

    } catch (error: any) {
      await dbService.step.create({
        data: {
          sessionId,
          agentName: 'SEARCH_AGENT',
          title: 'Search failed',
          status: 'FAILED',
          message: error.message
        }
      });
      onStepUpdate('Search failed', error.message, 'FAILED');
      throw error;
    }
  }
}
