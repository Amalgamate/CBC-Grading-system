/**
 * WhatsApp Service using WhatsApp Web (whatsapp-web.js)
 * Handles sending WhatsApp messages through WhatsApp Web automation
 * 
 * @module services/whatsapp.service
 */

import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

interface WhatsAppMessage {
  to: string; // Phone number in international format (+254...)
  message: string;
}

class WhatsAppService {
  private clients: Map<string, Client> = new Map();
  private isReadyMap: Map<string, boolean> = new Map();
  private isInitializingMap: Map<string, boolean> = new Map();
  private qrCodeMap: Map<string, string | null> = new Map();
  private connectionStatusMap: Map<string, 'disconnected' | 'qr_needed' | 'authenticated' | 'initializing'> = new Map();

  constructor() {
    // We no longer auto-initialize a global client
  }

  /**
   * Initialize WhatsApp Web client for a specific school
   */
  async initialize(schoolId: string) {
    if (this.isInitializingMap.get(schoolId) || this.clients.has(schoolId)) {
      return;
    }

    this.isInitializingMap.set(schoolId, true);
    this.connectionStatusMap.set(schoolId, 'initializing');

    console.log(`[WhatsApp Service] Initializing WhatsApp Web client for school: ${schoolId}...`);

    try {
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: schoolId, // Unique ID for each school session
          dataPath: `./.wwebjs_auth` // base path, LocalAuth uses clientId to differentiate
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      this.clients.set(schoolId, client);

      // QR Code event
      client.on('qr', (qr) => {
        this.qrCodeMap.set(schoolId, qr);
        this.connectionStatusMap.set(schoolId, 'qr_needed');
        console.log(`[WhatsApp Service] QR Code generated for school ${schoolId}`);
      });

      // Ready event
      client.on('ready', () => {
        this.isReadyMap.set(schoolId, true);
        this.connectionStatusMap.set(schoolId, 'authenticated');
        this.qrCodeMap.set(schoolId, null);
        console.log(`[WhatsApp Service] ✅ WhatsApp Client for school ${schoolId} is ready!`);
      });

      // Authenticated event
      client.on('authenticated', () => {
        console.log(`[WhatsApp Service] ✅ WhatsApp for ${schoolId} authenticated successfully`);
        this.connectionStatusMap.set(schoolId, 'authenticated');
      });

      // Disconnected event
      client.on('disconnected', (reason: any) => {
        console.log(`[WhatsApp Service] ⚠️ WhatsApp for ${schoolId} disconnected:`, reason);
        this.isReadyMap.set(schoolId, false);
        this.connectionStatusMap.set(schoolId, 'disconnected');

        // Remove client so it can be re-initialized
        this.clients.delete(schoolId);
        this.isInitializingMap.delete(schoolId);
      });

      // Auth failure event
      client.on('auth_failure', (msg: any) => {
        console.error(`[WhatsApp Service] ❌ Auth failure for ${schoolId}:`, msg);
        this.connectionStatusMap.set(schoolId, 'qr_needed');
      });

      await client.initialize();
      this.isInitializingMap.set(schoolId, false);

    } catch (error: any) {
      console.error(`[WhatsApp Service] ❌ Initialization error for ${schoolId}:`, error.message);
      this.isInitializingMap.set(schoolId, false);
      this.connectionStatusMap.set(schoolId, 'disconnected');
      this.clients.delete(schoolId);
    }
  }

  /**
   * Get current connection status for a school
   */
  getStatus(schoolId: string): {
    status: 'disconnected' | 'qr_needed' | 'authenticated' | 'initializing';
    qrCode: string | null;
  } {
    return {
      status: this.connectionStatusMap.get(schoolId) || 'disconnected',
      qrCode: this.qrCodeMap.get(schoolId) || null
    };
  }

  /**
   * Format phone number to WhatsApp format
   */
  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/[\s\-\(\)]/g, '');
    if (formatted.startsWith('0')) formatted = '254' + formatted.substring(1);
    if (formatted.startsWith('+254')) formatted = formatted.substring(1);
    if (formatted.startsWith('+')) formatted = formatted.substring(1);
    if (!formatted.startsWith('254')) formatted = '254' + formatted;
    return `${formatted}@c.us`;
  }

  /**
   * Send WhatsApp message using a school's session
   */
  async sendMessage(params: WhatsAppMessage & { schoolId: string }): Promise<{
    success: boolean;
    messageId?: string;
    message: string;
    error?: string;
  }> {
    const { schoolId } = params;
    try {
      const client = this.clients.get(schoolId);
      const isReady = this.isReadyMap.get(schoolId);

      if (!client || !isReady) {
        // Trigger initialization if not already in progress
        this.initialize(schoolId);
        return {
          success: false,
          message: 'WhatsApp client for this school is not ready. Please go to settings to authenticate.',
          error: `Status: ${this.connectionStatusMap.get(schoolId) || 'disconnected'}`
        };
      }

      const formattedPhone = this.formatPhoneNumber(params.to);
      const sentMessage = await client.sendMessage(formattedPhone, params.message);

      return {
        success: true,
        messageId: sentMessage.id.id,
        message: 'WhatsApp message sent successfully'
      };

    } catch (error: any) {
      console.error(`[WhatsApp Service] ❌ Error sending message for ${schoolId}:`, error.message);
      return {
        success: false,
        message: 'Failed to send WhatsApp message',
        error: error.message
      };
    }
  }

  /**
   * Send assessment report via WhatsApp to parent
   */
  async sendAssessmentReport(data: {
    learnerId: string;
    learnerName: string;
    learnerGrade: string;
    parentPhone: string;
    parentName?: string;
    term: string;
    totalTests: number;
    averageScore?: string;
    overallGrade?: string;
    totalMarks?: number;
    maxPossibleMarks?: number;
    subjects?: Record<string, string | { score: number, grade: string }>;
    schoolName?: string;
    schoolId: string;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const { parentPhone, parentName, learnerName, learnerGrade, term, averageScore, overallGrade, subjects, schoolId } = data;

    const greeting = parentName ? `Dear *${parentName}*,` : 'Dear Parent,';
    const schoolNameHeader = data.schoolName ? `*${data.schoolName.toUpperCase()}*` : '*SCHOOL REPORT*';

    const LEARNING_AREA_MAP: Record<string, string> = {
      'MATHEMATICS': 'MAT', 'ENGLISH': 'ENG', 'KISWAHILI': 'KIS',
      'SCIENCE AND TECHNOLOGY': 'SCITECH', 'SOCIAL STUDIES': 'SST',
      'CHRISTIAN RELIGIOUS EDUCATION': 'CRE', 'ISLAMIC RELIGIOUS EDUCATION': 'IRE',
      'CREATIVE ARTS AND SPORTS': 'CREATIVE', 'AGRICULTURE AND NUTRITION': 'AGRNT',
      'ENVIRONMENTAL ACTIVITIES': 'ENV', 'MATHEMATICAL ACTIVITIES': 'MAT',
      'ENGLISH LANGUAGE ACTIVITIES': 'ENG', 'KISWAHILI LANGUAGE ACTIVITIES': 'KIS',
      'RELIGIOUS EDUCATION': 'RE'
    };

    let subjectsSummary = '';
    if (subjects && Object.keys(subjects).length > 0) {
      const subArray = Object.entries(subjects).map(([name, detail]) => {
        const upper = name.toUpperCase().trim();
        const code = LEARNING_AREA_MAP[upper] || (name.length > 8 ? name.substring(0, 8).toUpperCase() : name.toUpperCase());

        if (typeof detail === 'string') {
          return `• *${code}:* ${detail}`;
        } else {
          const gradeStr = detail.grade.includes('EE') ? `*${detail.grade}*` : detail.grade;
          return `• *${code}:* ${detail.score}% (${gradeStr})`;
        }
      });
      subjectsSummary = `\n\n*SUBJECT PERFORMANCE:*\n${subArray.join('\n')}`;
    }

    const currentYear = new Date().getFullYear();
    const message = `${schoolNameHeader}\n\n` +
      `${greeting}\n\n` +
      `Here is the ${term} ${currentYear} assessment report for:\n` +
      `👤 *${learnerName}* (${learnerGrade})\n\n` +
      `📊 *RESULTS SUMMARY:*\n` +
      `• Mean Score: *${averageScore || '0'}%*\n` +
      `• Overall Grade: *${overallGrade || 'N/A'}*\n` +
      `• Total Assessments: ${data.totalTests}` +
      `${subjectsSummary}\n\n` +
      `_This is an automated message. Please do not reply._`;

    return await this.sendMessage({
      to: parentPhone,
      message,
      schoolId
    });
  }

  /**
   * Send assessment notification to parent
   */
  async sendAssessmentNotification(params: {
    parentPhone: string;
    parentName: string;
    learnerName: string;
    assessmentType: string;
    subject?: string;
    grade?: string;
    term?: string;
    schoolId: string;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const { parentPhone, parentName, learnerName, assessmentType, subject, grade, term, schoolId } = params;

    let message = `Dear ${parentName},\n\n`;
    message += `${assessmentType} assessment has been completed for ${learnerName}`;
    if (subject) message += ` in ${subject}`;
    if (grade) message += `.\n\nGrade: ${grade}`;
    if (term) message += `\nTerm: ${term}`;
    message += `\n\nYou can view the full report in the parent portal.`;
    message += `\n\n_This is an automated notification._`;

    return await this.sendMessage({
      to: parentPhone,
      message,
      schoolId
    });
  }

  /**
   * Send bulk assessment notifications with batching
   */
  async sendBulkAssessmentNotifications(notifications: Array<any>, schoolId: string): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    message: string;
  }> {
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      try {
        const result = await this.sendAssessmentNotification({ ...notification, schoolId });
        if (result.success) sent++;
        else failed++;
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (error) {
        failed++;
      }
    }

    return {
      success: sent > 0,
      sent,
      failed,
      message: `Sent ${sent} messages, ${failed} failed`
    };
  }

  /**
   * Send custom message to parent
   */
  async sendCustomMessage(params: {
    parentPhone: string;
    message: string;
    schoolId: string;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    return await this.sendMessage({
      to: params.parentPhone,
      message: params.message,
      schoolId: params.schoolId
    });
  }

  /**
   * Send fee reminder to parent
   */
  async sendFeeReminder(params: {
    parentPhone: string;
    parentName: string;
    learnerName: string;
    amountDue: number;
    dueDate: string;
    schoolId: string;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const message = `Dear *${params.parentName}*,\n\n` +
      `This is a friendly reminder regarding school fees for *${params.learnerName}*.\n\n` +
      `*Amount Due:* KES ${params.amountDue.toLocaleString()}\n` +
      `*Due Date:* ${params.dueDate}\n\n` +
      `Please make payment at your earliest convenience.\n\n` +
      `For any queries, contact the school administration.\n\n` +
      `_This is an automated reminder._`;

    return await this.sendMessage({
      to: params.parentPhone,
      message,
      schoolId: params.schoolId
    });
  }

  /**
   * Send general announcement to parent
   */
  async sendAnnouncement(params: {
    parentPhone: string;
    parentName: string;
    title: string;
    content: string;
    schoolId: string;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const message = `Dear *${params.parentName}*,\n\n` +
      `*${params.title}*\n\n` +
      `${params.content}\n\n` +
      `Regards,\nSchool Administration`;

    return await this.sendMessage({
      to: params.parentPhone,
      message,
      schoolId: params.schoolId
    });
  }
}

export const whatsappService = new WhatsAppService();
