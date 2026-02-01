import nodemailer from 'nodemailer';

export interface WelcomeEmailData {
    to: string;
    schoolName: string;
    adminName: string;
    loginUrl: string;
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
            <img src="https://educore.v1/logo-zawadi.png" alt="EDucore Logo" class="logo">
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
}
