import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class PDFGenerator {
  /**
   * Generates a beautifully styled PDF from a research session and streams it to the HTTP response.
   */
  static generateReportPDF(session: any, res: Response): void {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true // Allows two-pass page numbering
    });

    // Pipe the PDF directly to Express response
    doc.pipe(res);

    // Color Palette
    const primaryColor = '#4F46E5'; // Premium Indigo
    const secondaryColor = '#0F172A'; // Slate 900
    const bodyColor = '#334155'; // Slate 700
    const lightBg = '#F8FAFC'; // Slate 50
    const borderColor = '#E2E8F0'; // Slate 200

    // Typography setup
    doc.font('Helvetica');

    // --- Header ---
    doc.fontSize(10)
      .fillColor('#94A3B8')
      .text('RESEARCHGPT • AUTONOMOUS DEEP RESEARCH REPORT', 50, 30, { align: 'left' });
    
    doc.moveTo(50, 42).lineTo(545, 42).strokeColor('#E2E8F0').lineWidth(1).stroke();

    // --- Report Title ---
    doc.moveDown(2);
    doc.fontSize(24)
      .fillColor(secondaryColor)
      .font('Helvetica-Bold')
      .text(session.query.toUpperCase(), { align: 'left' });

    // --- Metadata row ---
    doc.moveDown(0.5);
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#64748B')
      .text(`Date Analyzed: ${new Date(session.createdAt).toLocaleDateString()}  |  Confidence Score: `, { listType: 'none', continued: true });
    
    doc.font('Helvetica-Bold')
      .fillColor(session.confidenceScore >= 80 ? '#10B981' : '#F59E0B')
      .text(`${session.confidenceScore}%`);

    doc.moveDown(1.5);

    // --- Direct Answer (Blockquote Callout) ---
    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(primaryColor)
      .text('DIRECT RESPONSE');

    doc.moveDown(0.4);

    // Draw shaded background box for Direct Answer
    const answerText = session.answer || 'No direct response available.';
    const boxHeight = doc.heightOfString(answerText, { width: 495 }) + 20;
    const startY = doc.y;

    doc.rect(50, startY, 495, boxHeight)
      .fill(lightBg);

    // Left Accent Border
    doc.rect(50, startY, 4, boxHeight)
      .fill(primaryColor);

    doc.fillColor(secondaryColor)
      .font('Helvetica-Oblique')
      .fontSize(11)
      .text(answerText, 65, startY + 10, { width: 465, align: 'justify' });

    doc.y = startY + boxHeight; // Reset position below the box
    doc.moveDown(2);

    // --- Executive Summary ---
    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(secondaryColor)
      .text('EXECUTIVE SUMMARY');
    
    doc.moveDown(0.5);
    doc.font('Helvetica')
      .fontSize(10.5)
      .fillColor(bodyColor)
      .text(session.summary || 'No summary available.', { align: 'justify', lineGap: 3 });

    doc.moveDown(2);

    // --- Findings / Full Report Content ---
    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(secondaryColor)
      .text('DETAILED ANALYSIS');
    
    doc.moveDown(0.5);

    // Parse simple sections from the report markdown
    const reportText = session.report || '';
    const lines = reportText.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('###')) {
        doc.moveDown(0.6);
        doc.fontSize(11).fillColor(secondaryColor).font('Helvetica-Bold').text(line.replace('###', '').trim());
        doc.font('Helvetica').fontSize(10).fillColor(bodyColor);
      } else if (line.startsWith('##')) {
        doc.moveDown(1);
        doc.fontSize(12).fillColor(primaryColor).font('Helvetica-Bold').text(line.replace('##', '').trim());
        doc.font('Helvetica').fontSize(10).fillColor(bodyColor);
      } else if (line.startsWith('#')) {
        doc.moveDown(1.2);
        doc.fontSize(14).fillColor(secondaryColor).font('Helvetica-Bold').text(line.replace('#', '').trim());
        doc.font('Helvetica').fontSize(10).fillColor(bodyColor);
      } else if (line.startsWith('-') || line.startsWith('*')) {
        doc.fontSize(10).fillColor(bodyColor).font('Helvetica').text(`  •  ${line.substring(1).trim()}`, { lineGap: 2 });
      } else {
        // Strip basic markdown styles like **, *
        const cleanLine = line.replace(/\*\*|\*/g, '');
        doc.fontSize(10).fillColor(bodyColor).font('Helvetica').text(cleanLine, { lineGap: 2, align: 'justify' });
      }
    }

    doc.moveDown(2);

    // --- Sources Section ---
    doc.addPage(); // Start Sources on a fresh page
    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(secondaryColor)
      .text('VERIFIED CITATIONS');

    doc.moveDown(0.8);

    const sources = session.sources || [];
    if (sources.length === 0) {
      doc.fontSize(10).fillColor(bodyColor).font('Helvetica-Oblique').text('No external sources indexed.');
    } else {
      sources.forEach((source: any, idx: number) => {
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(secondaryColor)
          .text(`[${idx + 1}] ${source.title || 'Source Reference'}`);

        doc.fontSize(9)
          .font('Helvetica')
          .fillColor('#64748B')
          .text(`Source URL: `, { continued: true })
          .fillColor(primaryColor)
          .text(source.url, { link: source.url });

        doc.fontSize(9.5)
          .font('Helvetica-Oblique')
          .fillColor(bodyColor)
          .text(`"${source.description || 'Verified factual citation source.'}"`, { indent: 10 });

        doc.moveDown(1);
      });
    }

    // --- Two-pass Page Numbering ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
        .fillColor('#94A3B8')
        .text(`Page ${i + 1} of ${range.count}`, 50, 800, { align: 'center' });
    }

    doc.end();
  }
}
