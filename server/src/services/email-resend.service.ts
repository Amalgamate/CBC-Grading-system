import { Resend } from 'resend';
import prisma from '../config/database';
import { decrypt } from '../utils/encryption.util';
import { render } from '@react-email/render';
import * as React from 'react';

// Templates
import WelcomeEmail from '../templates/emails/WelcomeEmail';
import OnboardingEmail from '../templates/emails/OnboardingEmail';
import PasswordResetEmail from '../templates/emails/PasswordResetEmail';

export interface WelcomeEmailData {
  to: string;
  schoolName: string;
  adminName: string;
  loginUrl: string;
  schoolId?: string;
}

export interface OnboardingEmailData {
  to: string;
  schoolName: string;
  adminName: string;
  loginUrl: string;
  schoolId?: string;
  emailTemplates?: any;
}

export interface PasswordResetEmailData {
  to: string;
  userName: string;
  schoolName: string;
  resetLink: string;
  schoolId?: string;
}

export class EmailService {
  private static defaultFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  private static getResendClient(apiKey?: string) {
    // Fallback to null if no key is available anywhere
    const key = apiKey || process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
  }

  private static async getSchoolConfig(schoolId?: string) {
    if (!schoolId) return null;

    try {
      const config = await prisma.communicationConfig.findUnique({
        where: { schoolId }
      });

      if (config && config.emailEnabled && config.emailApiKey) {
        return {
          apiKey: decrypt(config.emailApiKey),
          from: config.emailFrom || this.defaultFrom,
          fromName: config.emailFromName || 'EDucore',
          emailTemplates: config.emailTemplates as any
        };
      }
    } catch (error) {
      console.error('Error fetching school email config:', error);
    }
    return null;
  }

  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const { to, schoolName, adminName, loginUrl, schoolId } = data;

    const config = await this.getSchoolConfig(schoolId);
    const client = this.getResendClient(config?.apiKey);
    const fromEmail = config?.from || this.defaultFrom;
    const fromName = config?.fromName || 'EDucore';

    if (!client) {
      console.warn(`⚠️ Skipped Welcome Email to ${to}: No Resend API Key configured.`);
      return;
    }

    try {
      const html = await render(
        React.createElement(WelcomeEmail, {
          schoolName,
          adminName,
          loginUrl,
          customHeading: config?.emailTemplates?.welcome?.heading,
          customBody: config?.emailTemplates?.welcome?.body
        })
      );

      const response = await client.emails.send({
        from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
        to: [to],
        subject: `Welcome to ${schoolName} on EDucore!`,
        html,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log(`📧 Welcome email sent to ${to} (ID: ${response.data?.id})`);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
    }
  }

  static async sendOnboardingEmail(data: OnboardingEmailData): Promise<void> {
    const { to, schoolName, adminName, loginUrl, schoolId } = data;

    const config = await this.getSchoolConfig(schoolId);
    const client = this.getResendClient(config?.apiKey);
    const fromEmail = config?.from || this.defaultFrom;
    const fromName = config?.fromName || 'EDucore';

    if (!client) {
      console.warn(`⚠️ Skipped Onboarding Email to ${to}: No Resend API Key configured.`);
      return;
    }

    try {
      const html = await render(
        React.createElement(OnboardingEmail, {
          schoolName,
          adminName,
          loginUrl,
          customHeading: config?.emailTemplates?.onboarding?.heading,
          customBody: config?.emailTemplates?.onboarding?.body
        })
      );

      const response = await client.emails.send({
        from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
        to: [to],
        subject: `Your Guide to Setting Up ${schoolName}`,
        html,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log(`📧 Onboarding email sent to ${to} (ID: ${response.data?.id})`);
    } catch (error) {
      console.error('❌ Failed to send onboarding email:', error);
    }
  }

  static async sendPasswordReset(data: PasswordResetEmailData): Promise<void> {
    const { to, userName, schoolName, resetLink, schoolId } = data;

    const config = await this.getSchoolConfig(schoolId);
    const client = this.getResendClient(config?.apiKey);
    const fromEmail = config?.from || this.defaultFrom;
    const fromName = config?.fromName || 'EDucore';

    if (!client) {
      console.warn(`⚠️ Skipped Password Reset Email to ${to}: No Resend API Key configured.`);
      // For password reset, we might want to throw if it's critical, 
      // but for now logging is safer than crashing the api.
      return;
    }

    try {
      const html = await render(
        React.createElement(PasswordResetEmail, {
          schoolName,
          userName,
          resetLink
        })
      );

      const response = await client.emails.send({
        from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
        to: [to],
        subject: `Password Reset Request - ${schoolName}`,
        html,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log(`📧 Password reset email sent to ${to} (ID: ${response.data?.id})`);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }
}
