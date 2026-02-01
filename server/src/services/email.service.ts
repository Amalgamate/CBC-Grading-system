import nodemailer from 'nodemailer';

export interface WelcomeEmailData {
  to: string;
  schoolName: string;
  adminName: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  to: string;
  userName: string;
  schoolName: string;
  resetLink: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const { to, schoolName, adminName, loginUrl } = data;

    const brandColor = '#1e3a8a'; // Industry standard blue

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 80px; height: 80px; margin-bottom: 10px; }
          .content { background: #f9fafb; padding: 25px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 0.875rem; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/logo-educore.png" alt="EDucore Logo" class="logo">
            <h1 style="color: ${brandColor};">Welcome to EDucore!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${adminName}</strong>,</p>
            <p>Congratulations! Your school, <strong>${schoolName}</strong>, has been successfully registered on EDucore V1.</p>
            <p>We are excited to help you streamline your school management, from CBC assessments to real-time reporting.</p>
            <p>You can now log in to your dashboard to complete your school profile and start managing your learners.</p>
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Log In to Dashboard</a>
            </div>
            <p style="margin-top: 20px;">If the button above doesn't work, copy and paste this link into your browser:<br>
            <a href="${loginUrl}">${loginUrl}</a></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EDucore V1. All rights reserved.</p>
            <p>You received this email because you signed up for an EDucore account.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${schoolName} via EDucore" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: `Welcome to ${schoolName} on EDucore!`,
        html,
      });
      console.log(`📧 Welcome email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // We don't throw here to avoid breaking the registration flow
    }
  }

  static async sendPasswordReset(data: PasswordResetEmailData): Promise<void> {
    const { to, userName, schoolName, resetLink } = data;

    const brandColor = '#1e3a8a';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 80px; height: 80px; margin-bottom: 10px; }
          .content { background: #f9fafb; padding: 25px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 0.875rem; color: #6b7280; text-align: center; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/logo-educore.png" alt="EDucore Logo" class="logo">
            <h1 style="color: ${brandColor};">Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password for your EDucore account at <strong>${schoolName}</strong>.</p>
            <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 20px;">If the button above doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}">${resetLink}</a></p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share your password with anyone</li>
                <li>This link expires in 1 hour for your security</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EDucore V1. All rights reserved.</p>
            <p>This is an automated security email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${schoolName} via EDucore" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: `Password Reset Request - ${schoolName}`,
        html,
      });
      console.log(`📧 Password reset email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error; // We throw here because password reset is critical
    }
  }
}
