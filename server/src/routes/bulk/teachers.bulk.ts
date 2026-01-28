/**
 * Bulk Operations for Teachers
 * Handles CSV import/export for teacher data
 */

import { Router, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/permissions.middleware';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Parser } from 'json2csv';
import { Readable } from 'stream';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const teacherSchema = z.object({
  'Staff ID': z.string().optional(),
  'First Name': z.string().min(1, 'First name is required'),
  'Last Name': z.string().min(1, 'Last name is required'),
  'Email': z.string().email('Invalid email'),
  'Phone': z.string().optional(),
  'Role': z.enum(['TEACHER', 'HEAD_TEACHER', 'ADMIN']).optional(),
  'Branch Code': z.string().optional(), // Optional: assign to specific branch
  'Subjects': z.string().optional(),
  'Status': z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

/**
 * POST /api/bulk/teachers/upload
 * Now automatically uses the logged-in user's school!
 */
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get school from headers (preferred), request body, or user token
    const schoolId = req.headers['x-school-id'] as string || req.body.schoolId || req.query.schoolId || req.user!.schoolId;

    // For non-SUPER_ADMIN users, require school association
    if (!schoolId && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'School association required',
        message: 'Please contact administrator to assign you to a school'
      });
    }

    // SUPER_ADMIN must provide schoolId
    if (req.user!.role === 'SUPER_ADMIN' && !schoolId) {
      const schools = await prisma.school.findMany({
        select: { id: true, name: true }
      });

      return res.status(400).json({
        error: 'School required for SUPER_ADMIN',
        message: 'Please specify which school to upload teachers to',
        availableSchools: schools,
        note: 'Include schoolId in request body or query parameter'
      });
    }

    // Get branch from headers (preferred), request body, or user token
    const branchIdFromContext = req.headers['x-branch-id'] as string || req.body.branchId || req.user!.branchId;

    console.log('Teacher upload request:');
    console.log('- File:', req.file.originalname);
    console.log('- School:', schoolId);
    console.log('- Default Branch Context:', branchIdFromContext);
    console.log('- User:', req.user!.email);

    const results: any[] = [];
    const errors: any[] = [];
    let lineNumber = 1;

    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (data) => {
          lineNumber++;
          try {
            const validated = teacherSchema.parse(data);
            results.push({
              line: lineNumber,
              data: validated,
              valid: true
            });
          } catch (error) {
            errors.push({
              line: lineNumber,
              data,
              error: error instanceof z.ZodError ? error.errors : 'Validation failed',
              valid: false
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const created: any[] = [];
    const failed: any[] = [];

    for (const item of results) {
      try {
        const csvData = item.data;

        // Check if email already exists
        const existing = await prisma.user.findUnique({
          where: { email: csvData['Email'] }
        });

        if (existing) {
          failed.push({
            line: item.line,
            email: csvData['Email'],
            name: `${csvData['First Name']} ${csvData['Last Name']}`,
            reason: 'Email already exists'
          });
          continue;
        }

        // Resolve branch: CSV 'Branch Code' takes precedence, then header context
        let branchId = branchIdFromContext || null;
        if (csvData['Branch Code']) {
          const branch = await prisma.branch.findFirst({
            where: {
              schoolId,
              code: csvData['Branch Code']
            }
          });

          if (branch) {
            branchId = branch.id;
          } else {
            failed.push({
              line: item.line,
              email: csvData['Email'],
              name: `${csvData['First Name']} ${csvData['Last Name']}`,
              reason: `Branch code '${csvData['Branch Code']}' not found in your school`
            });
            continue;
          }
        }

        // Default password (should be changed on first login)
        const hashedPassword = await bcrypt.hash('Teacher@123', 10);

        const teacher = await prisma.user.create({
          data: {
            email: csvData['Email'],
            password: hashedPassword,
            firstName: csvData['First Name'],
            lastName: csvData['Last Name'],
            phone: csvData['Phone'],
            staffId: csvData['Staff ID'],
            role: (csvData['Role'] as UserRole) || 'TEACHER',
            status: (csvData['Status'] as UserStatus) || 'ACTIVE',
            schoolId, // Automatically assign to user's school
            branchId, // Assign to specific branch if provided
          }
        });

        created.push({
          line: item.line,
          id: teacher.id,
          email: csvData['Email'],
          name: `${csvData['First Name']} ${csvData['Last Name']}`,
          branch: csvData['Branch Code'] || 'Not assigned'
        });

      } catch (error) {
        const csvData = item.data;
        failed.push({
          line: item.line,
          email: csvData['Email'],
          name: `${csvData['First Name']} ${csvData['Last Name']}`,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      context: {
        school: schoolId,
        uploadedBy: req.user!.email
      },
      summary: {
        total: lineNumber - 1,
        processed: results.length,
        created: created.length,
        failed: failed.length + errors.length,
        validationErrors: errors.length
      },
      details: {
        created,
        failed,
        validationErrors: errors
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/bulk/teachers/export
 * Export teachers (scoped to user's school)
 */
router.get('/export', async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.query;
    const schoolId = req.user!.schoolId!;

    const where: any = {
      role: { in: ['TEACHER', 'HEAD_TEACHER', 'ADMIN'] },
      archived: false,
      schoolId // Only export teachers from user's school
    };
    if (role) where.role = role;
    if (status) where.status = status;

    const teachers = await prisma.user.findMany({
      where,
      include: {
        branch: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    const csvData = teachers.map((teacher, index) => ({
      'ID': index + 1,
      'Staff ID': teacher.staffId || '',
      'First Name': teacher.firstName,
      'Last Name': teacher.lastName,
      'Email': teacher.email,
      'Phone': teacher.phone || '',
      'Role': teacher.role,
      'Branch': teacher.branch?.name || 'Not assigned',
      'Branch Code': teacher.branch?.code || '',
      'Subjects': '',
      'Status': teacher.status,
      'Created Date': teacher.createdAt ?
        new Date(teacher.createdAt).toLocaleDateString('en-GB') : ''
    }));

    const parser = new Parser({
      fields: [
        'ID', 'Staff ID', 'First Name', 'Last Name', 'Email',
        'Phone', 'Role', 'Branch', 'Branch Code', 'Subjects', 'Status', 'Created Date'
      ]
    });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="teachers_export_${Date.now()}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Failed to export data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/bulk/teachers/template
 */
router.get('/template', (_req: Request, res: Response) => {
  const template = [
    {
      'ID': '1',
      'Staff ID': 'TCH001',
      'First Name': 'John',
      'Last Name': 'Smith',
      'Email': 'john.smith@school.com',
      'Phone': '0712345678',
      'Role': 'TEACHER',
      'Branch Code': 'KB',
      'Subjects': 'Mathematics, Science',
      'Status': 'ACTIVE'
    }
  ];

  const parser = new Parser({
    fields: [
      'ID', 'Staff ID', 'First Name', 'Last Name', 'Email',
      'Phone', 'Role', 'Branch Code', 'Subjects', 'Status'
    ]
  });
  const csv = parser.parse(template);

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', 'attachment; filename="teachers_template.csv"');
  res.send(csv);
});

export default router;
