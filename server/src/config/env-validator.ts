import 'dotenv/config';

interface EnvRequirement {
    key: string;
    required: boolean;
    description: string;
    example?: string;
}

const REQUIREMENTS: EnvRequirement[] = [
    { key: 'PORT', required: true, description: 'Server port (e.g., 5000)' },
    { key: 'NODE_ENV', required: true, description: 'Environment (development/production)' },
    { key: 'DATABASE_URL', required: true, description: 'Prisma database connection string' },
    { key: 'JWT_SECRET', required: true, description: 'Secret key for signing tokens' },
    { key: 'FRONTEND_URL', required: true, description: 'URL of the frontend application' },
    { key: 'RESEND_API_KEY', required: true, description: 'API Key for Resend email service' },
    { key: 'EMAIL_FROM', required: true, description: 'Default sender email address' },
    { key: 'SMTP_HOST', required: false, description: 'SMTP host (fallback for legacy services)' },
    { key: 'SMTP_USER', required: false, description: 'SMTP username' },
    { key: 'SMTP_PASS', required: false, description: 'SMTP password' },
];

/**
 * Validates that all required environment variables are set.
 * Exits the process with an error message if any are missing.
 */
export function validateEnvironment(): void {
    console.log('🔍 Validating environment variables...');
    const missing: string[] = [];
    const warnings: string[] = [];

    for (const req of REQUIREMENTS) {
        const val = process.env[req.key];
        if (!val) {
            if (req.required) {
                missing.push(`   ❌ ${req.key.padEnd(20)} | ${req.description}`);
            } else {
                warnings.push(`   ⚠️ ${req.key.padEnd(20)} | ${req.description} (Recommended)`);
            }
        }
    }

    if (warnings.length > 0) {
        console.warn('--- ENVIRONMENT WARNINGS ---');
        warnings.forEach(w => console.warn(w));
        console.warn('---------------------------\n');
    }

    if (missing.length > 0) {
        console.error('\n' + '!'.repeat(50));
        console.error('❌ CRITICAL CONFIGURATION ERROR');
        console.error('!'.repeat(50));
        console.error('The following environment variables are MISSING:');
        missing.forEach(m => console.error(m));
        console.error('\nPlease check your .env file or deployment portal.');
        console.error('Refer to .env.example for details.');
        console.error('!'.repeat(50) + '\n');
        process.exit(1);
    }

    console.log('✅ Environment validation passed');
}
