/**
 * Report Type Definitions
 * Comprehensive TypeScript interfaces for report system
 */

import { Term, DetailedRubricRating, SummativeGrade, AttendanceStatus } from '@prisma/client';

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// REPORT QUERY PARAMETERS
// ============================================

export interface TermlyReportQuery {
  term: Term;
  academicYear: number;
}

export interface AnalyticsQuery {
  academicYear: number;
  term?: Term;
  compareWithClass?: boolean;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'json';
  includeCharts?: boolean;
  includeComments?: boolean;
}

// ============================================
// CORE REPORT DATA TYPES
// ============================================

export interface LearnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  admissionNumber: string;
  grade: string;
  stream: string | null;
  dateOfBirth: Date | null;
  gender: string;
  parentInfo?: ParentInfo;
  schoolInfo?: SchoolInfo;
}

export interface ParentInfo {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
}

export interface SchoolInfo {
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  principalName: string | null;
}

// ============================================
// ASSESSMENT DATA TYPES
// ============================================

export interface FormativeAssessmentRecord {
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
  teacherName: string;
  assessedDate: Date;
}

export interface SummativeTestRecord {
  id: string;
  testTitle: string;
  learningArea: string;
  testDate: Date;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  grade: SummativeGrade;
  position: number | null;
  outOf: number | null;
  status: 'PASS' | 'FAIL';
  teacherComment: string | null;
}

export interface CoreCompetencyRecord {
  communication: RatingWithComment;
  criticalThinking: RatingWithComment;
  creativity: RatingWithComment;
  collaboration: RatingWithComment;
  citizenship: RatingWithComment;
  learningToLearn: RatingWithComment;
  assessorName: string;
  assessedDate: Date;
}

export interface RatingWithComment {
  rating: DetailedRubricRating;
  comment: string | null;
  points: number;
  percentage: number;
}

export interface ValuesRecord {
  love: DetailedRubricRating;
  responsibility: DetailedRubricRating;
  respect: DetailedRubricRating;
  unity: DetailedRubricRating;
  peace: DetailedRubricRating;
  patriotism: DetailedRubricRating;
  integrity: DetailedRubricRating;
  overallComment: string | null;
}

export interface CoCurricularRecord {
  id: string;
  activityName: string;
  activityType: string;
  performance: DetailedRubricRating;
  achievements: string | null;
  remarks: string | null;
}

export interface AttendanceRecord {
  date: Date;
  status: AttendanceStatus;
}

// ============================================
// SUMMARY & STATISTICS TYPES
// ============================================

export interface FormativeSummary {
  totalAssessments: number;
  averagePercentage: number;
  overallRating: DetailedRubricRating;
  learningAreasAssessed: string[];
  byLearningArea: SubjectPerformance[];
  distribution: RatingDistribution;
}

export interface SummativeSummary {
  totalTests: number;
  overallPercentage: number;
  overallGrade: SummativeGrade;
  passRate: number;
  bySubject: SubjectPerformance[];
  gradeDistribution: GradeDistribution;
}

export interface SubjectPerformance {
  subject: string;
  averagePercentage: number;
  grade?: SummativeGrade;
  rating?: DetailedRubricRating;
  testCount?: number;
  trend?: TrendIndicator;
}

export interface RatingDistribution {
  EE1: number;
  EE2: number;
  ME1: number;
  ME2: number;
  AE1: number;
  AE2: number;
  BE1: number;
  BE2: number;
}

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
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

// ============================================
// PERFORMANCE ANALYSIS TYPES
// ============================================

export interface OverallPerformance {
  academicAverage: number;
  competencyAverage: number;
  valuesAverage: number;
  overallGrade: SummativeGrade;
  performanceLevel: PerformanceLevel;
  remarks: string[];
}

export type PerformanceLevel =
  | 'Outstanding'
  | 'Excellent'
  | 'Very Good'
  | 'Good'
  | 'Fair'
  | 'Below Average'
  | 'Needs Improvement';

export interface TrendIndicator {
  direction: 'up' | 'down' | 'stable';
  strength: 'strong' | 'moderate' | 'weak';
  rate: number;
}

export interface PerformanceCategory {
  level: string;
  description: string;
  color: string;
  emoji: string;
}

// ============================================
// REPORT COMMENTS TYPES
// ============================================

export interface ReportComments {
  classTeacher: TeacherComment | null;
  headTeacher: TeacherComment | null;
  nextTermOpens: Date | null;
}

export interface TeacherComment {
  comment: string;
  teacherName: string;
  date: Date;
  signature?: string;
}

// ============================================
// COMPLETE REPORT TYPES
// ============================================

export interface TermlyReport {
  metadata: ReportMetadata;
  learner: LearnerProfile;
  academic: AcademicSection;
  cbc: CBCSection;
  attendance: AttendanceSummary;
  overall: OverallPerformance;
  comments: ReportComments;
  recommendations: string[];
}

export interface ReportMetadata {
  term: Term;
  academicYear: number;
  generatedDate: Date;
  generatedBy?: string;
  reportType: 'TERMLY' | 'PROGRESS' | 'FINAL';
  completeness: CompletenessStatus;
}

export interface CompletenessStatus {
  isComplete: boolean;
  missingComponents: string[];
  completionPercentage: number;
}

export interface AcademicSection {
  formative: {
    assessments: FormativeAssessmentRecord[];
    summary: FormativeSummary;
  };
  summative: {
    tests: SummativeTestRecord[];
    summary: SummativeSummary;
  };
}

export interface CBCSection {
  coreCompetencies: CoreCompetencyRecord | null;
  values: ValuesRecord | null;
  coCurricular: CoCurricularRecord[];
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface LearnerAnalytics {
  learner: LearnerProfile;
  academicYear: number;
  termlyProgress: TermlyProgress[];
  trends: PerformanceTrends;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  predictedPerformance?: PredictedPerformance;
}

export interface TermlyProgress {
  term: Term;
  formativeAverage: number;
  summativeAverage: number;
  overallAverage: number;
  attendanceRate: number;
  rank?: number;
}

export interface PerformanceTrends {
  academic: TrendData;
  attendance: TrendData;
  competencies: TrendData;
  overall: TrendIndicator;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  trend: TrendIndicator;
}

export interface PredictedPerformance {
  predictedGrade: SummativeGrade;
  predictedPercentage: number;
  confidence: number;
  basedOn: string;
}

// ============================================
// CLASS ANALYTICS TYPES
// ============================================

export interface ClassAnalytics {
  classInfo: ClassInfo;
  term: Term;
  academicYear: number;
  overview: ClassOverview;
  performance: ClassPerformance;
  topPerformers: TopPerformer[];
  areaAnalysis: AreaAnalysis[];
  recommendations: string[];
}

export interface ClassInfo {
  id: string;
  grade: string;
  stream: string | null;
  totalLearners: number;
  className: string;
}

export interface ClassOverview {
  totalAssessments: number;
  averagePerformance: number;
  passRate: number;
  attendanceRate: number;
}

export interface ClassPerformance {
  formative: {
    average: number;
    median: number;
    standardDeviation: number;
    distribution: RatingDistribution;
  };
  summative: {
    average: number;
    median: number;
    standardDeviation: number;
    distribution: GradeDistribution;
  };
}

export interface TopPerformer {
  learnerId: string;
  learnerName: string;
  averagePercentage: number;
  rank: number;
}

export interface AreaAnalysis {
  area: string;
  type: 'learning_area' | 'subject';
  averagePercentage: number;
  studentCount: number;
  passRate: number;
  status: 'strength' | 'neutral' | 'weakness';
}

// ============================================
// COMPARISON TYPES
// ============================================

export interface PerformanceComparison {
  learner: {
    percentage: number;
    grade: SummativeGrade;
    rank: number;
  };
  class: {
    average: number;
    median: number;
    highestScore: number;
    lowestScore: number;
  };
  percentile: number;
  position: string; // "Above average", "Average", "Below average"
  gap: number; // Difference from class average
}

export interface SubjectComparison {
  subject: string;
  learnerPerformance: number;
  classAverage: number;
  difference: number;
  status: 'above' | 'at' | 'below';
}

// ============================================
// EXPORT TYPES
// ============================================

export interface BulkReportExport {
  classId: string;
  term: Term;
  academicYear: number;
  format: 'pdf' | 'excel';
  reports: TermlyReport[];
  generatedDate: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'termly' | 'progress' | 'custom';
  sections: string[];
  createdBy: string;
  createdAt: Date;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
