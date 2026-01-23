/**
 * Report Controller
 * Handles comprehensive assessment reporting
 * - Formative Reports
 * - Summative Reports  
 * - Termly Reports (aggregated)
 * - Analytics
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import { PrismaClient, Term } from '@prisma/client';
import * as rubricUtil from '../utils/rubric.util';

const prisma = new PrismaClient();

// ============================================
// FORMATIVE REPORT
// ============================================

/**
 * Get Comprehensive Formative Report for a Learner
 * GET /api/reports/formative/:learnerId
 */
export const getFormativeReport = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Term and academic year are required'
      });
    }

    // Get learner details
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        admissionNumber: true,
        grade: true,
        stream: true,
        dateOfBirth: true,
        gender: true
      }
    });

    if (!learner) {
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    // Get all formative assessments for this term
    const assessments = await prisma.formativeAssessment.findMany({
      where: {
        learnerId,
        term: term as Term,
        academicYear: parseInt(academicYear as string)
      },
      include: {
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

    // Calculate summary statistics
    const summary = calculateFormativeSummary(assessments);

    // Get class teacher comment (if exists)
    const teacherComment = await prisma.termlyReportComment.findUnique({
      where: {
        learnerId_term_academicYear: {
          learnerId,
          term: term as Term,
          academicYear: parseInt(academicYear as string)
        }
      },
      select: {
        classTeacherComment: true,
        classTeacherName: true,
        classTeacherDate: true
      }
    });

    res.json({
      success: true,
      data: {
        learner,
        term,
        academicYear: parseInt(academicYear as string),
        assessments,
        summary,
        teacherComment,
        generatedDate: new Date(),
        totalAssessments: assessments.length
      }
    });

  } catch (error: any) {
    console.error('Error generating formative report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate formative report',
      error: error.message
    });
  }
};

// ============================================
// SUMMATIVE REPORT
// ============================================

/**
 * Get Comprehensive Summative Report for a Learner
 * GET /api/reports/summative/:learnerId
 */
export const getSummativeReport = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Term and academic year are required'
      });
    }

    // Get learner details
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        admissionNumber: true,
        grade: true,
        stream: true
      }
    });

    if (!learner) {
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    // Get all summative results for this term
    const results = await prisma.summativeResult.findMany({
      where: {
        learnerId,
        test: {
          term: term as Term,
          academicYear: parseInt(academicYear as string)
        }
      },
      include: {
        test: {
          select: {
            title: true,
            learningArea: true,
            testDate: true,
            totalMarks: true,
            passMarks: true
          }
        },
        recorder: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        test: {
          learningArea: 'asc'
        }
      }
    });

    // Group results by learning area and calculate aggregates
    const subjectSummary = calculateSubjectSummary(results);

    // Calculate overall statistics
    const overallStats = {
      totalTests: results.length,
      averagePercentage: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0,
      passRate: results.length > 0
        ? Math.round((results.filter(r => r.status === 'PASS').length / results.length) * 100)
        : 0
    };

    res.json({
      success: true,
      data: {
        learner,
        term,
        academicYear: parseInt(academicYear as string),
        results,
        subjectSummary,
        overallStats,
        generatedDate: new Date(),
        totalTests: results.length
      }
    });

  } catch (error: any) {
    console.error('Error generating summative report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summative report',
      error: error.message
    });
  }
};

// ============================================
// TERMLY REPORT (COMPREHENSIVE)
// ============================================

/**
 * Get Complete Termly Report for a Learner
 * Combines formative, summative, attendance, competencies, values, etc.
 * GET /api/reports/termly/:learnerId
 */
export const getTermlyReport = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Term and academic year are required'
      });
    }

    // Get learner details
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
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
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    const termValue = term as Term;
    const yearValue = parseInt(academicYear as string);

    // Parallel fetch all report components
    const [
      formativeAssessments,
      summativeResults,
      attendanceRecords,
      coreCompetencies,
      valuesAssessment,
      coCurricularActivities,
      reportComments
    ] = await Promise.all([
      // Formative assessments
      prisma.formativeAssessment.findMany({
        where: { learnerId, term: termValue, academicYear: yearValue },
        include: { teacher: { select: { firstName: true, lastName: true } } }
      }),

      // Summative results
      prisma.summativeResult.findMany({
        where: {
          learnerId,
          test: { term: termValue, academicYear: yearValue }
        },
        include: {
          test: {
            select: {
              title: true,
              learningArea: true,
              totalMarks: true,
              passMarks: true
            }
          }
        }
      }),

      // Attendance (Note: no term/year fields in schema, filter by date if needed)
      prisma.attendance.findMany({
        where: {
          learnerId
        }
      }),

      // Core competencies
      prisma.coreCompetency.findUnique({
        where: {
          learnerId_term_academicYear: {
            learnerId,
            term: termValue,
            academicYear: yearValue
          }
        },
        include: {
          assessor: { select: { firstName: true, lastName: true } }
        }
      }),

      // Values
      prisma.valuesAssessment.findUnique({
        where: {
          learnerId_term_academicYear: {
            learnerId,
            term: termValue,
            academicYear: yearValue
          }
        }
      }),

      // Co-curricular
      prisma.coCurricularActivity.findMany({
        where: {
          learnerId,
          term: termValue,
          academicYear: yearValue
        }
      }),

      // Comments
      prisma.termlyReportComment.findUnique({
        where: {
          learnerId_term_academicYear: {
            learnerId,
            term: termValue,
            academicYear: yearValue
          }
        }
      })
    ]);

    // Calculate summaries
    const formativeSummary = calculateFormativeSummary(formativeAssessments);
    const summativeSummary = calculateSubjectSummary(summativeResults);
    const attendanceSummary = calculateAttendanceSummary(attendanceRecords);

    res.json({
      success: true,
      data: {
        learner,
        term: termValue,
        academicYear: yearValue,
        
        // Academic Performance
        formative: {
          assessments: formativeAssessments,
          summary: formativeSummary
        },
        summative: {
          results: summativeResults,
          summary: summativeSummary
        },
        
        // Attendance
        attendance: attendanceSummary,
        
        // CBC Specific
        coreCompetencies,
        values: valuesAssessment,
        coCurricular: coCurricularActivities,
        
        // Comments & Admin
        comments: reportComments,
        
        // Metadata
        generatedDate: new Date(),
        reportType: 'TERMLY_COMPREHENSIVE'
      }
    });

  } catch (error: any) {
    console.error('Error generating termly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate termly report',
      error: error.message
    });
  }
};

// ============================================
// ANALYTICS
// ============================================

/**
 * Get Class Performance Analytics
 * GET /api/reports/analytics/class/:classId
 */
export const getClassAnalytics = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Term and academic year are required'
      });
    }

    // Get class details
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          where: { active: true },
          select: { id: true }
        }
      }
    });

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Get all learners in this class
    const learners = await prisma.learner.findMany({
      where: {
        enrollments: {
          some: {
            classId,
            active: true
          }
        },
        status: 'ACTIVE'
      },
      select: { id: true }
    });

    const learnerIds = learners.map(l => l.id);

    // Get all formative assessments for the class
    const formativeAssessments = await prisma.formativeAssessment.findMany({
      where: {
        learnerId: { in: learnerIds },
        term: term as Term,
        academicYear: parseInt(academicYear as string)
      }
    });

    // Get all summative results for the class
    const summativeResults = await prisma.summativeResult.findMany({
      where: {
        learnerId: { in: learnerIds },
        test: {
          term: term as Term,
          academicYear: parseInt(academicYear as string)
        }
      },
      include: {
        test: {
          select: { learningArea: true }
        }
      }
    });

    // Calculate analytics
    const analytics = {
      class: {
        id: classInfo.id,
        grade: classInfo.grade,
        stream: classInfo.stream,
        totalLearners: classInfo.enrollments.length
      },
      
      formative: analyzeFormativePerformance(formativeAssessments),
      summative: analyzeSummativePerformance(summativeResults),
      
      trends: calculatePerformanceTrends(formativeAssessments, summativeResults),
      
      recommendations: generateRecommendations(formativeAssessments, summativeResults)
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error: any) {
    console.error('Error generating class analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate class analytics',
      error: error.message
    });
  }
};

/**
 * Get Individual Learner Analytics
 * GET /api/reports/analytics/learner/:learnerId
 */
export const getLearnerAnalytics = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { academicYear } = req.query;

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required'
      });
    }

    const yearValue = parseInt(academicYear as string);

    // Get learner details
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        grade: true,
        stream: true
      }
    });

    if (!learner) {
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    // Get all assessments across all terms for the year
    const [term1Formative, term2Formative, term3Formative] = await Promise.all([
      prisma.formativeAssessment.findMany({
        where: { learnerId, term: 'TERM_1', academicYear: yearValue }
      }),
      prisma.formativeAssessment.findMany({
        where: { learnerId, term: 'TERM_2', academicYear: yearValue }
      }),
      prisma.formativeAssessment.findMany({
        where: { learnerId, term: 'TERM_3', academicYear: yearValue }
      })
    ]);

    const [term1Summative, term2Summative, term3Summative] = await Promise.all([
      prisma.summativeResult.findMany({
        where: {
          learnerId,
          test: { term: 'TERM_1', academicYear: yearValue }
        },
        include: { test: { select: { learningArea: true } } }
      }),
      prisma.summativeResult.findMany({
        where: {
          learnerId,
          test: { term: 'TERM_2', academicYear: yearValue }
        },
        include: { test: { select: { learningArea: true } } }
      }),
      prisma.summativeResult.findMany({
        where: {
          learnerId,
          test: { term: 'TERM_3', academicYear: yearValue }
        },
        include: { test: { select: { learningArea: true } } }
      })
    ]);

    // Analyze progress across terms
    const progressAnalysis = {
      learner,
      academicYear: yearValue,
      
      termlyProgress: {
        term1: {
          formative: calculateFormativeSummary(term1Formative),
          summative: calculateSubjectSummary(term1Summative)
        },
        term2: {
          formative: calculateFormativeSummary(term2Formative),
          summative: calculateSubjectSummary(term2Summative)
        },
        term3: {
          formative: calculateFormativeSummary(term3Formative),
          summative: calculateSubjectSummary(term3Summative)
        }
      },
      
      trends: analyzeIndividualTrends(
        [term1Formative, term2Formative, term3Formative],
        [term1Summative, term2Summative, term3Summative]
      ),
      
      strengths: identifyStrengths([...term1Formative, ...term2Formative, ...term3Formative]),
      weaknesses: identifyWeaknesses([...term1Summative, ...term2Summative, ...term3Summative]),
      
      recommendations: generateLearnerRecommendations(
        [...term1Formative, ...term2Formative, ...term3Formative],
        [...term1Summative, ...term2Summative, ...term3Summative]
      )
    };

    res.json({
      success: true,
      data: progressAnalysis
    });

  } catch (error: any) {
    console.error('Error generating learner analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate learner analytics',
      error: error.message
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateFormativeSummary(assessments: any[]) {
  if (assessments.length === 0) {
    return {
      totalAssessments: 0,
      averagePercentage: 0,
      distribution: { EE1: 0, EE2: 0, ME1: 0, ME2: 0, AE1: 0, AE2: 0, BE1: 0, BE2: 0 },
      learningAreasAssessed: []
    };
  }

  const distribution: any = { EE1: 0, EE2: 0, ME1: 0, ME2: 0, AE1: 0, AE2: 0, BE1: 0, BE2: 0 };
  let totalPercentage = 0;
  const learningAreas = new Set<string>();

  assessments.forEach(assessment => {
    if (assessment.detailedRating) {
      distribution[assessment.detailedRating] = (distribution[assessment.detailedRating] || 0) + 1;
    }
    if (assessment.percentage) {
      totalPercentage += assessment.percentage;
    }
    learningAreas.add(assessment.learningArea);
  });

  return {
    totalAssessments: assessments.length,
    averagePercentage: Math.round(totalPercentage / assessments.length),
    distribution,
    learningAreasAssessed: Array.from(learningAreas)
  };
}

function calculateSubjectSummary(results: any[]) {
  if (results.length === 0) {
    return {
      subjects: [],
      overallAverage: 0,
      totalTests: 0
    };
  }

  const subjectMap = new Map<string, any>();

  results.forEach(result => {
    const subject = result.test.learningArea;
    
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        subject,
        tests: [],
        totalMarks: 0,
        averagePercentage: 0,
        averageGrade: '',
        bestScore: 0,
        lowestScore: 100
      });
    }

    const subjectData = subjectMap.get(subject);
    subjectData.tests.push(result);
    subjectData.totalMarks += result.marksObtained;
    subjectData.bestScore = Math.max(subjectData.bestScore, result.percentage);
    subjectData.lowestScore = Math.min(subjectData.lowestScore, result.percentage);
  });

  const subjects = Array.from(subjectMap.values()).map(subject => {
    const avgPercentage = subject.tests.reduce((sum: number, t: any) => sum + t.percentage, 0) / subject.tests.length;
    return {
      ...subject,
      averagePercentage: Math.round(avgPercentage),
      averageGrade: calculateGradeFromPercentage(avgPercentage),
      testCount: subject.tests.length
    };
  });

  const overallAverage = Math.round(
    subjects.reduce((sum, s) => sum + s.averagePercentage, 0) / subjects.length
  );

  return {
    subjects,
    overallAverage,
    totalTests: results.length
  };
}

function calculateAttendanceSummary(records: any[]) {
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
      case 'PRESENT': summary.present++; break;
      case 'ABSENT': summary.absent++; break;
      case 'LATE': summary.late++; break;
      case 'EXCUSED': summary.excused++; break;
      case 'SICK': summary.sick++; break;
    }
  });

  summary.attendancePercentage = Math.round((summary.present / summary.totalDays) * 100);

  return summary;
}

function calculateGradeFromPercentage(percentage: number): string {
  if (percentage >= 80) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'E';
}

function analyzeFormativePerformance(assessments: any[]) {
  const byLearningArea = new Map<string, any[]>();
  
  assessments.forEach(a => {
    if (!byLearningArea.has(a.learningArea)) {
      byLearningArea.set(a.learningArea, []);
    }
    byLearningArea.get(a.learningArea)!.push(a);
  });

  const analysis: any[] = [];
  byLearningArea.forEach((assessments, area) => {
    const avgPercentage = assessments.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessments.length;
    const distribution: any = { EE: 0, ME: 0, AE: 0, BE: 0 };
    
    assessments.forEach(a => {
      if (a.detailedRating) {
        if (a.detailedRating.startsWith('EE')) distribution.EE++;
        else if (a.detailedRating.startsWith('ME')) distribution.ME++;
        else if (a.detailedRating.startsWith('AE')) distribution.AE++;
        else if (a.detailedRating.startsWith('BE')) distribution.BE++;
      }
    });

    analysis.push({
      learningArea: area,
      studentCount: assessments.length,
      averagePercentage: Math.round(avgPercentage),
      distribution
    });
  });

  return analysis;
}

function analyzeSummativePerformance(results: any[]) {
  const bySubject = new Map<string, any[]>();
  
  results.forEach(r => {
    const subject = r.test.learningArea;
    if (!bySubject.has(subject)) {
      bySubject.set(subject, []);
    }
    bySubject.get(subject)!.push(r);
  });

  const analysis: any[] = [];
  bySubject.forEach((results, subject) => {
    const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    const gradeDistribution: any = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    
    results.forEach(r => {
      gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
    });

    analysis.push({
      subject,
      studentCount: results.length,
      averagePercentage: Math.round(avgPercentage),
      averageGrade: calculateGradeFromPercentage(avgPercentage),
      gradeDistribution,
      passRate: Math.round((results.filter(r => r.status === 'PASS').length / results.length) * 100)
    });
  });

  return analysis;
}

function calculatePerformanceTrends(formative: any[], summative: any[]) {
  // Simple trend analysis
  return {
    formativeAveragePercentage: formative.length > 0 
      ? Math.round(formative.reduce((sum, a) => sum + (a.percentage || 0), 0) / formative.length)
      : 0,
    summativeAveragePercentage: summative.length > 0
      ? Math.round(summative.reduce((sum, r) => sum + r.percentage, 0) / summative.length)
      : 0,
    alignment: 'Data suggests consistent performance' // Can be more sophisticated
  };
}

function generateRecommendations(formative: any[], summative: any[]) {
  const recommendations: string[] = [];

  const formativeAvg = formative.length > 0 
    ? formative.reduce((sum, a) => sum + (a.percentage || 0), 0) / formative.length
    : 0;
    
  const summativeAvg = summative.length > 0
    ? summative.reduce((sum, r) => sum + r.percentage, 0) / summative.length
    : 0;

  if (formativeAvg < 50) {
    recommendations.push('Consider additional formative assessment support and remedial classes');
  }
  
  if (summativeAvg < 50) {
    recommendations.push('Focus on test-taking strategies and exam preparation');
  }

  if (formativeAvg > summativeAvg + 10) {
    recommendations.push('Bridge gap between formative understanding and summative performance');
  }

  return recommendations.length > 0 ? recommendations : ['Continue with current teaching strategies'];
}

function analyzeIndividualTrends(formativeTerms: any[][], summativeTerms: any[][]) {
  const trends: any[] = [];

  for (let i = 0; i < 3; i++) {
    const formativeAvg = formativeTerms[i].length > 0
      ? formativeTerms[i].reduce((sum, a) => sum + (a.percentage || 0), 0) / formativeTerms[i].length
      : 0;
      
    const summativeAvg = summativeTerms[i].length > 0
      ? summativeTerms[i].reduce((sum, r) => sum + r.percentage, 0) / summativeTerms[i].length
      : 0;

    trends.push({
      term: i + 1,
      formativeAverage: Math.round(formativeAvg),
      summativeAverage: Math.round(summativeAvg),
      overall: Math.round((formativeAvg + summativeAvg) / 2)
    });
  }

  return trends;
}

function identifyStrengths(assessments: any[]) {
  const areaPerformance = new Map<string, number>();
  const areaCount = new Map<string, number>();

  assessments.forEach(a => {
    const area = a.learningArea;
    areaPerformance.set(area, (areaPerformance.get(area) || 0) + (a.percentage || 0));
    areaCount.set(area, (areaCount.get(area) || 0) + 1);
  });

  const strengths: any[] = [];
  areaPerformance.forEach((total, area) => {
    const avg = total / areaCount.get(area)!;
    if (avg >= 70) {
      strengths.push({ learningArea: area, averagePercentage: Math.round(avg) });
    }
  });

  return strengths.sort((a, b) => b.averagePercentage - a.averagePercentage);
}

function identifyWeaknesses(results: any[]) {
  const subjectPerformance = new Map<string, number>();
  const subjectCount = new Map<string, number>();

  results.forEach(r => {
    const subject = r.test.learningArea;
    subjectPerformance.set(subject, (subjectPerformance.get(subject) || 0) + r.percentage);
    subjectCount.set(subject, (subjectCount.get(subject) || 0) + 1);
  });

  const weaknesses: any[] = [];
  subjectPerformance.forEach((total, subject) => {
    const avg = total / subjectCount.get(subject)!;
    if (avg < 50) {
      weaknesses.push({ subject, averagePercentage: Math.round(avg) });
    }
  });

  return weaknesses.sort((a, b) => a.averagePercentage - b.averagePercentage);
}

function generateLearnerRecommendations(formative: any[], summative: any[]) {
  const recommendations: string[] = [];

  const weakSubjects = identifyWeaknesses(summative);
  
  if (weakSubjects.length > 0) {
    weakSubjects.forEach(w => {
      recommendations.push(`Focus on improving ${w.subject} through additional practice`);
    });
  }

  const formativeAvg = formative.length > 0 
    ? formative.reduce((sum, a) => sum + (a.percentage || 0), 0) / formative.length
    : 0;

  if (formativeAvg >= 80) {
    recommendations.push('Excellent overall performance - maintain consistency');
  } else if (formativeAvg >= 60) {
    recommendations.push('Good progress - work on areas needing improvement');
  } else {
    recommendations.push('Requires additional support and remedial intervention');
  }

  return recommendations;
}
