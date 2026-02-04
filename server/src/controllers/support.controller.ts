
import { Request, Response } from 'express';
import prisma from '../config/database';
import { getIO } from '../services/socket.service';
import { EmailService } from '../services/email-resend.service';

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { subject, message, priority, guestName, guestEmail } = req.body;
        // Check if user is authenticated
        const userId = (req as any).user?.id || null;
        const schoolId = (req as any).user?.schoolId || null;

        if (!userId && (!guestEmail || !guestName)) {
            return res.status(400).json({ message: "Guest Name and Email are required for unauthenticated tickets." });
        }

        // Prepare message creation
        // If it's a guest, the first message has no senderId yet, or we assume system?
        // Actually SupportMessage requires senderId (User).
        // Since we didn't update SupportMessage to allow null senderId, we have a problem.
        // We MUST update SupportMessage senderId to be optional OR create a temporary system user for guests?
        // Better: Update Schema for SupportMessage too? Or simpler: Just include the message in the ticket itself for the first one?
        // Schema says: messages SupportMessage[]. SupportMessage sender User.

        // Quick fix: If guest, we DO NOT create a SupportMessage for the initial description. 
        // We rely on the ticket's own data? But Ticket doesn't have "body".
        // Schema update required for SupportMessage senderId?
        // Actually, let's make senderId optional in SupportMessage too!

        // Wait, I can't update schema again in this step without migration.
        // Let's assume I fix the schema in next step.
        // For now, let's write the controller logic assuming `senderId` is optional or we skip it.

        const ticketData: any = {
            subject,
            priority: priority || 'MEDIUM',
            userId,
            schoolId,
            guestName,
            guestEmail,
        };

        // If authenticated, we add the message using nested create
        if (userId) {
            ticketData.messages = {
                create: {
                    message,
                    senderId: userId
                }
            };
        } else {
            // Guest: We can't Create SupportMessage because senderId is required (User).
            // We'll have to store the initial message in a temporary way or fail?
            // NO, I must update the schema for SupportMessage.senderId to be optional.
        }

        const ticket = await prisma.supportTicket.create({
            data: ticketData,
            include: {
                messages: true,
                user: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
        });

        // Send Email Notification to Support Team
        try {
            const schoolName = userId ? ((req as any).user?.schoolName || 'Unknown School') : 'Public Website (Guest)';
            const userName = userId ? `${(req as any).user.firstName} ${(req as any).user.lastName}` : `${guestName} (Guest)`;

            await EmailService.sendTicketCreated({
                schoolName,
                userName,
                ticketSubject: subject,
                ticketPriority: priority || 'MEDIUM',
                ticketMessage: message, // Note: This might be missing from DB if we didn't save it
                ticketId: ticket.id
            });
        } catch (emailError) {
            console.error('Failed to send ticket email notification:', emailError);
        }

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTickets = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        let whereClause: any = {};

        if (userRole === 'SUPER_ADMIN') {
            // Super Admin sees all tickets
            whereClause = {};
        } else {
            // Others see their own tickets
            whereClause = { userId };
        }

        const tickets = await prisma.supportTicket.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, school: { select: { name: true } } } },
                _count: { select: { messages: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                messages: {
                    include: {
                        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Access Control
        if (userRole !== 'SUPER_ADMIN' && ticket.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const userId = (req as any).user.id;

        // Verify ticket exists
        const ticket = await prisma.supportTicket.findUnique({
            where: { id }
        });

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const newMessage = await prisma.supportMessage.create({
            data: {
                ticketId: id,
                senderId: userId,
                message
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, role: true } }
            }
        });

        // Update ticket updated time
        await prisma.supportTicket.update({
            where: { id },
            data: { updatedAt: new Date(), status: 'IN_PROGRESS' }
            // If user replies, maybe set to Open? If Admin replies, set to In Progress?
            // Logic can be refined.
        });

        // Emit Socket Event
        try {
            const io = getIO();
            io.to(id).emit('new_message', newMessage);
        } catch (e) {
            console.warn('Socket emit failed (socket might not be init)', e);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedToId } = req.body;
        const userRole = (req as any).user.role;

        if (userRole !== 'SUPER_ADMIN') {
            // Basic users can only close tickets maybe?
            if (status !== 'CLOSED' && status !== 'RESOLVED') {
                return res.status(403).json({ message: "Only admins can update ticket details" });
            }
        }

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: {
                status,
                priority,
                assignedToId
            }
        });

        res.json(ticket);
    } catch (error) {
        console.error("Error updating ticket", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
