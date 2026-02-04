
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// Load env vars from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import local services
// Note: We need to use relative paths from where ts-node runs or standard imports if ts-config handles it
import prisma from '../src/config/database';
import { EmailService } from '../src/services/email-resend.service';
import { SmsService } from '../src/services/sms.service';

async function registerMella() {
    console.log('🚀 Starting registration test for Mella...');

    const TEST_DATA = {
        schoolName: 'Mellacademy',
        email: 'mellagitonga@gmail.com',
        phone: '0713612141',
        fullName: 'Mella Gitonga',
        address: 'Nairobi, Kenya',
        county: 'Nairobi',
        password: 'Password123!@#' // Strong password meeting criteria
    };

    try {
        // 1. Cleanup existing data (Idempotency)
        console.log('🧹 Cleaning up previous test data...');

        // Find user to get school ID
        const existingUser = await prisma.user.findUnique({
            where: { email: TEST_DATA.email }
        });

        if (existingUser) {
            console.log(`Found existing user: ${existingUser.id}`);
            // Delete user
            await prisma.user.delete({ where: { id: existingUser.id } });

            // If they had a school, we normally delete it too for a clean slate
            if (existingUser.schoolId) {
                // Delete streams, branches, sequences first ideally, but cascade might handle it?
                // Prisma requires manual deletion if cascade isn't set up perfectly in schema.
                // For safety, let's just create a unique school name if we can't delete.
                // But actually, let's try to find school by name.
            }
        }

        const existingSchool = await prisma.school.findFirst({
            where: { name: TEST_DATA.schoolName }
        });

        if (existingSchool) {
            console.log(`Found existing school: ${existingSchool.name}`);
            // To properly delete, we might need to delete related records.
            // For this test script, let's just attempt a delete and catch error if it fails on FK
            try {
                // Delete streams
                await prisma.streamConfig.deleteMany({ where: { schoolId: existingSchool.id } });
                // Delete branches
                await prisma.branch.deleteMany({ where: { schoolId: existingSchool.id } });
                // Delete admission sequences
                await prisma.admissionSequence.deleteMany({ where: { schoolId: existingSchool.id } });
                // Delete users (again to be sure)
                await prisma.user.deleteMany({ where: { schoolId: existingSchool.id } });

                // Delete school
                await prisma.school.delete({ where: { id: existingSchool.id } });
                console.log('Existing school deleted.');
            } catch (e) {
                console.warn('Could not fully clean up school (might have other related records). Proceeding anyway...', e.message);
            }
        }

        // 2. Execute Registration Logic (Mirrors OnboardingController.registerFull)
        console.log('📝 Creating new school and user...');

        const result = await prisma.$transaction(async (tx) => {
            // Create School
            const school = await tx.school.create({
                data: {
                    name: TEST_DATA.schoolName,
                    address: TEST_DATA.address,
                    county: TEST_DATA.county,
                    phone: TEST_DATA.phone,
                    email: TEST_DATA.email,
                    active: true,
                    status: 'TRIAL',
                    trialStart: new Date(),
                    trialDays: 30,
                    admissionFormatType: 'BRANCH_PREFIX_START',
                    branchSeparator: '-',
                }
            });

            // Create Branch
            const branch = await tx.branch.create({
                data: {
                    schoolId: school.id,
                    name: 'Main Campus',
                    code: 'MC',
                    address: TEST_DATA.address,
                    phone: TEST_DATA.phone,
                    email: TEST_DATA.email,
                    active: true,
                },
            });

            // Admission Sequence
            await tx.admissionSequence.create({
                data: {
                    schoolId: school.id,
                    academicYear: new Date().getFullYear(),
                    currentValue: 0,
                },
            });

            // Streams
            for (const streamName of ['A', 'B', 'C', 'D']) {
                await tx.streamConfig.create({
                    data: {
                        schoolId: school.id,
                        name: streamName,
                        active: true,
                    },
                });
            }

            // Admin User
            const [firstName, ...rest] = TEST_DATA.fullName.split(' ');
            const lastName = rest.join(' ') || ' ';
            const hashed = await bcrypt.hash(TEST_DATA.password, 12);

            const user = await tx.user.create({
                data: {
                    email: TEST_DATA.email,
                    password: hashed,
                    firstName,
                    lastName,
                    role: 'ADMIN',
                    phone: TEST_DATA.phone,
                    emailVerified: false,
                    schoolId: school.id,
                    branchId: branch.id,
                    emailVerificationToken: randomUUID(),
                    emailVerificationSentAt: new Date(),
                }
            });

            return { school, user };
        });

        console.log(`✅ School '${result.school.name}' created with ID: ${result.school.id}`);
        console.log(`✅ User '${result.user.firstName} ${result.user.lastName}' created.`);

        // 3. Trigger Email
        console.log('📧 Sending Onboarding Email...');

        const frontendUrl = process.env.FRONTEND_URL || 'https://educorev1.up.railway.app';
        const loginUrl = `${frontendUrl}/t/${result.school.id}/login`;

        await EmailService.sendOnboardingEmail({
            to: result.user.email,
            schoolName: result.school.name,
            adminName: `${result.user.firstName} ${result.user.lastName}`,
            loginUrl,
            schoolId: result.school.id
        });

        console.log('✅ Email sent successfully!');

        // 4. Trigger SMS (Optional check if configured)
        /*
        if (result.user.phone) {
            console.log('📱 Sending Welcome SMS...');
            await SmsService.sendWelcomeSms(
              result.school.id,
              result.user.phone,
              result.school.name
            );
            console.log('✅ SMS sent (simulated if no credits).');
        }
        */

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Close prisma connection
        await prisma.$disconnect();
    }
}

registerMella();
