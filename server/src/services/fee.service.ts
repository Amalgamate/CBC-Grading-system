import prisma from '../config/database';
import { ConfigService } from './config.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { whatsappService } from './whatsapp.service';

const configService = new ConfigService();

export class FeeService {
    /**
     * Automatically generate an invoice for a learner based on their grade and the active term.
     * This is typically called after a learner is enrolled or promoted.
     */
    async generateInvoiceForLearner(learnerId: string): Promise<any> {
        console.log(`[FeeService] Attempting to generate invoice for learner: ${learnerId}`);

        try {
            // 1. Fetch Learner details
            const learner = await prisma.learner.findUnique({
                where: { id: learnerId },
                include: {
                    parent: true,
                    school: true
                }
            });

            if (!learner) {
                console.error(`[FeeService] Learner not found: ${learnerId}`);
                return { success: false, error: 'Learner not found' };
            }

            if (learner.status !== 'ACTIVE') {
                console.log(`[FeeService] Learner ${learner.admissionNumber} is not ACTIVE. Skipping invoice generation.`);
                return { success: false, error: 'Learner is not active' };
            }

            const { schoolId, grade, stream } = learner;

            // 2. Determine Active Term
            const activeTermConfig = await configService.getActiveTermConfig(schoolId);

            if (!activeTermConfig) {
                console.warn(`[FeeService] No active term configuration found for school ${schoolId}. Cannot generate invoice.`);
                return { success: false, error: 'No active term configuration found' };
            }

            const { term, academicYear } = activeTermConfig;
            console.log(`[FeeService] Active Period: ${term} ${academicYear}`);

            // 3. Find Matching Fee Structure
            // We look for a structure that matches the School, Grade, Term, and Year
            // We also check for stream-specific structures if applicable (though usually fee structures are per grade)
            const feeStructure = await prisma.feeStructure.findFirst({
                where: {
                    schoolId,
                    academicYear,
                    term,
                    grade,
                    active: true
                },
                // @ts-ignore
                include: {
                    feeItems: {
                        include: { feeType: true }
                    }
                }
            });

            if (!feeStructure) {
                console.warn(`[FeeService] No active fee structure found for Grade ${grade}, Term ${term} ${academicYear}.`);
                return { success: false, error: 'No matching fee structure found' };
            }

            // 4. Check if Invoice already exists
            const existingInvoice = await prisma.feeInvoice.findFirst({
                where: {
                    learnerId,
                    feeStructureId: feeStructure.id,
                    term,
                    academicYear
                }
            });

            if (existingInvoice) {
                console.log(`[FeeService] Invoice already exists for ${learner.admissionNumber} for this period.`);
                return { success: true, invoice: existingInvoice, created: false };
            }

            // 5. Calculate Amount and Due Date
            // Default due date: Annual invoice? 30 days? 
            // Ideally, the TermConfig or FeeStructure should have a due date.
            // For now, let's set it to 30 days from now or the active term end date, whichever is sooner?
            // Let's default to 14 days from now for immediate attention.
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            // @ts-ignore
            const totalAmount = feeStructure.feeItems.reduce((sum, item) => sum + Number(item.amount), 0);

            // 6. Create Invoice
            // We generate a running number invoice ID
            const count = await prisma.feeInvoice.count();
            const invoiceNumber = `INV-${academicYear}-${String(count + 1).padStart(6, '0')}`;

            const newInvoice = await prisma.feeInvoice.create({
                data: {
                    invoiceNumber,
                    learnerId,
                    feeStructureId: feeStructure.id,
                    term,
                    academicYear,
                    dueDate,
                    totalAmount,
                    paidAmount: 0,
                    balance: totalAmount,
                    status: 'PENDING',
                    issuedBy: 'SYSTEM' // Indicates automated generation
                },
                include: {
                    learner: true
                }
            });

            console.log(`[FeeService] ✅ Invoice ${invoiceNumber} generated for ${learner.admissionNumber}`);

            // 7. Trigger Notifications
            if (learner.parent && learner.parent.phone) {
                const parentPhone = learner.parent.phone;
                const parentName = `${learner.parent.firstName} ${learner.parent.lastName}`;
                const learnerName = `${learner.firstName} ${learner.lastName}`;

                // SMS
                await SmsService.sendFeeInvoiceNotification({
                    schoolId,
                    parentPhone,
                    parentName,
                    learnerName,
                    invoiceNumber,
                    term: `${term.replace('_', ' ')} ${academicYear}`,
                    amount: totalAmount,
                    dueDate: dueDate.toLocaleDateString()
                });

                // WhatsApp
                await whatsappService.sendFeeReminder({
                    schoolId,
                    parentPhone,
                    parentName,
                    learnerName,
                    amountDue: totalAmount,
                    dueDate: dueDate.toLocaleDateString()
                });

                // Email
                if (learner.parent.email) {
                    await EmailService.sendFeeInvoiceEmail({
                        to: learner.parent.email,
                        schoolName: learner.school.name,
                        parentName,
                        learnerName,
                        invoiceNumber,
                        term: `${term.replace('_', ' ')} ${academicYear}`,
                        amount: totalAmount,
                        dueDate: dueDate.toLocaleDateString(),
                        // @ts-ignore
                        feeItems: feeStructure.feeItems.map(item => ({
                            // @ts-ignore
                            name: item.feeType.name,
                            amount: Number(item.amount)
                        }))
                    });
                }
            }

            return { success: true, invoice: newInvoice, created: true };

        } catch (error: any) {
            console.error(`[FeeService] Critical Error generating invoice: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

export const feeService = new FeeService();
