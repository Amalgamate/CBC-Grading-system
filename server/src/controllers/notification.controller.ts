/**
 * Notification Controller
 * Handles sending notifications (WhatsApp, SMS, Email) to parents
 * 
 * @module controllers/notification.controller
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import { whatsappService } from '../services/whatsapp.service';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';

export class NotificationController {
  /**
   * Send assessment completion notification to parent
   * POST /api/notifications/assessment-complete
   */
  async sendAssessmentNotification(req: AuthRequest, res: Response) {
    const {
      learnerId,
      assessmentType, // 'Formative' or 'Summative'
      subject,
      grade,
      term,
    } = req.body;

    // Validate input
    if (!learnerId || !assessmentType) {
      throw new ApiError(400, 'Learner ID and assessment type are required');
    }

    // Get learner with parent info
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    if (!learner.parent) {
      throw new ApiError(400, 'Parent information not available for this learner');
    }

    if (!learner.parent.phone) {
      throw new ApiError(400, 'Parent phone number not available');
    }

    // Send WhatsApp notification
    const result = await whatsappService.sendAssessmentNotification({
      parentPhone: learner.parent.phone,
      parentName: `${learner.parent.firstName} ${learner.parent.lastName}`,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      assessmentType,
      subject,
      grade: grade || learner.grade,
      term,
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Assessment notification sent successfully',
        data: {
          sent: true,
          recipient: learner.parent.phone,
        },
      });
    } else {
      throw new ApiError(500, result.error || 'Failed to send notification');
    }
  }

  /**
   * Send bulk assessment notifications to multiple parents
   * POST /api/notifications/assessment-complete/bulk
   */
  async sendBulkAssessmentNotifications(req: AuthRequest, res: Response) {
    const {
      learnerIds,
      assessmentType,
      subject,
      grade,
      term,
    } = req.body;

    // Validate input
    if (!learnerIds || !Array.isArray(learnerIds) || learnerIds.length === 0) {
      throw new ApiError(400, 'Learner IDs array is required');
    }

    if (!assessmentType) {
      throw new ApiError(400, 'Assessment type is required');
    }

    // Get learners with parent info
    const learners = await prisma.learner.findMany({
      where: {
        id: { in: learnerIds },
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Prepare notifications
    const notifications = learners
      .filter(l => l.parent && l.parent.phone) // Only include learners with parent phone
      .map(l => ({
        parentPhone: l.parent!.phone!,
        parentName: `${l.parent!.firstName} ${l.parent!.lastName}`,
        learnerName: `${l.firstName} ${l.lastName}`,
        assessmentType,
        subject,
        grade: grade || l.grade,
        term,
      }));

    if (notifications.length === 0) {
      throw new ApiError(400, 'No valid parent phone numbers found for the selected learners');
    }

    // Send bulk notifications
    const result = await whatsappService.sendBulkAssessmentNotifications(notifications);

    res.json({
      success: true,
      message: `Sent ${result.sent} notifications, ${result.failed} failed`,
      data: {
        total: learnerIds.length,
        sent: result.sent,
        failed: result.failed,
        skipped: learnerIds.length - notifications.length,
        results: result.results,
      },
    });
  }

  /**
   * Send custom message to parent
   * POST /api/notifications/custom
   */
  async sendCustomMessage(req: AuthRequest, res: Response) {
    const { parentId, message } = req.body;

    // Validate input
    if (!parentId || !message) {
      throw new ApiError(400, 'Parent ID and message are required');
    }

    // Get parent info
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    if (!parent) {
      throw new ApiError(404, 'Parent not found');
    }

    if (parent.role !== 'PARENT') {
      throw new ApiError(400, 'User is not a parent');
    }

    if (!parent.phone) {
      throw new ApiError(400, 'Parent phone number not available');
    }

    // Send message
    const result = await whatsappService.sendCustomMessage({
      parentPhone: parent.phone,
      parentName: `${parent.firstName} ${parent.lastName}`,
      message,
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Custom message sent successfully',
        data: {
          sent: true,
          recipient: parent.phone,
        },
      });
    } else {
      throw new ApiError(500, result.error || 'Failed to send message');
    }
  }

  /**
   * Send announcement to all parents or filtered group
   * POST /api/notifications/announcement
   */
  async sendAnnouncement(req: AuthRequest, res: Response) {
    const { title, content, grade, stream } = req.body;

    // Validate input
    if (!title || !content) {
      throw new ApiError(400, 'Title and content are required');
    }

    // Build where clause
    const whereClause: any = {
      role: 'PARENT',
      phone: { not: null },
    };

    // If grade/stream specified, filter parents by their children's grade/stream
    let parents;
    if (grade || stream) {
      const learnerWhere: any = {};
      if (grade) learnerWhere.grade = grade;
      if (stream) learnerWhere.stream = stream;

      // Get unique parent IDs from learners
      const learners = await prisma.learner.findMany({
        where: learnerWhere,
        select: { parentId: true },
      });

      const parentIds = [...new Set(learners.map(l => l.parentId).filter(Boolean))];

      parents = await prisma.user.findMany({
        where: {
          id: { in: parentIds as string[] },
          phone: { not: null },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      });
    } else {
      // Get all parents
      parents = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      });
    }

    if (parents.length === 0) {
      throw new ApiError(400, 'No parents found with phone numbers');
    }

    // Send announcements
    let sent = 0;
    let failed = 0;
    const results = [];

    for (const parent of parents) {
      const result = await whatsappService.sendAnnouncement({
        parentPhone: parent.phone!,
        parentName: `${parent.firstName} ${parent.lastName}`,
        title,
        content,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      results.push({
        parentId: parent.id,
        phone: parent.phone,
        success: result.success,
        error: result.error,
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({
      success: true,
      message: `Announcement sent to ${sent} parents, ${failed} failed`,
      data: {
        total: parents.length,
        sent,
        failed,
        results,
      },
    });
  }

  /**
   * Test WhatsApp connection
   * POST /api/notifications/test
   */
  async testWhatsApp(req: AuthRequest, res: Response) {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      throw new ApiError(400, 'Phone number is required');
    }

    const result = await whatsappService.sendMessage({
      to: phoneNumber,
      message: 'This is a test message from Zawadi JRN Academy. WhatsApp integration is working correctly!',
    });

    res.json({
      success: result.success,
      message: result.message,
      error: result.error,
    });
  }
}
