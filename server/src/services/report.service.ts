/**
 * Report Service
 * Business logic for generating comprehensive assessment reports
 * NOW USES: calculationService for all score calculations
 * NOW USES: configService for term configuration
 */

import { PrismaClient, Term, DetailedRubricRating, SummativeGrade } from '@prisma/client';
import * as rubricUtil from '../utils/rubric.util';
import { gradingService } from './grading.service';
import { calculationService } from './calculation.service';
import { configService } from './config.service';

const prisma = new PrismaClient();

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface LearnerInfo {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  admissionNumber: string;
  grade: string;
  stream: string | null;
  dateOfBirth: Date | null;
  gender: string;
  parent?: {
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
  } | null;
}

export interface FormativeAssessmentData {
  id: string;
  learningArea: string;
  strand: string | null;
  subStrand: string | null;
  detailedRating: DetailedRubricRating | null;
  percentage: number | null;
  points: number | null;
  strengths: string | null;
  areasImprovement: string | null;
  remarks: string | null;
  teacher: {
    firstName: string;
    lastName: string;
  };
  type?: string; // Assessment type (CAT, OPENER, etc.)
}

export interface SummativeResultData {
  id: string;
  marksObtained: number;
  percentage: number;
  grade: SummativeGrade;
  status: string;
  position: number | null;
  outOf: number | null;
  teacherComment: string | null;
  test: {
    title: string;
    learningArea: string;
    totalMarks: number;
    passMarks: number;
    testDate: Date;
  };
}

export interface CoreCompetencyData {
  communication: DetailedRubricRating;
  communicationComment: string | null;
  criticalThinking: DetailedRubricRating;
  criticalThinkingComment: string | null;
  creativity: DetailedRubricRating;
  creativityComment: string | null;
  collaboration: DetailedRubricRating;
  collaborationComment: string | null;
  citizenship: DetailedRubricRating;
  citizenshipComment: string | null;
  learningToLearn: DetailedRubricRating;
  learningToLearnComment: string | null;
  assessor?: {
    firstName: string;
    lastName: string;
  };
}

export interface ValuesData {
  love: DetailedRubricRating;
  responsibility: DetailedRubricRating;
  respect: DetailedRubricRating;
  unity: DetailedRubricRating;
  peace: DetailedRubricRating;
  patriotism: DetailedRubricRating;
  integrity: DetailedRubricRating;
  comment: string | null;
}

export interface CoCurricularData {
  id: string;
  activityName: string;
  activityType: string;
  performance: DetailedRubricRating;
  achievements: string | null;
  remarks: string | null;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  sick: number;
  attendancePercentage: number;
}

export interface TermlyReportData {
  learner: LearnerInfo;
  term: Term;
  academicYear: number;
  formative: {
    assessments: FormativeAssessmentData[];
    summary: {
      totalAssessments: number;
      averagePercentage: number;
      overallRating: DetailedRubricRating;
      learningAreasAssessed: string[];
      byLearningArea: Array<{
        learningArea: string;
        rating: DetailedRubricRating;
        percentage: number;
      }>;
      byAssessmentType?: Array<{
        type: string;
        count: number;
        averagePercentage: number;
      }>;
    };
  };
  summative: {
    results: SummativeResultData[];
    summary: {
      totalTests: number;
      overallPercentage: number;
      overallGrade: SummativeGrade;
      passRate: number;
      bySubject: Array<{
        subject: string;
        averagePercentage: number;
        grade: SummativeGrade;
        testCount: number;
      }>;
    };
  };
  attendance: AttendanceSummary;
  coreCompetencies: CoreCompetencyData | null;
  values: ValuesData | null;
  coCurricular: CoCurricularData[];
  comments: {
    classTeacher: string | null;
    classTeacherName: string | null;
    classTeacherDate: Date | null;
    headTeacher: string | null;
    headTeacherName: string | null;
    headTeacherDate: Date | null;
    nextTermOpens: Date | null;
  } | null;
  overallPerformance: {
    academicAverage: number;
    competencyAverage: number;
    valuesAverage: number;
    overallGrade: string;
    performanceLevel: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Needs Improvement';
    remarks: string[];
    calculationBreakdown?: {
      formativeScore: number;
      formativeWeight: number;
      formativeContribution: number;
      summativeScore: number;
      summativeWeight: number;
      summativeContribution: number;
      finalScore: number;
    };
  };
  generatedDate: Date;
}

// ============================================
// MAIN SERVICE FUNCTIONS
// ============================================

/**
 * Generate comprehensive termly report for a learner
 * ✅ NOW USES calculationService for weighted scores
 */
export async function generateTermlyReport(
  learnerId: string,
  term: Term,
  academicYear: number
): Promise<TermlyReportData> {
  // Fetch learner information
  const learner = await fetchLearnerInfo(learnerId);

  // Fetch grading systems
  const summativeSystem = await gradingService.getGradingSystem(learner.schoolId, 'SUMMATIVE');
  const cbcSystem = await gradingService.getGradingSystem(learner.schoolId, 'CBC');

  // Get learner's class for calculation context
  const enrollment = await prisma.classEnrollment.findFirst({
    where: {
      learnerId,
      active: true
    },
    orderBy: {
      enrolledAt: 'desc'
    }
  });

  const classId = enrollment?.classId || '';

  // Fetch all assessment data in parallel
  const [
    formativeAssessments,
    summativeResults,
    attendanceRecords,
    coreCompetencies,
    valuesAssessment,
    coCurricularActivities,
    reportComments
  ] = await Promise.all([
    fetchFormativeAssessments(learnerId, term, academicYear),
    fetchSummativeResults(learnerId, term, academicYear),
    fetchAttendanceRecords(learnerId, term, academicYear),
    fetchCoreCompetencies(learnerId, term, academicYear),
    fetchValuesAssessment(learnerId, term, academicYear),
    fetchCoCurricularActivities(learnerId, term, academicYear),
    fetchReportComments(learnerId, term, academicYear)
  ]);

  // ✅ NEW: Calculate summaries using calculationService
  const formativeSummary = await calculateFormativeSummaryWithService(
    learnerId,
    classId,
    term,
    academicYear,
    formativeAssessments,
    cbcSystem.ranges
  );

  const summativeSummary = calculateSummativeSummary(summativeResults, summativeSystem.ranges);
  const attendanceSummary = calculateAttendanceSummary(attendanceRecords);
  
  // ✅ NEW: Calculate overall performance with weighted scoring
  const overallPerformance = await calculateOverallPerformanceWithWeights(
    learnerId,
    classId,
    term,
    academicYear,
    formativeSummary,
    summativeSummary,
    coreCompetencies,
    valuesAssessment,
    attendanceSummary
  );

  return {
    learner,
    term,
    academicYear,
    formative: {
      assessments: formativeAssessments,
      summary: formativeSummary
    },
    summative: {
      results: summativeResults,
      summary: summativeSummary
    },
    attendance: attendanceSummary,
    coreCompetencies,
    values: valuesAssessment,
    coCurricular: coCurricularActivities,
    comments: reportComments ? {
      classTeacher: reportComments.classTeacherComment,
      classTeacherName: reportComments.classTeacherName,
      classTeacherDate: reportComments.classTeacherDate,
      headTeacher: reportComments.headTeacherComment,
      headTeacherName: reportComments.headTeacherName,
      headTeacherDate: reportComments.headTeacherDate,
      nextTermOpens: reportComments.nextTermOpens
    } : null,
    overallPerformance,
    generatedDate: new Date()
  };
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

async function fetchLearnerInfo(learnerId: string): Promise<LearnerInfo> {
  const learner = await prisma.learner.findUnique({
    where: { id: learnerId },
    select: {
      id: true,
      schoolId: true,
      firstName: true,
      lastName: true,
      middleName: true,
      admissionNumber: true,
      grade: true,
      stream: true,
      dateOfBirth: true,
      gender: true,
      parent: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true
        }
      }
    }
  });

  if (!learner) {
    throw new Error(`Learner with ID ${learnerId} not found`);
  }

  return learner as LearnerInfo;
}

async function fetchFormativeAssessments(
  learnerId: string,
  term: Term,
  academicYear: number
): Promise<FormativeAssessmentData[]> {
  const assessments = await prisma.formativeAssessment.findMany({
    where: {
      learnerId,
      term,
      academicYear
    },
    select: {
      id: true,
      learningArea: true,
      strand: true,
      subStrand: true,
      detailedRating: true,
      percentage: true,
      points: true,
      strengths: true,
      areasImprovement: true,
      remarks: true,
      type: true, // ✅ NEW: Include assessment type
      teacher: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      learningArea: 'asc'
    }
  });

  return assessments as any;
}

async function fetchSummativeResults(
  learnerId: string,
  term: Term,
  academicYear: number
): Promise<SummativeResultData[]> {
  const results = await prisma.summativeResult.findMany({
    where: {
      learnerId,
      test: {
        term,
        academicYear
      }
    },
    select: {
      id: true,
      marksObtained: true,
      percentage: true,
      grade: true,
      status: true,
      position: true,
      outOf: true,
      teacherComment: true,
      test: {
        select: {
          title: true,
          learningArea: true,
          totalMarks: true,
          passMarks: true,
          testDate: true
        }
      }
    },
    orderBy: {
      test: {
        learningArea: 'asc'
      }
    }
  });

  return results as SummativeResultData[];
}

async function fetchAttendanceRecords(
  learnerId: string,
  term: Term,
  academicYear: number
) {
  // Note: Attendance model doesn't have term/academicYear fields
  // We'll fetch all records and filter by date if needed
  // For now, returning all records
  const records = await prisma.attendance.findMany({
    where: {
      learnerId
    },
    select: {
      id: true,
      date: true,
      status: true
    },
    orderBy: {
      date: 'desc'
    }
  });

  return records;
}

async function fetchCoreCompetencies(
  learnerId: string,
  term: Term,
  academicYear: number
): Promise<CoreCompetencyData | null> {
  const competencies = await prisma.coreCompetency.findUnique({
    where: {
      learnerId_term_academicYear: {
        learnerId,
        term,
        academicYear
      }
    },
    select: {
      communication: true,
      communicationComment: true,
      criticalThinking: true,
      criticalThinkingComment: true,
      creativity: true,
      creativityComment: true,
      collaboration: true,
      collaborationComment: true,
      citizenship: true,
      citizenshipComment: true,
      learningToLearn: true,
      learningToLearnComment: true,
      assessor: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return competencies as CoreCompetencyData | null;
}

async function fetchValuesAssessment(
  learnerId: string,
  term: Term,
  academicYear: number
): Promise<ValuesData | null> {
  const values = await prisma.valuesAssessment.findUnique({
    where: {
      learnerId_term_academicYear: {
        learnerId,
        term,
        academicYear
      }
    },
    select: {
      love: true,
      responsibility: true,
      respect: true,
      unity: true,
      peace: true,
      patriotism: true,
      integrity: true,
      comment: true
    }
  });

  return values as ValuesData | null;
}

async function fetchCoCurricularActivities(
  learnerId: string,
  term: Term,
  academicYear: number
): Promise<CoCurricularData[]> {
  const activities = await prisma.coCurricularActivity.findMany({
    where: {
      learnerId,
      term,
      academicYear
    },
    select: {
      id: true,
      activityName: true,
      activityType: true,
      performance: true,
      achievements: true,
      remarks: true
    },
    orderBy: {
      activityName: 'asc'
    }
  });

  return activities as CoCurricularData[];
}

async function fetchReportComments(
  learnerId: string,
  term: Term,
  academicYear: number
) {
  const comments = await prisma.termlyReportComment.findUnique({
    where: {
      learnerId_term_academicYear: {
        learnerId,
        term,
        academicYear
      }
    }
  });

  return comments;
}

// ============================================
// CALCULATION FUNCTIONS (UPDATED)
// ============================================

/**
 * ✅ NEW: Calculate formative summary using calculationService
 * Uses configured aggregation strategies per assessment type
 */
async function calculateFormativeSummaryWithService(
  learnerId: string,
  classId: string,
  term: Term,
  academicYear: number,
  assessments: FormativeAssessmentData[],
  ranges?: any[]
) {
  if (assessments.length === 0) {
    return {
      totalAssessments: 0,
      averagePercentage: 0,
      overallRating: 'BE2' as DetailedRubricRating,
      learningAreasAssessed: [],
      byLearningArea: [],
      byAssessmentType: []
    };
  }

  // ✅ Use calculationService to get overall formative score
  const calculationResult = await calculationService.calculateOverallFormativeScore({
    learnerId,
    classId,
    term,
    academicYear
  });

  const averagePercentage = Math.round(calculationResult.averagePercentage);

  const overallRating = ranges
    ? gradingService.calculateRatingSync(averagePercentage, ranges)
    : rubricUtil.percentageToDetailedRating(averagePercentage);

  // Group by learning area
  const areaMap = new Map<string, number[]>();
  assessments.forEach(a => {
    if (a.percentage !== null) {
      if (!areaMap.has(a.learningArea)) {
        areaMap.set(a.learningArea, []);
      }
      areaMap.get(a.learningArea)!.push(a.percentage);
    }
  });

  const byLearningArea = Array.from(areaMap.entries()).map(([area, percentages]) => {
    const avg = Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length);
    return {
      learningArea: area,
      rating: ranges
        ? gradingService.calculateRatingSync(avg, ranges)
        : rubricUtil.percentageToDetailedRating(avg),
      percentage: avg
    };
  });

  // ✅ NEW: Include breakdown by assessment type
  const byAssessmentType = calculationResult.breakdown.map(item => ({
    type: item.assessmentType,
    count: item.count,
    averagePercentage: Math.round(item.averagePercentage)
  }));

  return {
    totalAssessments: assessments.length,
    averagePercentage,
    overallRating,
    learningAreasAssessed: Array.from(areaMap.keys()),
    byLearningArea,
    byAssessmentType
  };
}

/**
 * Calculate summative summary (unchanged - works with results)
 */
function calculateSummativeSummary(results: SummativeResultData[], ranges?: any[]) {
  if (results.length === 0) {
    return {
      totalTests: 0,
      overallPercentage: 0,
      overallGrade: 'E' as SummativeGrade,
      passRate: 0,
      bySubject: []
    };
  }

  // Calculate overall stats
  const overallPercentage = Math.round(
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length
  );

  const overallGrade = ranges 
    ? gradingService.calculateGradeSync(overallPercentage, ranges) 
    : calculateGradeFromPercentage(overallPercentage);

  const passCount = results.filter(r => r.status === 'PASS').length;
  const passRate = Math.round((passCount / results.length) * 100);

  // Group by subject
  const subjectMap = new Map<string, SummativeResultData[]>();
  results.forEach(r => {
    const subject = r.test.learningArea;
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, []);
    }
    subjectMap.get(subject)!.push(r);
  });

  const bySubject = Array.from(subjectMap.entries()).map(([subject, subjectResults]) => {
    const avg = Math.round(
      subjectResults.reduce((sum, r) => sum + r.percentage, 0) / subjectResults.length
    );
    return {
      subject,
      averagePercentage: avg,
      grade: ranges 
        ? gradingService.calculateGradeSync(avg, ranges) 
        : calculateGradeFromPercentage(avg),
      testCount: subjectResults.length
    };
  });

  return {
    totalTests: results.length,
    overallPercentage,
    overallGrade,
    passRate,
    bySubject
  };
}

/**
 * Calculate attendance summary (unchanged)
 */
function calculateAttendanceSummary(records: any[]): AttendanceSummary {
  if (records.length === 0) {
    return {
      totalDays: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      sick: 0,
      attendancePercentage: 0
    };
  }

  const summary = {
    totalDays: records.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    sick: 0,
    attendancePercentage: 0
  };

  records.forEach(record => {
    switch (record.status) {
      case 'PRESENT':
        summary.present++;
        break;
      case 'ABSENT':
        summary.absent++;
        break;
      case 'LATE':
        summary.late++;
        break;
      case 'EXCUSED':
        summary.excused++;
        break;
      case 'SICK':
        summary.sick++;
        break;
    }
  });

  summary.attendancePercentage = Math.round((summary.present / summary.totalDays) * 100);

  return summary;
}

/**
 * ✅ NEW: Calculate overall performance with weighted scoring
 * Uses configService to get term weights and calculationService for final score
 */
async function calculateOverallPerformanceWithWeights(
  learnerId: string,
  classId: string,
  term: Term,
  academicYear: number,
  formativeSummary: Awaited<ReturnType<typeof calculateFormativeSummaryWithService>>,
  summativeSummary: ReturnType<typeof calculateSummativeSummary>,
  coreCompetencies: CoreCompetencyData | null,
  values: ValuesData | null,
  attendance: AttendanceSummary
) {
  let academicAverage = 0;
  let calculationBreakdown;

  // ✅ NEW: Calculate weighted final score if both formative and summative exist
  if (formativeSummary.totalAssessments > 0 && summativeSummary.totalTests > 0) {
    const finalScoreResult = await calculationService.calculateFinalScore({
      learnerId,
      classId,
      term,
      academicYear,
      formativeScore: formativeSummary.averagePercentage,
      summativeScore: summativeSummary.overallPercentage
    });

    academicAverage = Math.round(finalScoreResult.finalScore);

    // ✅ NEW: Include calculation breakdown for transparency
    calculationBreakdown = {
      formativeScore: formativeSummary.averagePercentage,
      formativeWeight: finalScoreResult.formativeWeight,
      formativeContribution: Math.round(finalScoreResult.formativeContribution),
      summativeScore: summativeSummary.overallPercentage,
      summativeWeight: finalScoreResult.summativeWeight,
      summativeContribution: Math.round(finalScoreResult.summativeContribution),
      finalScore: academicAverage
    };
  } else {
    // If only one type exists, use that
    academicAverage = formativeSummary.averagePercentage || summativeSummary.overallPercentage || 0;
  }

  // Calculate competency average
  let competencyAverage = 0;
  if (coreCompetencies) {
    const competencyRatings = [
      coreCompetencies.communication,
      coreCompetencies.criticalThinking,
      coreCompetencies.creativity,
      coreCompetencies.collaboration,
      coreCompetencies.citizenship,
      coreCompetencies.learningToLearn
    ];
    const points = competencyRatings.map(r => rubricUtil.ratingToPoints(r));
    const avgPoints = points.reduce((sum, p) => sum + p, 0) / points.length;
    competencyAverage = Math.round((avgPoints / 8) * 100); // Convert to percentage
  }

  // Calculate values average
  let valuesAverage = 0;
  if (values) {
    const valueRatings = [
      values.love,
      values.responsibility,
      values.respect,
      values.unity,
      values.peace,
      values.patriotism,
      values.integrity
    ];
    const points = valueRatings.map(r => rubricUtil.ratingToPoints(r));
    const avgPoints = points.reduce((sum, p) => sum + p, 0) / points.length;
    valuesAverage = Math.round((avgPoints / 8) * 100); // Convert to percentage
  }

  // Determine overall grade and performance level
  const overallGrade = calculateGradeFromPercentage(academicAverage);
  const performanceLevel = getPerformanceLevel(academicAverage);

  // Generate remarks
  const remarks = generatePerformanceRemarks(
    academicAverage,
    competencyAverage,
    valuesAverage,
    attendance.attendancePercentage
  );

  return {
    academicAverage,
    competencyAverage,
    valuesAverage,
    overallGrade,
    performanceLevel,
    remarks,
    calculationBreakdown // ✅ NEW: Include for transparency
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateGradeFromPercentage(percentage: number): SummativeGrade {
  if (percentage >= 80) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'E';
}

function getPerformanceLevel(percentage: number): 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Needs Improvement' {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 70) return 'Very Good';
  if (percentage >= 60) return 'Good';
  if (percentage >= 50) return 'Fair';
  return 'Needs Improvement';
}

function generatePerformanceRemarks(
  academicAvg: number,
  competencyAvg: number,
  valuesAvg: number,
  attendanceRate: number
): string[] {
  const remarks: string[] = [];

  // Academic remarks
  if (academicAvg >= 80) {
    remarks.push('Outstanding academic performance. Keep up the excellent work!');
  } else if (academicAvg >= 70) {
    remarks.push('Very good academic progress. Continue striving for excellence.');
  } else if (academicAvg >= 60) {
    remarks.push('Good academic performance. Focus on areas needing improvement.');
  } else if (academicAvg >= 50) {
    remarks.push('Fair academic performance. Additional effort required in some subjects.');
  } else {
    remarks.push('Academic performance needs significant improvement. Extra support recommended.');
  }

  // Competency remarks
  if (competencyAvg > 0) {
    if (competencyAvg >= 75) {
      remarks.push('Excellent demonstration of core competencies.');
    } else if (competencyAvg >= 60) {
      remarks.push('Good development of core competencies.');
    } else {
      remarks.push('Core competencies need further development.');
    }
  }

  // Values remarks
  if (valuesAvg > 0) {
    if (valuesAvg >= 75) {
      remarks.push('Exemplary demonstration of national values.');
    } else if (valuesAvg >= 60) {
      remarks.push('Good adherence to national values.');
    } else {
      remarks.push('Values development needs attention.');
    }
  }

  // Attendance remarks
  if (attendanceRate >= 95) {
    remarks.push('Excellent attendance record.');
  } else if (attendanceRate >= 85) {
    remarks.push('Good attendance.');
  } else if (attendanceRate >= 75) {
    remarks.push('Attendance needs improvement.');
  } else if (attendanceRate > 0) {
    remarks.push('Poor attendance affecting academic progress. Immediate attention required.');
  }

  return remarks;
}
