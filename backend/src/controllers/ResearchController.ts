import { Response } from 'express';
import { dbService } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { AgentOrchestrator } from '../services/AgentOrchestrator';
import { PDFGenerator } from '../utils/PDFGenerator';

export class ResearchController {
  /**
   * Start a new research session. Creates the session in database and returns its ID.
   */
  static async createSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { query } = req.body;
      const userId = req.user?.id || 'mock-user-id-12345';

      if (!query) {
        return res.status(400).json({ message: 'Research query is required.' });
      }

      const session = await dbService.session.create({
        data: {
          userId,
          query,
          status: 'STARTED'
        }
      });

      res.status(201).json({ sessionId: session.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to create research session.' });
    }
  }

  /**
   * Stream research progress using Server-Sent Events (SSE).
   */
  static async streamSession(req: AuthenticatedRequest, res: Response) {
    const sessionId = req.params.id;

    const session = await dbService.session.findUnique({ where: { id: sessionId } });
    if (!session) {
      return res.status(404).json({ message: 'Research session not found.' });
    }

    // Initialize SSE Headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none',
      'Access-Control-Allow-Origin': '*'
    });

    res.write('retry: 10000\n\n');

    // Run deep research and stream updates
    AgentOrchestrator.executeResearch(sessionId, session.query, (update) => {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    }).catch((err: any) => {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    });

    // Handle client disconnect
    req.on('close', () => {
      console.log(`[SSE] Client closed connection for session: ${sessionId}`);
      res.end();
    });
  }

  /**
   * Retrieve list of past research sessions for the logged-in user.
   */
  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'mock-user-id-12345';
      const sessions = await dbService.session.findMany({
        where: { userId }
      });
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch history.' });
    }
  }

  /**
   * Retrieve details of a specific research session.
   */
  static async getSessionDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const sessionId = req.params.id;
      const session = await dbService.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return res.status(404).json({ message: 'Research session not found.' });
      }

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch session details.' });
    }
  }

  /**
   * Export the finalized research report as a PDF.
   */
  static async exportPDF(req: AuthenticatedRequest, res: Response) {
    try {
      const sessionId = req.params.id;
      const session = await dbService.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return res.status(404).json({ message: 'Research session not found.' });
      }

      if (session.status !== 'COMPLETED') {
        return res.status(400).json({ message: 'Cannot export PDF. Research session is not completed.' });
      }

      // Set PDF Headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ResearchGPT-${sessionId}.pdf"`);

      PDFGenerator.generateReportPDF(session, res);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to generate PDF.' });
    }
  }

  /**
   * Bookmark / save a compiled research report.
   */
  static async saveReport(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'mock-user-id-12345';
      const { sessionId, title, summary, report } = req.body;

      if (!sessionId || !title || !summary || !report) {
        return res.status(400).json({ message: 'Missing required fields for saving report.' });
      }

      const saved = await dbService.savedReport.create({
        data: {
          userId,
          sessionId,
          title,
          summary,
          report
        }
      });

      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to save report.' });
    }
  }

  /**
   * Fetch all saved reports for the user.
   */
  static async getSavedReports(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'mock-user-id-12345';
      const reports = await dbService.savedReport.findMany({
        where: { userId }
      });
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch saved reports.' });
    }
  }

  /**
   * Delete a saved report.
   */
  static async deleteSavedReport(req: AuthenticatedRequest, res: Response) {
    try {
      const reportId = req.params.id;
      await dbService.savedReport.delete({
        where: { id: reportId }
      });
      res.json({ message: 'Report deleted from saved list.' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to delete saved report.' });
    }
  }
}
