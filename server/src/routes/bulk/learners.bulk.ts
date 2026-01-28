/**
 * Bulk Operations for Learners
 * Handles CSV import/export for student data
 */

import { Router, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/permissions.middleware';
import { PrismaClient, Grade } from '@prisma/client';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Parser } from 'json2csv';
import { Readable } from 'stream';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Validation schema for learner CSV data
const learnerSchema = z.object({
  'Learner Name': z.string().optional(),
  'Leaner Name': z.string().optional(),
  'Adm No': z.string().min(1, 'Admission number is required'),
  'Class': z.string().min(1, 'Class is required'),
  'Stream': z.string().optional(),
  'Term': z.string().optional(),
  'Year': z.string().optional(),
  'Parent/Guardian': z.string().optional(),
  'Phone 1': z.string().optional(),
  'Phone 2': z.string().optional(),
  'Reg Date': z.string().optional(),
  'Bal Due': z.string().optional(),
}).refine(data => data['Learner Name'] || data['Leaner Name'], {
  message: "Learner Name is required",
  path: ['Learner Name']
});

/**
 * POST /api/bulk/learners/upload
 * Upload CSV file with learner data
 * 
 * Now automatically uses the logged-in user's school and branch!
 * Optional: Can override branchId in request body for admins
 */
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get school and branch from headers (preferred), request body, or user token
    let schoolId = (req.headers['x-school-id'] as string) || req.body.schoolId || req.user!.schoolId;
    let branchId = (req.headers['x-branch-id'] as string) || req.body.branchId || req.user!.branchId;

    // Clean up empty strings from headers
    if (schoolId === '') schoolId = req.user!.schoolId || undefined;
    if (branchId === '') branchId = req.user!.branchId || undefined;

    // For non-SUPER_ADMIN users, require school association
    if (!schoolId && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'School association required',
        message: 'Please contact administrator to assign you to a school',
      });
    }

    // SUPER_ADMIN auto-resolution and validation
    if (req.user!.role === 'SUPER_ADMIN') {
      if (!schoolId) {
        const schools = await prisma.school.findMany({ select: { id: true, name: true } });
        return res.status(400).json({
          error: 'School context required',
          message: 'Please select a school context from the header before uploading',
          availableSchools: schools,
        });
      }

      // If branchId is provided, verify it belongs to the school. 
      // If NOT or if MISSING, auto-resolve to avoid "Invalid branch context" for Super Admins.
      if (branchId) {
        const validBranch = await prisma.branch.findFirst({
          where: { id: branchId, schoolId },
        });

        if (!validBranch) {
          console.log(`- Super Admin: Provided branchId ${branchId} is invalid for school ${schoolId}. Auto-resolving...`);
          branchId = undefined; // Force auto-resolution below
        }
      }

      // If branchId is missing or was invalidated, try to pick the first branch of this school
      if (!branchId) {
        let schoolBranches = await prisma.branch.findMany({
          where: { schoolId },
          orderBy: { createdAt: 'asc' },
        });

        if (schoolBranches.length > 0) {
          branchId = schoolBranches[0].id;
          console.log(`- Super Admin: Auto-resolved branchId to ${schoolBranches[0].name} (${branchId})`);
        } else {
          // AUTO-PROVISION: If no branches exist, create a default one for the school
          const newBranch = await prisma.branch.create({
            data: {
              name: 'Main Branch',
              code: 'MAIN',
              schoolId: schoolId!,
              active: true,
            },
          });
          branchId = newBranch.id;
          console.log(`- Super Admin: Auto-provisioned branch 'Main Branch' for school ${schoolId}`);
        }
      }
    }

    if (!branchId) {
      // General fallback for users without a branch (should not happen for valid school admins)
      const branches = await prisma.branch.findMany({
        where: { schoolId },
        select: { id: true, name: true, code: true },
      });

      return res.status(400).json({
        error: 'Branch ID required',
        message: 'Please specify which branch to upload learners to',
        availableBranches: branches,
      });
    }

    // Final verification of branch context
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        schoolId,
      },
    });

    if (!branch) {
      return res.status(403).json({
        error: 'Invalid branch context',
        message: 'The selected branch does not exist or does not belong to the selected school',
        debug: { schoolId, branchId }
      });
    }

    console.log('Upload request received:');
    console.log('- File:', req.file.originalname);
    console.log('- School:', schoolId);
    console.log('- Branch:', branchId, `(${branch.name})`);
    console.log('- User:', req.user!.email);

    const results: any[] = [];
    const errors: any[] = [];
    let lineNumber = 1;

    // Parse CSV
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (data) => {
          lineNumber++;
          try {
            // Validate row
            const validated = learnerSchema.parse(data);
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

    // Process valid records
    const created: any[] = [];
    const updated: any[] = [];
    const failed: any[] = [];

    for (const item of results) {
      try {
        const csvData = item.data;

        // Map CSV grade to enum
        const gradeMap: { [key: string]: Grade } = {
          'Play Group': 'PLAYGROUP',
          'PP1': 'PP1',
          'PP2': 'PP2',
          'Grade 1': 'GRADE_1',
          'Grade 2': 'GRADE_2',
          'Grade 3': 'GRADE_3',
          'Grade 4': 'GRADE_4',
          'Grade 5': 'GRADE_5',
          'Grade 6': 'GRADE_6',
          'Grade 7': 'GRADE_7',
          'Grade 8': 'GRADE_8',
          'Grade 9': 'GRADE_9',
        };

        const grade = gradeMap[csvData['Class']] || 'GRADE_1';

        // Split name into first and last
        const rawName = csvData['Learner Name'] || csvData['Leaner Name'] || '';
        const nameParts = rawName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0];

        // Handle Parent/Guardian creation or linking
        let parentId: string | undefined;
        const parentName = csvData['Parent/Guardian'];
        const parentPhone = csvData['Phone 1'] ? String(csvData['Phone 1']).trim() : null;

        if (parentPhone) {
          // Check if parent already exists by phone (scoped to school for multi-tenant safety, 
          // though usually users are global. Let's check globally first as phone is a good identifier)
          const existingParent = await prisma.user.findFirst({
            where: {
              phone: parentPhone,
              role: 'PARENT',
            }
          });

          if (existingParent) {
            parentId = existingParent.id;
            // Optionally update school association if missing
            if (!existingParent.schoolId) {
              await prisma.user.update({
                where: { id: parentId },
                data: { schoolId }
              });
            }
          } else if (parentName) {
            // Create new parent user with robust details
            const nameParts = parentName.trim().split(' ');
            const pFirstName = nameParts[0] || 'Parent';
            const pLastName = nameParts.slice(1).join(' ') || 'Guardian';

            // Clean phone for email generation: remove non-digits
            const cleanPhone = parentPhone.replace(/\D/g, '');
            // Generate a unique email if we don't have one (Prisma User model requires email)
            const email = `parent.${cleanPhone || Math.random().toString(36).substring(7)}@edu-core.test`;

            // Final check to ensure email doesn't exist
            const emailCheck = await prisma.user.findUnique({ where: { email } });
            const finalEmail = emailCheck ? `parent.${cleanPhone}.${Date.now()}@edu-core.test` : email;

            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash('Parent@123', 10);

            const newParent = await prisma.user.create({
              data: {
                email: finalEmail,
                password: hashedPassword,
                firstName: pFirstName,
                lastName: pLastName,
                phone: parentPhone,
                role: 'PARENT',
                status: 'ACTIVE',
                schoolId,
              }
            });
            parentId = newParent.id;
            console.log(`- Created new parent: ${pFirstName} ${pLastName} (${finalEmail})`);
          }
        }

        // Parse registration date
        let admissionDate = new Date();
        if (csvData['Reg Date']) {
          const dateParts = csvData['Reg Date'].split('/');
          if (dateParts.length === 3) {
            // Assume format DD/MM/YYYY
            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(dateParts[2], 10);
            const parsedDate = new Date(year, month, day);

            // Validate the date
            if (!isNaN(parsedDate.getTime())) {
              admissionDate = parsedDate;
            } else {
              console.warn(`Invalid Reg Date for ${csvData['Adm No']}: ${csvData['Reg Date']}. Using current date.`);
            }
          }
        }

        // Check if admission number already exists within school
        const existing = await prisma.learner.findUnique({
          where: {
            schoolId_admissionNumber: {
              schoolId: schoolId,
              admissionNumber: csvData['Adm No']
            }
          }
        });

        if (existing) {
          // Update existing learner
          await prisma.learner.update({
            where: { id: existing.id },
            data: {
              parentId: parentId, // Update link
              guardianName: csvData['Parent/Guardian'] || undefined,
              guardianPhone: csvData['Phone 1'] || undefined,
            }
          });

          updated.push({
            line: item.line,
            id: existing.id,
            admNo: csvData['Adm No'],
            name: csvData['Leaner Name']
          });
        } else {
          // Create learner
          const learner = await prisma.learner.create({
            data: {
              schoolId,
              branchId,
              admissionNumber: csvData['Adm No'],
              firstName,
              lastName,
              dateOfBirth: new Date(2010, 0, 1), // Default DOB - should be updated later
              gender: 'MALE', // Default gender - should be updated later
              grade,
              stream: csvData['Stream'] || 'A',
              status: 'ACTIVE',
              admissionDate,
              guardianName: csvData['Parent/Guardian'] || undefined,
              guardianPhone: csvData['Phone 1'] || undefined,
              parentId: parentId, // Link to parent User record
            }
          });

          created.push({
            line: item.line,
            id: learner.id,
            admNo: csvData['Adm No'],
            name: csvData['Leaner Name']
          });
        }

      } catch (error) {
        failed.push({
          line: item.line,
          admNo: item.data['Adm No'],
          name: item.data['Leaner Name'],
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      context: {
        school: schoolId,
        branch: {
          id: branchId,
          name: branch.name,
          code: branch.code
        },
        uploadedBy: req.user!.email
      },
      summary: {
        total: lineNumber - 1,
        processed: results.length,
        created: created.length,
        updated: updated.length,
        failed: failed.length + errors.length,
        validationErrors: errors.length
      },
      details: {
        created,
        updated,
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
 * GET /api/bulk/learners/export
 * Export learners to CSV (scoped to user's school)
 */
router.get('/export', async (req: AuthRequest, res: Response) => {
  try {
    const { grade, status, branchId } = req.query;
    const schoolId = req.user!.schoolId!;

    // Build filter - always scoped to user's school
    const where: any = { schoolId };
    if (grade) where.grade = grade;
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;

    // Fetch learners
    const learners = await prisma.learner.findMany({
      where,
      include: {
        branch: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { admissionNumber: 'asc' }
      ]
    });

    // Transform data for CSV
    const csvData = learners.map((learner, index) => ({
      'ID': index + 1,
      'Learner Name': `${learner.firstName} ${learner.lastName}`,
      'Adm No': learner.admissionNumber,
      'Class': learner.grade.replace('_', ' '),
      'Branch': learner.branch.name,
      'Term': req.query.term || 'Term 1',
      'Year': req.query.year || new Date().getFullYear(),
      'Parent/Guardian': learner.guardianName || '',
      'Phone 1': learner.guardianPhone || '',
      'Phone 2': '',
      'Reg Date': learner.admissionDate ?
        new Date(learner.admissionDate).toLocaleDateString('en-GB').replace(/\//g, '/') : '',
      'Bal Due': '0.00'
    }));

    // Generate CSV
    const parser = new Parser({
      fields: [
        'ID', 'Learner Name', 'Adm No', 'Class', 'Branch', 'Term', 'Year',
        'Parent/Guardian', 'Phone 1', 'Phone 2', 'Reg Date', 'Bal Due'
      ]
    });
    const csv = parser.parse(csvData);

    // Send file
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="learners_export_${Date.now()}.csv"`);
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
 * GET /api/bulk/learners/template
 * Download CSV template for learners
 */
router.get('/template', (_req: Request, res: Response) => {
  const template = [
    {
      'ID': '1',
      'Leaner Name': 'John Doe',
      'Adm No': '1001',
      'Class': 'Grade 1',
      'Term': 'Term 1',
      'Year': '2026',
      'Parent/Guardian': 'Jane Doe',
      'Phone 1': '0712345678',
      'Phone 2': '0798765432',
      'Reg Date': '02/01/2026',
      'Bal Due': '0.00'
    }
  ];

  const parser = new Parser({
    fields: [
      'ID', 'Learner Name', 'Adm No', 'Class', 'Term', 'Year',
      'Parent/Guardian', 'Phone 1', 'Phone 2', 'Reg Date', 'Bal Due'
    ]
  });
  const csv = parser.parse(template);

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', 'attachment; filename="learners_template.csv"');
  res.send(csv);
});

export default router;
