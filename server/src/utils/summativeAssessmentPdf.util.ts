/**
 * Summative Assessment PDF Report Generator
 * Generates professional landscape PDF reports for summative assessments
 */

import PDFDocument from 'pdfkit';
import { Stream } from 'stream';

// ============================================
// TYPES
// ============================================

export interface SchoolInfo {
  name: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  campus?: string;
  system?: string;
  logoPath?: string;
}

export interface AssessmentInfo {
  subject: string;
  grade: string;
  stream: string;
  learningArea: string;
  totalMarks: number;
  term: string;
  academicYear: string;
  dateGenerated: string;
  progress: string;
  completion: string;
  testStatus: 'Locked' | 'Open';
}

export interface StudentResult {
  admissionNo: string;
  name: string;
  score: number;
  descriptor?: string;
}

export interface AssessmentReportData {
  schoolInfo: SchoolInfo;
  assessmentInfo: AssessmentInfo;
  students: StudentResult[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get score category based on percentage
 */
function getScoreCategory(score: number, totalMarks: number): 'critical' | 'low' | 'medium' | 'high' {
  const percentage = (score / totalMarks) * 100;
  
  if (percentage < 25) return 'critical';
  if (percentage < 50) return 'low';
  if (percentage < 70) return 'medium';
  return 'high';
}

/**
 * Get performance descriptor based on score
 */
function getPerformanceDescriptor(score: number, totalMarks: number): string {
  const percentage = (score / totalMarks) * 100;
  
  if (percentage < 25) {
    return 'Is below expectations and requires intensive intervention.';
  } else if (percentage < 50) {
    return 'Approaching expectations with moderate support needed.';
  } else if (percentage < 70) {
    return 'Meets expectations and demonstrates proficiency.';
  } else if (percentage < 85) {
    return 'Exceeds expectations with strong performance.';
  } else {
    return 'Exceeds expectations with excellent understanding.';
  }
}

/**
 * Get color for score category
 */
function getScoreColor(category: 'critical' | 'low' | 'medium' | 'high'): string {
  switch (category) {
    case 'critical': return '#991b1b';
    case 'low': return '#92400e';
    case 'medium': return '#1e40af';
    case 'high': return '#166534';
  }
}

/**
 * Get background color for score badge
 */
function getScoreBgColor(category: 'critical' | 'low' | 'medium' | 'high'): string {
  switch (category) {
    case 'critical': return '#fee2e2';
    case 'low': return '#fef3c7';
    case 'medium': return '#dbeafe';
    case 'high': return '#dcfce7';
  }
}

// ============================================
// PDF GENERATOR CLASS
// ============================================

export class SummativeAssessmentPDFGenerator {
  private doc: typeof PDFDocument;
  private pageWidth: number = 842; // A4 Landscape
  private pageHeight: number = 595;
  private margin: number = 40;
  private currentY: number = 0;

  /**
   * Generate PDF report as a buffer
   */
  public async generatePDF(data: AssessmentReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        this.doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: {
            top: this.margin,
            bottom: this.margin,
            left: this.margin,
            right: this.margin
          }
        });

        // Collect PDF data in buffer
        const chunks: Buffer[] = [];
        this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        this.doc.on('end', () => resolve(Buffer.concat(chunks)));
        this.doc.on('error', reject);

        // Generate report content
        this.currentY = this.margin;
        this.renderHeader(data.schoolInfo);
        this.renderTitle(data.assessmentInfo);
        this.renderAssessmentInfo(data.assessmentInfo);
        this.renderStudentTable(data.students, data.assessmentInfo.totalMarks);
        this.renderFooter(data.assessmentInfo, data.schoolInfo);

        // Finalize PDF
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Render header section
   */
  private renderHeader(schoolInfo: SchoolInfo): void {
    const startY = this.currentY;

    // Draw blue border line
    this.doc
      .strokeColor('#1e3a8a')
      .lineWidth(3)
      .moveTo(this.margin, startY + 50)
      .lineTo(this.pageWidth - this.margin, startY + 50)
      .stroke();

    // School name
    this.doc
      .fontSize(20)
      .fillColor('#1e3a8a')
      .font('Helvetica-Bold')
      .text(schoolInfo.name, this.margin, startY, {
        width: 400,
        align: 'left'
      });

    // Location
    this.doc
      .fontSize(9)
      .fillColor('#666666')
      .font('Helvetica')
      .text(schoolInfo.location, this.margin, startY + 25);

    // Contact info (right side)
    const rightX = this.pageWidth - this.margin - 200;
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text(`Tel: ${schoolInfo.phone}`, rightX, startY, { width: 200, align: 'right' })
      .text(`Email: ${schoolInfo.email}`, rightX, startY + 12, { width: 200, align: 'right' })
      .text(`Web: ${schoolInfo.website}`, rightX, startY + 24, { width: 200, align: 'right' });

    this.currentY = startY + 65;
  }

  /**
   * Render title section
   */
  private renderTitle(assessmentInfo: AssessmentInfo): void {
    this.doc
      .fontSize(16)
      .fillColor('#1e3a8a')
      .font('Helvetica-Bold')
      .text('Summative Assessment Results', this.margin, this.currentY, {
        width: this.pageWidth - (this.margin * 2),
        align: 'center'
      });

    this.currentY += 22;

    this.doc
      .fontSize(11)
      .fillColor('#666666')
      .font('Helvetica')
      .text(assessmentInfo.subject, this.margin, this.currentY, {
        width: this.pageWidth - (this.margin * 2),
        align: 'center'
      });

    this.currentY += 25;
  }

  /**
   * Render assessment info grid
   */
  private renderAssessmentInfo(info: AssessmentInfo): void {
    const boxHeight = 50;
    const boxStartY = this.currentY;

    // Background
    this.doc
      .rect(this.margin, boxStartY, this.pageWidth - (this.margin * 2), boxHeight)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    // Grid items (4 columns)
    const columnWidth = (this.pageWidth - (this.margin * 2)) / 4;
    const items = [
      { label: 'GRADE', value: info.grade },
      { label: 'STREAM', value: info.stream },
      { label: 'LEARNING AREA', value: info.learningArea },
      { label: 'TOTAL MARKS', value: info.totalMarks.toString() }
    ];

    items.forEach((item, index) => {
      const x = this.margin + (columnWidth * index) + 10;
      
      this.doc
        .fontSize(8)
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .text(item.label, x, boxStartY + 12);

      this.doc
        .fontSize(10)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text(item.value, x, boxStartY + 28, {
          width: columnWidth - 20
        });
    });

    this.currentY += boxHeight + 10;

    // Secondary info (3 columns)
    const boxHeight2 = 40;
    const boxStartY2 = this.currentY;

    this.doc
      .rect(this.margin, boxStartY2, this.pageWidth - (this.margin * 2), boxHeight2)
      .fillAndStroke('#f1f5f9', '#e2e8f0');

    const columnWidth2 = (this.pageWidth - (this.margin * 2)) / 3;
    const items2 = [
      { label: 'TERM', value: info.term },
      { label: 'ACADEMIC YEAR', value: info.academicYear },
      { label: 'DATE GENERATED', value: info.dateGenerated }
    ];

    items2.forEach((item, index) => {
      const x = this.margin + (columnWidth2 * index) + 10;
      
      this.doc
        .fontSize(8)
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .text(item.label, x, boxStartY2 + 10);

      this.doc
        .fontSize(10)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text(item.value, x, boxStartY2 + 23, {
          width: columnWidth2 - 20
        });
    });

    this.currentY += boxHeight2 + 15;
  }

  /**
   * Render student results table
   */
  private renderStudentTable(students: StudentResult[], totalMarks: number): void {
    const tableStartY = this.currentY;
    const rowHeight = 30;
    const headerHeight = 35;

    // Column widths
    const colNo = 40;
    const colAdm = 80;
    const colScore = 80;
    const colDesc = 280;
    const colName = this.pageWidth - (this.margin * 2) - colNo - colAdm - colScore - colDesc;

    // Table header
    this.doc
      .rect(this.margin, tableStartY, this.pageWidth - (this.margin * 2), headerHeight)
      .fill('#1e3a8a');

    const headers = [
      { text: 'No', width: colNo, align: 'center' },
      { text: 'Adm No', width: colAdm, align: 'center' },
      { text: 'Name', width: colName, align: 'left' },
      { text: 'Score', width: colScore, align: 'center' },
      { text: 'Descriptor', width: colDesc, align: 'left' }
    ];

    let currentX = this.margin;
    headers.forEach(header => {
      this.doc
        .fontSize(9)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text(
          header.text.toUpperCase(),
          currentX + 10,
          tableStartY + 12,
          {
            width: header.width - 20,
            align: header.align as any
          }
        );
      currentX += header.width;
    });

    this.currentY = tableStartY + headerHeight;

    // Table rows
    students.forEach((student, index) => {
      const rowY = this.currentY;
      const category = getScoreCategory(student.score, totalMarks);
      const descriptor = student.descriptor || getPerformanceDescriptor(student.score, totalMarks);

      // Alternating row background
      if (index % 2 === 1) {
        this.doc
          .rect(this.margin, rowY, this.pageWidth - (this.margin * 2), rowHeight)
          .fill('#f8fafc');
      }

      // Border line
      this.doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(this.margin, rowY + rowHeight)
        .lineTo(this.pageWidth - this.margin, rowY + rowHeight)
        .stroke();

      currentX = this.margin;

      // No
      this.doc
        .fontSize(9)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text((index + 1).toString(), currentX, rowY + 10, {
          width: colNo,
          align: 'center'
        });
      currentX += colNo;

      // Adm No
      this.doc
        .text(student.admissionNo, currentX, rowY + 10, {
          width: colAdm,
          align: 'center'
        });
      currentX += colAdm;

      // Name
      this.doc
        .font('Helvetica-Bold')
        .text(student.name.toUpperCase(), currentX + 10, rowY + 10, {
          width: colName - 20,
          align: 'left'
        });
      currentX += colName;

      // Score badge
      const badgeWidth = 50;
      const badgeX = currentX + (colScore - badgeWidth) / 2;
      this.doc
        .roundedRect(badgeX, rowY + 8, badgeWidth, 18, 3)
        .fillAndStroke(getScoreBgColor(category), getScoreColor(category));

      this.doc
        .fontSize(10)
        .fillColor(getScoreColor(category))
        .font('Helvetica-Bold')
        .text(student.score.toString(), badgeX, rowY + 11, {
          width: badgeWidth,
          align: 'center'
        });
      currentX += colScore;

      // Descriptor
      this.doc
        .fontSize(8.5)
        .fillColor('#64748b')
        .font('Helvetica-Oblique')
        .text(descriptor, currentX + 10, rowY + 10, {
          width: colDesc - 20,
          align: 'left'
        });

      this.currentY += rowHeight;
    });
  }

  /**
   * Render footer section
   */
  private renderFooter(assessmentInfo: AssessmentInfo, schoolInfo: SchoolInfo): void {
    this.currentY += 15;

    // Footer background
    this.doc
      .rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 30)
      .fillAndStroke('#f1f5f9', '#e2e8f0');

    // Left side - Progress and status
    this.doc
      .fontSize(8)
      .fillColor('#64748b')
      .font('Helvetica')
      .text(
        `Progress: ${assessmentInfo.progress}`,
        this.margin + 10,
        this.currentY + 10
      );

    // Completion badge
    this.doc
      .roundedRect(this.margin + 100, this.currentY + 8, 80, 14, 2)
      .fill('#22c55e');

    this.doc
      .fontSize(7)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text(
        `${assessmentInfo.completion} Complete`,
        this.margin + 105,
        this.currentY + 11,
        { width: 70, align: 'center' }
      );

    // Test status
    this.doc
      .fontSize(8)
      .fillColor('#64748b')
      .font('Helvetica')
      .text(
        `Test Status: ${assessmentInfo.testStatus}`,
        this.margin + 195,
        this.currentY + 10
      );

    // Right side - System info
    const rightText = `Generated by EDucore Assessment System\n${schoolInfo.campus || 'Template Campus'} | ${schoolInfo.system || 'CBC System'}`;
    this.doc
      .fontSize(7.5)
      .fillColor('#64748b')
      .font('Helvetica')
      .text(
        rightText,
        this.pageWidth - this.margin - 200,
        this.currentY + 8,
        { width: 190, align: 'right', lineGap: 2 }
      );
  }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Generate summative assessment PDF report
 */
export async function generateSummativeAssessmentPDF(
  data: AssessmentReportData
): Promise<Buffer> {
  const generator = new SummativeAssessmentPDFGenerator();
  return generator.generatePDF(data);
}
