/**
 * Bulk Operations for Parents
 * Handles CSV import/export for parent data
 */

import { Router, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/permissions.middleware';
import { PrismaClient, UserStatus } from '@prisma/client';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Parser } from 'json2csv';
import { Readable } from 'stream';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authenticate, requireSchool } from '../../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const parentSchema = z.object({
  'First Name': z.string().min(1, 'First name is required'),
  'Last Name': z.string().min(1, 'Last name is required'),
  'Email': z.string().email('Invalid email'),
  'Phone': z.string().min(1, 'Phone is required'),
  'Phone 2': z.string().optional(),
  'WhatsApp Number': z.string().optional(),
  'Student Admission Numbers': z.string().optional(), // Comma-separated
  'Status': z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

/**
 * POST /api/bulk/parents/upload
 * Now automatically uses the logged-in user's school!
 */
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get school from authenticated user OR request body
    // SUPER_ADMIN must provide schoolId in request
    const schoolId = req.body.schoolId || req.query.schoolId || req.user!.schoolId;

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
        message: 'Please specify which school to upload parents to',
        availableSchools: schools,
        note: 'Include schoolId in request body or query parameter'
      });
    }

    console.log('Parent upload request:');
    console.log('- File:', req.file.originalname);
    console.log('- School:', schoolId);
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
            const validated = parentSchema.parse(data);
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

        // Default password
        const hashedPassword = await bcrypt.hash('Parent@123', 10);

        // Create parent user with school association
        const parent = await prisma.user.create({
          data: {
            email: csvData['Email'],
            password: hashedPassword,
            firstName: csvData['First Name'],
            lastName: csvData['Last Name'],
            phone: csvData['Phone'],
            role: 'PARENT',
            status: (csvData['Status'] as UserStatus) || 'ACTIVE',
            schoolId, // Automatically assign to user's school
          }
        });

        // Link to students if admission numbers provided
        if (csvData['Student Admission Numbers']) {
          const admNos = csvData['Student Admission Numbers']
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);

          for (const admNo of admNos) {
            // Only link to students in the same school
            const learner = await prisma.learner.findFirst({
              where: { 
                admissionNumber: admNo,
                schoolId 
              }
            });

            if (learner) {
              await prisma.learner.update({
                where: { id: learner.id },
                data: {
                  parentId: parent.id,
                  guardianName: `${csvData['First Name']} ${csvData['Last Name']}`,
                  guardianPhone: csvData['Phone'],
                }
              });
            }
          }
        }

        created.push({
          line: item.line,
          id: parent.id,
          email: csvData['Email'],
          name: `${csvData['First Name']} ${csvData['Last Name']}`
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
 * GET /api/bulk/parents/export
 * Export parents (scoped to user's school)
 */
router.get('/export', authenticate, requireSchool, async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.user!.schoolId!;

    const parents = await prisma.user.findMany({
      where: {
        role: 'PARENT',
        archived: false,
        schoolId // Only export parents from user's school
      },
      include: {
        learners: {
          where: {
            schoolId // Only include students from same school
          },
          select: {
            admissionNumber: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    const csvData = parents.map((parent, index) => ({
      'ID': index + 1,
      'First Name': parent.firstName,
      'Last Name': parent.lastName,
      'Email': parent.email,
      'Phone': parent.phone || '',
      'Phone 2': '',
      'WhatsApp Number': parent.phone || '',
      'Student Admission Numbers': parent.learners.map(l => l.admissionNumber).join(', '),
      'Student Names': parent.learners.map(l => `${l.firstName} ${l.lastName}`).join(', '),
      'Status': parent.status,
      'Created Date': parent.createdAt ? 
        new Date(parent.createdAt).toLocaleDateString('en-GB') : ''
    }));

    const parser = new Parser({
      fields: [
        'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Phone 2',
        'WhatsApp Number', 'Student Admission Numbers', 'Student Names', 'Status', 'Created Date'
      ]
    });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="parents_export_${Date.now()}.csv"`);
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
 * GET /api/bulk/parents/template
 */
router.get('/template', (_req: Request, res: Response) => {
  const template = [
    {
      'ID': '1',
      'First Name': 'Jane',
      'Last Name': 'Doe',
      'Email': 'jane.doe@email.com',
      'Phone': '0712345678',
      'Phone 2': '0798765432',
      'WhatsApp Number': '0712345678',
      'Student Admission Numbers': '1001, 1002',
      'Status': 'ACTIVE'
    }
  ];

  const parser = new Parser({
    fields: [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Phone 2',
      'WhatsApp Number', 'Student Admission Numbers', 'Status'
    ]
  });
  const csv = parser.parse(template);

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', 'attachment; filename="parents_template.csv"');
  res.send(csv);
});

export default router;
