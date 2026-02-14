
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCreateLearner() {
    try {
        console.log('Starting debug for Create Learner...');

        // 1. Find a context (Admin user & School)
        const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            include: { school: true }
        });

        if (!adminUser || !adminUser.schoolId) {
            console.error('❌ No Admin user with School found for context.');
            return;
        }

        const schoolId = adminUser.schoolId;
        console.log(`Context: School ID: ${schoolId}, Admin: ${adminUser.email}`);

        // 2. Find a branch
        const branch = await prisma.branch.findFirst({
            where: { schoolId }
        });

        if (!branch) {
            console.error('❌ No branch found.');
            return;
        }
        const branchId = branch.id;
        const branchCode = branch.code;
        console.log(`Context: Branch ID: ${branchId}, Code: ${branchCode}`);

        // 3. Simulate Admission Number Generation
        const currentYear = new Date().getFullYear();
        // Simulate logic from generateAdmissionNumber
        // We'll just mimic the sequence part simply for testing or use a random one if we can't replicate exact logic easily
        // But better to check if sequence exists
        const sequence = await prisma.admissionSequence.findUnique({
            where: { schoolId_academicYear: { schoolId, academicYear: currentYear } }
        });
        console.log('Current Sequence:', sequence);

        // Mock generation for test
        const mockAdmNo = `TEST-${Date.now()}`;
        console.log(`Generated Mock Adm No: ${mockAdmNo}`);

        // 4. Prepare Payload (Based on screenshot)
        const payload = {
            firstName: 'MONTHIDA',
            lastName: 'RASHI',
            dateOfBirth: new Date('2026-02-07'),
            gender: 'FEMALE',
            grade: 'GRADE_6', // Enum value
            stream: 'A', // String
            guardianName: 'Rico Kariuki',
            guardianPhone: '0713612141',
            guardianEmail: 'N/A', // The screenshot says N/A, check if valid email required
            schoolId,
            branchId,
            admissionNumber: mockAdmNo,
            status: 'ACTIVE',
            createdBy: adminUser.id
        };

        // Note: guardianEmail validation?
        // The controller says:
        // const pEmail = guardianEmail || `${guardianPhone.replace(/\D/g, '')}@elimcrown.com`;
        // If guardianEmail is "N/A", is it a valid email?
        // Prisma/DB might not enforce email format on `guardianEmail` string field, but user creation?

        console.log('Payload:', payload);

        // 5. Parent Handling Simulation
        console.log('--- Testing Parent Creation Logic ---');
        let parentId = null;
        const guardianPhone = payload.guardianPhone;
        const guardianEmail = payload.guardianEmail; // "N/A"

        if (guardianPhone) {
            let parent = await prisma.user.findFirst({
                where: { phone: guardianPhone, role: 'PARENT', schoolId }
            });

            if (!parent) {
                console.log('Parent not found by phone, simulating creation...');

                // Logic from controller:
                // const pEmail = guardianEmail || `${guardianPhone.replace(/\D/g, '')}@elimcrown.com`;
                // PROBLEM: If guardianEmail is "N/A", pEmail becomes "N/A".
                const pEmail = guardianEmail || `${guardianPhone.replace(/\D/g, '')}@elimcrown.com`;

                console.log(`Derived Parent Email: "${pEmail}"`);

                // Check if email exists
                const existingEmail = await prisma.user.findUnique({ where: { email: pEmail } });
                if (existingEmail) {
                    console.error('❌ CRITICAL: Parent email collision! A user already exists with email:', pEmail);
                    console.log('Used ID:', existingEmail.id);
                    throw new Error(`Unique constraint violation on User.email: ${pEmail}`);
                } else {
                    console.log('Parent email is fresh. Proceeding to create mock parent...');
                    // Mock create
                    /*
                    parent = await prisma.user.create({
                       data: {
                           firstName: 'Rico',
                           lastName: 'Kariuki',
                           email: pEmail,
                           phone: guardianPhone,
                           password: 'hashedrequest',
                           role: 'PARENT',
                           schoolId,
                           branchId,
                           status: 'ACTIVE'
                       }
                    });
                    parentId = parent.id;
                    */
                    console.log('Mock parent creation skipped to avoid DB pollution, but email check passed.');
                }
            } else {
                console.log('Parent found by phone:', parent.id);
                parentId = parent.id;
            }
        }


        // 6. Attempt Learner Creation
        console.log('Attempting prisma.learner.create...');
        const learner = await prisma.learner.create({
            data: {
                schoolId: payload.schoolId,
                branchId: payload.branchId,
                admissionNumber: payload.admissionNumber,
                firstName: payload.firstName,
                lastName: payload.lastName,
                dateOfBirth: payload.dateOfBirth,
                gender: payload.gender, // Enum mismatch check?
                grade: payload.grade, // Enum mismatch check?
                stream: payload.stream,
                parentId: parentId, // Might be null if we didn't actually create parent above
                guardianName: payload.guardianName,
                guardianPhone: payload.guardianPhone,
                guardianEmail: payload.guardianEmail,
                status: payload.status,
                createdBy: payload.createdBy
            }
        });

        console.log('✅ Learner created successfully:', learner.id);

    } catch (error) {
        console.error('❌ Error in debug script:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugCreateLearner();
