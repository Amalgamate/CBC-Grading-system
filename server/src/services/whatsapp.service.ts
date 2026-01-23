/**
 * WhatsApp Service using Africa's Talking
 * Handles sending WhatsApp messages to parents
 * 
 * @module services/whatsapp.service
 */

import axios from 'axios';

interface WhatsAppMessage {
  to: string; // Phone number in international format (+254...)
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

class WhatsAppService {
  private username: string;
  private apiKey: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
    this.apiKey = process.env.AFRICASTALKING_API_KEY || '';
    this.baseUrl = 'https://api.africastalking.com/version1';
    this.enabled = !!this.apiKey && this.apiKey !== '';

    if (!this.enabled) {
      console.warn('[WhatsApp Service] API key not configured. Messages will be simulated.');
    }
  }

  /**
   * Format phone number to international format
   * @param phone - Phone number (e.g., 0712345678 or +254712345678)
   * @returns Formatted phone number (+254712345678)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove spaces and special characters
    let formatted = phone.replace(/[\s\-\(\)]/g, '');

    // If starts with 0, replace with +254
    if (formatted.startsWith('0')) {
      formatted = '+254' + formatted.substring(1);
    }

    // If starts with 254, add +
    if (formatted.startsWith('254')) {
      formatted = '+' + formatted;
    }

    // If doesn't start with +, assume Kenya and add +254
    if (!formatted.startsWith('+')) {
      formatted = '+254' + formatted;
    }

    return formatted;
  }

  /**
   * Send WhatsApp message via Africa's Talking
   * @param params - Message parameters
   * @returns Promise with send result
   */
  async sendMessage(params: WhatsAppMessage): Promise<{
    success: boolean;
    messageId?: string;
    message: string;
    error?: string;
  }> {
    try {
      const formattedPhone = this.formatPhoneNumber(params.to);

      // If not enabled, simulate sending
      if (!this.enabled) {
        console.log('[WhatsApp Service] SIMULATED MESSAGE:');
        console.log(`  To: ${formattedPhone}`);
        console.log(`  Message: ${params.message}`);
        return {
          success: true,
          messageId: `sim_${Date.now()}`,
          message: 'Message simulated (API key not configured)',
        };
      }

      // Prepare request
      const requestData = {
        username: this.username,
        to: formattedPhone,
        message: params.message,
      };

      // Send via Africa's Talking API
      const response = await axios.post(
        `${this.baseUrl}/messaging`,
        new URLSearchParams(requestData as any).toString(),
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );

      if (response.data.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return {
          success: true,
          messageId: response.data.SMSMessageData.Recipients[0].messageId,
          message: 'WhatsApp message sent successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to send WhatsApp message',
          error: response.data.SMSMessageData?.Recipients?.[0]?.status || 'Unknown error',
        };
      }
    } catch (error: any) {
      console.error('[WhatsApp Service] Error:', error.message);
      return {
        success: false,
        message: 'Failed to send WhatsApp message',
        error: error.message,
      };
    }
  }

  /**
   * Send assessment completion notification to parent
   */
  async sendAssessmentNotification(params: {
    parentPhone: string;
    parentName: string;
    learnerName: string;
    assessmentType: string; // 'Formative' or 'Summative'
    subject?: string;
    grade?: string;
    term?: string;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const { parentPhone, parentName, learnerName, assessmentType, subject, grade, term } = params;

    // Construct message
    let message = `Dear ${parentName},\n\n`;
    message += `${assessmentType} assessment has been completed for ${learnerName}`;
    
    if (grade) message += ` (${grade})`;
    if (subject) message += ` - ${subject}`;
    if (term) message += ` - ${term}`;
    
    message += `.\n\n`;
    message += `You can view the results by logging into the parent portal.\n\n`;
    message += `Regards,\nZawadi JRN Academy`;

    return await this.sendMessage({
      to: parentPhone,
      message,
    });
  }

  /**
   * Send bulk assessment notifications to multiple parents
   */
  async sendBulkAssessmentNotifications(notifications: Array<{
    parentPhone: string;
    parentName: string;
    learnerName: string;
    assessmentType: string;
    subject?: string;
    grade?: string;
    term?: string;
  }>): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    results: Array<{ phone: string; success: boolean; error?: string }>;
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      const result = await this.sendAssessmentNotification(notification);
      
      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      results.push({
        phone: notification.parentPhone,
        success: result.success,
        error: result.error,
      });

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: failed === 0,
      sent,
      failed,
      results,
    };
  }

  /**
   * Send custom message to parent
   */
  async sendCustomMessage(params: {
    parentPhone: string;
    parentName: string;
    message: string;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const formattedMessage = `Dear ${params.parentName},\n\n${params.message}\n\nRegards,\nZawadi JRN Academy`;

    return await this.sendMessage({
      to: params.parentPhone,
      message: formattedMessage,
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
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const message = `Dear ${params.parentName},\n\n` +
      `This is a reminder that the school fee balance for ${params.learnerName} is KES ${params.amountDue.toLocaleString()}.\n\n` +
      `Due date: ${params.dueDate}\n\n` +
      `Please make payment at your earliest convenience.\n\n` +
      `Regards,\nZawadi JRN Academy`;

    return await this.sendMessage({
      to: params.parentPhone,
      message,
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
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const message = `Dear ${params.parentName},\n\n` +
      `${params.title}\n\n` +
      `${params.content}\n\n` +
      `Regards,\nZawadi JRN Academy`;

    return await this.sendMessage({
      to: params.parentPhone,
      message,
    });
  }
}

export const whatsappService = new WhatsAppService();
