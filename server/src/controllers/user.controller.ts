/**
 * User Controller
 * Handles user management operations with role-based access control
 * 
 * @module controllers/user.controller
 */

import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { AuthRequest } from '../middleware/permissions.middleware';
import { Role, canManageRole } from '../config/permissions';

export class UserController {
  /**
   * Get all users
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER (limited to department)
   */
  async getAllUsers(req: AuthRequest, res: Response) {
    const currentUserRole = req.user!.role;
    const includeArchived = req.query.includeArchived === 'true';

    let users;

    if (currentUserRole === 'HEAD_TEACHER') {
      // HEAD_TEACHER can only see teachers in their department
      // TODO: Filter by department when department model is implemented
      const whereClause: any = {
        role: { in: ['TEACHER', 'HEAD_TEACHER'] }
      };

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId) {
        whereClause.schoolId = req.user.schoolId;
      }

      // Exclude archived users by default
      if (!includeArchived) {
        whereClause.archived = false;
      }

      users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // SUPER_ADMIN and ADMIN see all users
      const whereClause: any = {};

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId) {
        whereClause.schoolId = req.user.schoolId;
      }

      // Exclude archived users by default
      if (!includeArchived) {
        whereClause.archived = false;
      }

      users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  }

  /**
   * Get single user by ID
   * Access: SUPER_ADMIN, ADMIN, or the user themselves
   */
  async getUserById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if user can access this profile
    const canAccess =
      currentUserId === id ||
      ['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole);

    if (!canAccess) {
      throw new ApiError(403, 'Access denied');
    }

    res.json({
      success: true,
      data: user
    });
  }

  /**
   * Create new user
   * Access: Role-specific based on target role
   * - SUPER_ADMIN can create any role
   * - ADMIN can create TEACHER, PARENT, ACCOUNTANT, RECEPTIONIST
   */
  async createUser(req: AuthRequest, res: Response) {
    const { email, password, firstName, lastName, middleName, phone, role } = req.body;
    const currentUserRole = req.user!.role;

    // Determine schoolId
    let schoolId = req.body.schoolId;
    if (req.user?.schoolId) {
      schoolId = req.user.schoolId;
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      throw new ApiError(400, 'Missing required fields: email, password, firstName, lastName, role');
    }

    // Validate role
    const validRoles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER', 'PARENT', 'ACCOUNTANT', 'RECEPTIONIST'];
    if (!validRoles.includes(role as Role)) {
      throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if current user can create this role
    if (!canManageRole(currentUserRole, role as Role)) {
      throw new ApiError(403, `You cannot create users with role: ${role}`);
    }

    // Additional restrictions
    if (role === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Only SUPER_ADMIN can create other SUPER_ADMIN users');
    }

    if (role === 'ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Only SUPER_ADMIN can create ADMIN users');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName: middleName || null,
        phone: phone || null,
        role: role as Role,
        status: 'ACTIVE',
        emailVerified: false,
        schoolId, // Add schoolId
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: user,
      message: `${role} user created successfully`
    });
  }

  /**
   * Update user
   * Access: SUPER_ADMIN, ADMIN, or the user themselves (limited fields)
   */
  async updateUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;
    const { firstName, lastName, middleName, phone, role, status, password } = req.body;

    // Find target user
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId && targetUser.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to user');
    }

    // Check permissions
    const isSelfUpdate = currentUserId === id;
    const canUpdate = isSelfUpdate || ['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole);

    if (!canUpdate) {
      throw new ApiError(403, 'You can only update your own profile');
    }

    // Prevent role elevation
    if (role && role !== targetUser.role) {
      if (isSelfUpdate) {
        throw new ApiError(403, 'You cannot change your own role');
      }

      if (!canManageRole(currentUserRole, role as Role)) {
        throw new ApiError(403, `You cannot assign role: ${role}`);
      }

      if (!canManageRole(currentUserRole, targetUser.role as Role)) {
        throw new ApiError(403, `You cannot modify users with role: ${targetUser.role}`);
      }
    }

    // Prevent status change on self
    if (status && isSelfUpdate) {
      throw new ApiError(403, 'You cannot change your own status');
    }

    // Build update data
    const updateData: any = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (phone !== undefined) updateData.phone = phone;

    // Only admins can change role and status
    if (!isSelfUpdate && ['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole)) {
      if (role) updateData.role = role as Role;
      if (status) updateData.status = status;
    }

    // Password update
    if (password) {
      if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long');
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  }

  /**
   * Archive user (soft delete)
   * Access: TEACHER, ADMIN, SUPER_ADMIN
   * Teachers can archive parents, Admins can archive any user
   */
  async archiveUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // Prevent self-archiving
    if (currentUserId === id) {
      throw new ApiError(403, 'You cannot archive your own account');
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check if already archived
    if (targetUser.archived) {
      throw new ApiError(400, 'User is already archived');
    }

    // Teachers can only archive parents
    if (currentUserRole === 'TEACHER' && targetUser.role !== 'PARENT') {
      throw new ApiError(403, 'Teachers can only archive parent accounts');
    }

    // Admins can't archive higher roles
    if (currentUserRole === 'ADMIN' && !canManageRole(currentUserRole, targetUser.role as Role)) {
      throw new ApiError(403, `You cannot archive users with role: ${targetUser.role}`);
    }

    // Archive user
    const archivedUser = await prisma.user.update({
      where: { id },
      data: {
        archived: true,
        archivedAt: new Date(),
        archivedBy: currentUserId,
        status: 'INACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        archived: true,
        archivedAt: true
      }
    });

    res.json({
      success: true,
      data: archivedUser,
      message: `User ${targetUser.email} archived successfully`
    });
  }

  /**
   * Unarchive user
   * Access: ADMIN, SUPER_ADMIN only
   */
  async unarchiveUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserRole = req.user!.role;

    // Only admins can unarchive
    if (!['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole)) {
      throw new ApiError(403, 'Only administrators can unarchive users');
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId && targetUser.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to user');
    }

    // Check if archived
    if (!targetUser.archived) {
      throw new ApiError(400, 'User is not archived');
    }

    // Unarchive user
    const unarchivedUser = await prisma.user.update({
      where: { id },
      data: {
        archived: false,
        archivedAt: null,
        archivedBy: null,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        archived: true,
        status: true
      }
    });

    res.json({
      success: true,
      data: unarchivedUser,
      message: `User ${targetUser.email} unarchived successfully`
    });
  }

  /**
   * Delete user (hard delete)
   * Access: SUPER_ADMIN ONLY
   */
  async deleteUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // ONLY Super Admin can hard delete
    if (currentUserRole !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Permission denied: Only SUPER_ADMIN can permanently delete records');
    }

    // Prevent self-deletion
    if (currentUserId === id) {
      throw new ApiError(403, 'You cannot delete your own account');
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    // Delete user
    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: `User ${targetUser.email} permanently deleted by Super Admin`
    });
  }

  /**
   * Get users by role
   * Access: SUPER_ADMIN, ADMIN
   */
  async getUsersByRole(req: AuthRequest, res: Response) {
    const { role } = req.params;
    const currentUserRole = req.user!.role;
    const includeArchived = req.query.includeArchived === 'true';
    const search = req.query.search as string;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Validate role
    const validRoles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER', 'PARENT', 'ACCOUNTANT', 'RECEPTIONIST'];
    if (!validRoles.includes(role as Role)) {
      throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // HEAD_TEACHER can only view teachers
    if (currentUserRole === 'HEAD_TEACHER' && !['TEACHER', 'HEAD_TEACHER'].includes(role)) {
      throw new ApiError(403, 'You can only view teachers');
    }

    const whereClause: any = { role: role as Role };

    // Exclude archived users by default
    if (!includeArchived) {
      whereClause.archived = false;
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where: whereClause });

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      count: users.length,
      role: role
    });
  }

  /**
   * Get current user statistics
   * Shows role-appropriate dashboard stats
   */
  async getUserStats(req: AuthRequest, res: Response) {
    const currentUserRole = req.user!.role;

    const whereClause: any = {};
    if (req.user?.schoolId) {
      whereClause.schoolId = req.user.schoolId;
    }

    const stats: any = {
      role: currentUserRole,
      timestamp: new Date()
    };

    if (['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole)) {
      // Get all user counts by role
      const userCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: whereClause
      });

      stats.usersByRole = userCounts.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>);

      stats.totalUsers = userCounts.reduce((sum, item) => sum + item._count, 0);
    }

    if (currentUserRole === 'HEAD_TEACHER') {
      // Get teacher counts
      const teacherCount = await prisma.user.count({
        where: { role: 'TEACHER', ...whereClause }
      });
      stats.teachers = teacherCount;
    }

    res.json({
      success: true,
      data: stats
    });
  }
}
