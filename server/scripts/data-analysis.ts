/**
 * PHASE 1: Data Analysis Script
 * 
 * Purpose: Analyze current database state before making changes
 * - Count records in all tables
 * - Identify orphaned data
 * - Check for missing tenant references
 * - Generate comprehensive report
 * 
 * Run: ts-node migration-fixes/phase-1-analysis/data-analysis.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TableCount {
  table: string;
  count: number;
  hasSchoolId: boolean;
  hasBranchId: boolean;
  nullSchoolIdCount?: number;
  nullBranchIdCount?: number;
}

interface OrphanedData {
  table: string;
  issue: string;
  count: number;
  examples: any[];
}

interface AnalysisReport {
  timestamp: string;
  database: string;
  summary: {
    totalSchools: number;
    totalBranches: number;
    totalUsers: number;
    totalLearners: number;
    totalClasses: number;
    totalAssessments: number;
  };
  tableCounts: TableCount[];
  orphanedData: OrphanedData[];
  tenantIntegrity: {
    formativeAssessmentsWithoutSchool: number;
    summativeTestsWithoutSchool: number;
    summativeResultsWithoutSchool: number;
    classesWithoutBranch: number;
    learnersWithoutSchool: number;
  };
  recommendations: string[];
}

async function analyzeDatabase(): Promise<AnalysisReport> {
  console.log('🔍 Starting database analysis...\n');

  // Basic counts
  console.log('📊 Counting records in main tables...');
  const [
    schoolCount,
    branchCount,
    userCount,
    learnerCount,
    classCount,
    formativeCount,
    summativeTestCount,
    summativeResultCount,
    attendanceCount,
    streamConfigCount
  ] = await Promise.all([
    prisma.school.count(),
    prisma.branch.count(),
    prisma.user.count(),
    prisma.learner.count(),
    prisma.class.count(),
    prisma.formativeAssessment.count(),
    prisma.summativeTest.count(),
    prisma.summativeResult.count(),
    prisma.attendance.count(),
    prisma.streamConfig.count()
  ]);

  console.log(`  ✓ Schools: ${schoolCount}`);
  console.log(`  ✓ Branches: ${branchCount}`);
  console.log(`  ✓ Users: ${userCount}`);
  console.log(`  ✓ Learners: ${learnerCount}`);
  console.log(`  ✓ Classes: ${classCount}`);
  console.log(`  ✓ Formative Assessments: ${formativeCount}`);
  console.log(`  ✓ Summative Tests: ${summativeTestCount}`);
  console.log(`  ✓ Summative Results: ${summativeResultCount}`);
  console.log(`  ✓ Attendances: ${attendanceCount}\n`);

  // Check for orphaned data
  console.log('🔗 Checking for orphaned/inconsistent data...');
  const orphanedData: OrphanedData[] = [];

  // 1. Learners without valid school
  const learnersWithInvalidSchool = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM learners l
    LEFT JOIN schools s ON l."schoolId" = s.id
    WHERE l."schoolId" IS NOT NULL AND s.id IS NULL
  `;
  if ((learnersWithInvalidSchool as any)[0].count > 0) {
    orphanedData.push({
      table: 'learners',
      issue: 'Invalid schoolId reference',
      count: parseInt((learnersWithInvalidSchool as any)[0].count),
      examples: await prisma.$queryRaw`
        SELECT l.id, l."firstName", l."lastName", l."schoolId"
        FROM learners l
        LEFT JOIN schools s ON l."schoolId" = s.id
        WHERE l."schoolId" IS NOT NULL AND s.id IS NULL
        LIMIT 5
      `
    });
  }

  // 2. Classes without valid branch
  const classesWithInvalidBranch = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM classes c
    LEFT JOIN branches b ON c."branchId" = b.id
    WHERE c."branchId" IS NOT NULL AND b.id IS NULL
  `;
  if ((classesWithInvalidBranch as any)[0].count > 0) {
    orphanedData.push({
      table: 'classes',
      issue: 'Invalid branchId reference',
      count: parseInt((classesWithInvalidBranch as any)[0].count),
      examples: await prisma.$queryRaw`
        SELECT c.id, c.name, c."branchId"
        FROM classes c
        LEFT JOIN branches b ON c."branchId" = b.id
        WHERE c."branchId" IS NOT NULL AND b.id IS NULL
        LIMIT 5
      `
    });
  }

  // 3. FormativeAssessments with learners from different schools
  const formativeWithMismatchedSchool = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM formative_assessments fa
    INNER JOIN learners l ON fa."learnerId" = l.id
    INNER JOIN users u ON fa."teacherId" = u.id
    WHERE u."schoolId" IS NOT NULL 
      AND l."schoolId" IS NOT NULL 
      AND u."schoolId" != l."schoolId"
  `;
  if ((formativeWithMismatchedSchool as any)[0].count > 0) {
    orphanedData.push({
      table: 'formative_assessments',
      issue: 'Teacher and learner from different schools',
      count: parseInt((formativeWithMismatchedSchool as any)[0].count),
      examples: await prisma.$queryRaw`
        SELECT fa.id, u."schoolId" as teacher_school, l."schoolId" as learner_school
        FROM formative_assessments fa
        INNER JOIN learners l ON fa."learnerId" = l.id
        INNER JOIN users u ON fa."teacherId" = u.id
        WHERE u."schoolId" IS NOT NULL 
          AND l."schoolId" IS NOT NULL 
          AND u."schoolId" != l."schoolId"
        LIMIT 5
      `
    });
  }

  // 4. Users without school (excluding SUPER_ADMIN)
  const usersWithoutSchool = await prisma.user.count({
    where: {
      schoolId: null,
      role: { not: 'SUPER_ADMIN' }
    }
  });
  if (usersWithoutSchool > 0) {
    orphanedData.push({
      table: 'users',
      issue: 'Non-admin users without school assignment',
      count: usersWithoutSchool,
      examples: await prisma.user.findMany({
        where: {
          schoolId: null,
          role: { not: 'SUPER_ADMIN' }
        },
        select: {
          id: true,
          email: true,
          role: true
        },
        take: 5
      })
    });
  }

  console.log(`  Found ${orphanedData.length} orphaned data issues\n`);

  // Check tenant integrity (for tables that should have schoolId)
  console.log('🔐 Checking tenant integrity...');
  
  // Note: These tables don't have schoolId yet, so we check via relationships
  const formativeWithoutSchoolableLink = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM formative_assessments fa
    LEFT JOIN learners l ON fa."learnerId" = l.id
    WHERE l.id IS NULL OR l."schoolId" IS NULL
  `;

  const summativeTestsWithoutCreator = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM summative_tests st
    LEFT JOIN users u ON st."createdBy" = u.id
    WHERE u.id IS NULL OR u."schoolId" IS NULL
  `;

  const summativeResultsWithoutSchoolableLink = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM summative_results sr
    LEFT JOIN learners l ON sr."learnerId" = l.id
    WHERE l.id IS NULL OR l."schoolId" IS NULL
  `;

  const classesWithoutBranch = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM classes
    WHERE "branchId" IS NULL
  `;

  const learnersWithoutSchool = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM learners
    WHERE "schoolId" IS NULL
  `;

  const tenantIntegrity = {
    formativeAssessmentsWithoutSchool: parseInt((formativeWithoutSchoolableLink as any)[0].count),
    summativeTestsWithoutSchool: parseInt((summativeTestsWithoutCreator as any)[0].count),
    summativeResultsWithoutSchool: parseInt((summativeResultsWithoutSchoolableLink as any)[0].count),
    classesWithoutBranch: parseInt((classesWithoutBranch as any)[0].count),
    learnersWithoutSchool: parseInt((learnersWithoutSchool as any)[0].count)
  };

  console.log(`  ✓ Formative assessments without school link: ${tenantIntegrity.formativeAssessmentsWithoutSchool}`);
  console.log(`  ✓ Summative tests without school link: ${tenantIntegrity.summativeTestsWithoutSchool}`);
  console.log(`  ✓ Summative results without school link: ${tenantIntegrity.summativeResultsWithoutSchool}`);
  console.log(`  ✓ Classes without branch: ${tenantIntegrity.classesWithoutBranch}`);
  console.log(`  ✓ Learners without school: ${tenantIntegrity.learnersWithoutSchool}\n`);

  // Generate recommendations
  const recommendations: string[] = [];

  if (orphanedData.length > 0) {
    recommendations.push('⚠️  Fix orphaned data before proceeding with Phase 2 migration');
  }

  if (tenantIntegrity.formativeAssessmentsWithoutSchool > 0) {
    recommendations.push('⚠️  Some formative assessments have invalid learner references - clean up before migration');
  }

  if (tenantIntegrity.summativeTestsWithoutSchool > 0) {
    recommendations.push('⚠️  Some summative tests have invalid creator references - clean up before migration');
  }

  if (usersWithoutSchool > 0) {
    recommendations.push(`⚠️  ${usersWithoutSchool} non-admin users are not assigned to schools - assign them before migration`);
  }

  if (schoolCount === 0) {
    recommendations.push('❌ CRITICAL: No schools found in database. Create at least one school before proceeding.');
  }

  if (branchCount === 0 && learnerCount > 0) {
    recommendations.push('⚠️  No branches found but learners exist. Create branches and assign learners before migration.');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Database is in good state for Phase 2 migration');
    recommendations.push('✅ Proceed with creating database backup');
  }

  // Table counts with schema info
  const tableCounts: TableCount[] = [
    { table: 'schools', count: schoolCount, hasSchoolId: false, hasBranchId: false },
    { table: 'branches', count: branchCount, hasSchoolId: true, hasBranchId: false },
    { table: 'users', count: userCount, hasSchoolId: true, hasBranchId: true },
    { table: 'learners', count: learnerCount, hasSchoolId: true, hasBranchId: true },
    { table: 'classes', count: classCount, hasSchoolId: false, hasBranchId: true },
    { table: 'formative_assessments', count: formativeCount, hasSchoolId: false, hasBranchId: false },
    { table: 'summative_tests', count: summativeTestCount, hasSchoolId: false, hasBranchId: false },
    { table: 'summative_results', count: summativeResultCount, hasSchoolId: false, hasBranchId: false },
    { table: 'attendances', count: attendanceCount, hasSchoolId: false, hasBranchId: false },
    { table: 'stream_configs', count: streamConfigCount, hasSchoolId: true, hasBranchId: false }
  ];

  const report: AnalysisReport = {
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[1] || 'unknown',
    summary: {
      totalSchools: schoolCount,
      totalBranches: branchCount,
      totalUsers: userCount,
      totalLearners: learnerCount,
      totalClasses: classCount,
      totalAssessments: formativeCount + summativeTestCount + summativeResultCount
    },
    tableCounts,
    orphanedData,
    tenantIntegrity,
    recommendations
  };

  return report;
}

async function generateReport() {
  try {
    const report = await analyzeDatabase();

    // Save JSON report
    const reportDir = path.join(__dirname);
    const jsonPath = path.join(reportDir, `data-analysis-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 JSON report saved: ${jsonPath}`);

    // Generate markdown report
    const mdPath = path.join(reportDir, `data-analysis-${Date.now()}.md`);
    const markdown = generateMarkdownReport(report);
    fs.writeFileSync(mdPath, markdown);
    console.log(`📄 Markdown report saved: ${mdPath}\n`);

    // Print summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    ANALYSIS SUMMARY                        ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Database: ${report.database}`);
    console.log(`📅 Timestamp: ${report.timestamp}\n`);
    
    console.log('📈 RECORD COUNTS:');
    console.log(`   Schools:           ${report.summary.totalSchools}`);
    console.log(`   Branches:          ${report.summary.totalBranches}`);
    console.log(`   Users:             ${report.summary.totalUsers}`);
    console.log(`   Learners:          ${report.summary.totalLearners}`);
    console.log(`   Classes:           ${report.summary.totalClasses}`);
    console.log(`   Total Assessments: ${report.summary.totalAssessments}\n`);

    console.log('🔍 ISSUES FOUND:');
    console.log(`   Orphaned data issues: ${report.orphanedData.length}`);
    console.log(`   Tenant integrity issues: ${
      Object.values(report.tenantIntegrity).filter(v => v > 0).length
    }\n`);

    console.log('💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Exit with error code if critical issues found
    if (report.recommendations.some(r => r.includes('CRITICAL'))) {
      console.log('❌ CRITICAL ISSUES FOUND - DO NOT PROCEED WITH MIGRATION\n');
      process.exit(1);
    }

    if (report.orphanedData.length > 0 || Object.values(report.tenantIntegrity).some(v => v > 0)) {
      console.log('⚠️  WARNINGS FOUND - Review and fix before proceeding\n');
    } else {
      console.log('✅ Database ready for Phase 2 migration\n');
    }

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function generateMarkdownReport(report: AnalysisReport): string {
  let md = `# Database Analysis Report\n\n`;
  md += `**Generated:** ${report.timestamp}  \n`;
  md += `**Database:** ${report.database}\n\n`;
  
  md += `## Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Schools | ${report.summary.totalSchools} |\n`;
  md += `| Branches | ${report.summary.totalBranches} |\n`;
  md += `| Users | ${report.summary.totalUsers} |\n`;
  md += `| Learners | ${report.summary.totalLearners} |\n`;
  md += `| Classes | ${report.summary.totalClasses} |\n`;
  md += `| Total Assessments | ${report.summary.totalAssessments} |\n\n`;

  md += `## Table Details\n\n`;
  md += `| Table | Records | Has schoolId | Has branchId |\n`;
  md += `|-------|---------|--------------|-------------|\n`;
  report.tableCounts.forEach(tc => {
    md += `| ${tc.table} | ${tc.count} | ${tc.hasSchoolId ? '✅' : '❌'} | ${tc.hasBranchId ? '✅' : '❌'} |\n`;
  });
  md += `\n`;

  md += `## Tenant Integrity Check\n\n`;
  md += `| Issue | Count |\n`;
  md += `|-------|-------|\n`;
  md += `| Formative assessments without school link | ${report.tenantIntegrity.formativeAssessmentsWithoutSchool} |\n`;
  md += `| Summative tests without school link | ${report.tenantIntegrity.summativeTestsWithoutSchool} |\n`;
  md += `| Summative results without school link | ${report.tenantIntegrity.summativeResultsWithoutSchool} |\n`;
  md += `| Classes without branch | ${report.tenantIntegrity.classesWithoutBranch} |\n`;
  md += `| Learners without school | ${report.tenantIntegrity.learnersWithoutSchool} |\n\n`;

  if (report.orphanedData.length > 0) {
    md += `## ⚠️ Orphaned Data Issues\n\n`;
    report.orphanedData.forEach(issue => {
      md += `### ${issue.table}\n\n`;
      md += `**Issue:** ${issue.issue}  \n`;
      md += `**Count:** ${issue.count}  \n\n`;
      md += `**Examples:**\n\`\`\`json\n${JSON.stringify(issue.examples, null, 2)}\n\`\`\`\n\n`;
    });
  }

  md += `## 💡 Recommendations\n\n`;
  report.recommendations.forEach(rec => {
    md += `- ${rec}\n`;
  });

  return md;
}

// Run the analysis
generateReport();
