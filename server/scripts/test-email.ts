
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

import { EmailService } from '../src/services/email-resend.service';

async function testEmail() {
    console.log('Testing Resend Email Service...');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is missing in .env');
        process.exit(1);
    }

    console.log('API Key preset:', process.env.RESEND_API_KEY.slice(0, 5) + '...');

    try {
        // We'll test "Ticket Created" as it doesn't require a school ID in DB
        // and sends to the support email.

        // Override SUPPORT_EMAIL to ensure we see where it goes (or use the one in env)
        const testRecipient = 'delivered@resend.dev';
        process.env.SUPPORT_EMAIL = testRecipient;

        await EmailService.sendTicketCreated({
            schoolName: 'Test School',
            userName: 'Test User',
            ticketSubject: 'Test Ticket from Script',
            ticketPriority: 'High',
            ticketMessage: 'This is a test email sent from the verification script.',
            ticketId: 'TEST-123'
        });

        console.log('✅ Email trigger function called.');
    } catch (error) {
        console.error('❌ Error executing test:', error);
    }
}

testEmail();
