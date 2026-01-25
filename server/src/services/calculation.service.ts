/**
 * Calculation Service
 * Handles all score calculations using configured weights and aggregation rules
 * Implements various aggregation strategies for formative assessments
 */

import { PrismaClient, FormativeAssessment, AggregationStrategy, FormativeAssessmentType, Term, Grade } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AggregationConfig {
  strategy: AggregationStrategy;
  nValue?: number | null;
  weight?: number;
}

interface FormativeScoreBreakdown {
  assessmentType: FormativeAssessmentType;
  count: number;
  averageScore: number;
  averagePercentage: number;
  weight: number;
}

interface OverallFormativeScore {
  averagePercentage: number;
  breakdown: FormativeScoreBreakdown[];
  totalAssessments: number;
  strategy: string;
}

interface FinalScoreResult {
  finalScore: number;
  finalPercentage: number;
  formativeContribution: number;
  summativeContribution: number;
  formativeWeight: number;
  summativeWeight: number;
  formativeScore: number;
  summativeScore: number;
}

// ============================================
// CALCULATION SERVICE
// ============================================

export class CalculationService {
  
  /**
   * Calculate formative average using configured aggregation strategy
   * @param assessments - Array of formative assessments
   * @param config - Aggregation configuration
   * @returns Calculated average percentage
   */
  async calculateFormativeAverage(
    assessments: FormativeAssessment[],
    config: AggregationConfig
  ): Promise<number> {
    if (!assessments || assessments.length === 0) {
      return 0;
    }

    // Extract percentages from assessments
    const percentages = assessments
      .map(a => a.percentage)
      .filter((p): p is number => p !== null);

    if (percentages.length === 0) {
      return 0;
    }

    // Apply aggregation strategy
    switch (config.strategy) {
      case 'SIMPLE_AVERAGE':
        return this.simpleAverage(percentages);

      case 'BEST_N':
        return this.bestN(percentages, config.nValue || 3);

      case 'DROP_LOWEST_N':
        return this.dropLowestN(percentages, config.nValue || 1);

      case 'WEIGHTED_AVERAGE':
        return this.weightedAverage(assessments);

      case 'MEDIAN':
        return this.median(percentages);

      default:
        return this.simpleAverage(percentages);
    }
  }

  /**
   * Simple average of all scores
   */
  private simpleAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / scores.length) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Take best N scores and average them
   * @param scores - Array of scores
   * @param n - Number of best scores to use
   */
  private bestN(scores: number[], n: number): number {
    if (scores.length === 0) return 0;
    if (n >= scores.length) return this.simpleAverage(scores);

    // Sort descending and take top N
    const sorted = [...scores].sort((a, b) => b - a);
    const bestScores = sorted.slice(0, n);
    
    return this.simpleAverage(bestScores);
  }

  /**
   * Drop N lowest scores and average the rest
   * @param scores - Array of scores
   * @param n - Number of lowest scores to drop
   */
  private dropLowestN(scores: number[], n: number): number {
    if (scores.length === 0) return 0;
    if (n >= scores.length) return 0; // Can't drop all scores

    // Sort ascending and remove first N (lowest)
    const sorted = [...scores].sort((a, b) => a - b);
    const afterDrop = sorted.slice(n);
    
    return this.simpleAverage(afterDrop);
  }

  /**
   * Weighted average based on individual assessment weights
   * @param assessments - Array of assessments with weight field
   */
  private weightedAverage(assessments: FormativeAssessment[]): number {
    const validAssessments = assessments.filter(a => a.percentage !== null);
    if (validAssessments.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const assessment of validAssessments) {
      const weight = assessment.weight || 1.0;
      const percentage = assessment.percentage || 0;
      
      totalWeightedScore += percentage * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) return 0;
    
    return Math.round((totalWeightedScore / totalWeight) * 100) / 100;
  }

  /**
   * Calculate median (middle value) of scores
   */
  private median(scores: number[]): number {
    if (scores.length === 0) return 0;

    const sorted = [...scores].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      // Even number of scores - average the two middle values
      return Math.round(((sorted[middle - 1] + sorted[middle]) / 2) * 100) / 100;
    } else {
      // Odd number of scores - return the middle value
      return sorted[middle];
    }
  }

  /**
   * Calculate overall formative score for a learner in a term
   * Aggregates across all assessment types with their configured strategies
   */
  async calculateOverallFormativeScore(params: {
    learnerId: string;
    classId: string;
    term: Term;
    academicYear: number;
  }): Promise<OverallFormativeScore> {
    const { learnerId, term, academicYear } = params;

    // Get all formative assessments for learner in this term
    const assessments = await prisma.formativeAssessment.findMany({
      where: {
        learnerId,
        term,
        academicYear
      }
    });

    if (assessments.length === 0) {
      return {
        averagePercentage: 0,
        breakdown: [],
        totalAssessments: 0,
        strategy: 'NONE'
      };
    }

    // Get learner's school for config lookup
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      select: { schoolId: true, grade: true }
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    // Group assessments by type
    const assessmentsByType = this.groupByType(assessments);
    const breakdown: FormativeScoreBreakdown[] = [];

    // Calculate average for each type using its configured strategy
    for (const [type, typeAssessments] of Object.entries(assessmentsByType)) {
      const assessmentType = type as FormativeAssessmentType;
      
      // Get aggregation config for this type
      const config = await this.getAggregationConfig(
        learner.schoolId,
        assessmentType,
        learner.grade
      );

      // Calculate average for this type
      const typeAverage = await this.calculateFormativeAverage(
        typeAssessments,
        config
      );

      breakdown.push({
        assessmentType,
        count: typeAssessments.length,
        averageScore: typeAverage,
        averagePercentage: typeAverage,
        weight: config.weight || 1.0
      });
    }

    // Calculate overall weighted average across all types
    const overallAverage = this.calculateWeightedTypeAverage(breakdown);

    return {
      averagePercentage: overallAverage,
      breakdown,
      totalAssessments: assessments.length,
      strategy: 'MULTI_TYPE_WEIGHTED'
    };
  }

  /**
   * Group assessments by type
   */
  private groupByType(assessments: FormativeAssessment[]): Record<string, FormativeAssessment[]> {
    return assessments.reduce((acc, assessment) => {
      const type = assessment.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(assessment);
      return acc;
    }, {} as Record<string, FormativeAssessment[]>);
  }

  /**
   * Calculate weighted average across different assessment types
   */
  private calculateWeightedTypeAverage(breakdown: FormativeScoreBreakdown[]): number {
    if (breakdown.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const item of breakdown) {
      totalWeightedScore += item.averagePercentage * item.weight;
      totalWeight += item.weight;
    }

    if (totalWeight === 0) return 0;
    
    return Math.round((totalWeightedScore / totalWeight) * 100) / 100;
  }

  /**
   * Get aggregation configuration for assessment type
   * Returns default SIMPLE_AVERAGE if not configured
   */
  private async getAggregationConfig(
    schoolId: string,
    assessmentType: FormativeAssessmentType,
    grade?: Grade
  ): Promise<AggregationConfig> {
    // Try to find specific config for this type, grade, and school
    const config = await prisma.aggregationConfig.findFirst({
      where: {
        schoolId,
        type: assessmentType,
        OR: [
          { grade: grade },
          { grade: null } // Fallback to school-wide config
        ]
      },
      orderBy: {
        grade: 'desc' // Prefer grade-specific over school-wide
      }
    });

    if (config) {
      return {
        strategy: config.strategy,
        nValue: config.nValue,
        weight: config.weight
      };
    }

    // Default configuration
    return {
      strategy: 'SIMPLE_AVERAGE',
      nValue: null,
      weight: 1.0
    };
  }

  /**
   * Calculate final weighted score combining formative and summative
   * Uses term configuration for weights
   */
  async calculateFinalScore(params: {
    learnerId: string;
    classId: string;
    term: Term;
    academicYear: number;
    formativeScore: number;
    summativeScore: number;
  }): Promise<FinalScoreResult> {
    const { learnerId, term, academicYear, formativeScore, summativeScore } = params;

    // Get learner's school
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      select: { schoolId: true }
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    // Get term configuration
    const termConfig = await this.getTermConfig(
      learner.schoolId,
      term,
      academicYear
    );

    // Calculate weighted contributions
    const formativeContribution = (formativeScore * termConfig.formativeWeight) / 100;
    const summativeContribution = (summativeScore * termConfig.summativeWeight) / 100;
    const finalScore = formativeContribution + summativeContribution;

    return {
      finalScore: Math.round(finalScore * 100) / 100,
      finalPercentage: Math.round(finalScore * 100) / 100,
      formativeContribution: Math.round(formativeContribution * 100) / 100,
      summativeContribution: Math.round(summativeContribution * 100) / 100,
      formativeWeight: termConfig.formativeWeight,
      summativeWeight: termConfig.summativeWeight,
      formativeScore,
      summativeScore
    };
  }

  /**
   * Get term configuration
   * Creates default if not exists
   */
  private async getTermConfig(
    schoolId: string,
    term: Term,
    academicYear: number
  ): Promise<{ formativeWeight: number; summativeWeight: number }> {
    const config = await prisma.termConfig.findUnique({
      where: {
        schoolId_academicYear_term: {
          schoolId,
          academicYear,
          term
        }
      }
    });

    if (config) {
      return {
        formativeWeight: config.formativeWeight,
        summativeWeight: config.summativeWeight
      };
    }

    // Return default weights if no config exists
    return {
      formativeWeight: 40.0,
      summativeWeight: 60.0
    };
  }

  /**
   * Recalculate all scores for a class when configuration changes
   * Useful when term config or aggregation rules are updated
   */
  async recalculateClassScores(params: {
    classId: string;
    term: Term;
    academicYear: number;
  }): Promise<{ updated: number; errors: string[] }> {
    const { classId, term, academicYear } = params;

    // Get all learners in the class
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId,
        active: true
      },
      include: {
        learner: true
      }
    });

    let updated = 0;
    const errors: string[] = [];

    for (const enrollment of enrollments) {
      try {
        // Recalculate formative score
        const formativeResult = await this.calculateOverallFormativeScore({
          learnerId: enrollment.learnerId,
          classId,
          term,
          academicYear
        });

        // Get summative score (average of all summative tests)
        const summativeResults = await prisma.summativeResult.findMany({
          where: {
            learnerId: enrollment.learnerId,
            test: {
              term,
              academicYear
            }
          }
        });

        const summativeScore = summativeResults.length > 0
          ? summativeResults.reduce((sum, r) => sum + r.percentage, 0) / summativeResults.length
          : 0;

        // Calculate final score
        await this.calculateFinalScore({
          learnerId: enrollment.learnerId,
          classId,
          term,
          academicYear,
          formativeScore: formativeResult.averagePercentage,
          summativeScore
        });

        updated++;
      } catch (error) {
        errors.push(`Failed to recalculate for learner ${enrollment.learner.admissionNumber}: ${error}`);
      }
    }

    return { updated, errors };
  }

  /**
   * Get calculation summary for a learner
   * Shows detailed breakdown of how final score was calculated
   */
  async getCalculationSummary(params: {
    learnerId: string;
    classId: string;
    term: Term;
    academicYear: number;
  }): Promise<{
    formative: OverallFormativeScore;
    summative: { averagePercentage: number; testCount: number };
    final: FinalScoreResult;
  }> {
    const { learnerId, classId, term, academicYear } = params;

    // Calculate formative score
    const formativeResult = await this.calculateOverallFormativeScore({
      learnerId,
      classId,
      term,
      academicYear
    });

    // Get summative results
    const summativeResults = await prisma.summativeResult.findMany({
      where: {
        learnerId,
        test: {
          term,
          academicYear
        }
      }
    });

    const summativeAverage = summativeResults.length > 0
      ? summativeResults.reduce((sum, r) => sum + r.percentage, 0) / summativeResults.length
      : 0;

    // Calculate final score
    const finalScore = await this.calculateFinalScore({
      learnerId,
      classId,
      term,
      academicYear,
      formativeScore: formativeResult.averagePercentage,
      summativeScore: summativeAverage
    });

    return {
      formative: formativeResult,
      summative: {
        averagePercentage: Math.round(summativeAverage * 100) / 100,
        testCount: summativeResults.length
      },
      final: finalScore
    };
  }

  /**
   * Validate aggregation configuration
   */
  validateAggregationConfig(config: AggregationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.strategy === 'BEST_N' || config.strategy === 'DROP_LOWEST_N') {
      if (!config.nValue || config.nValue <= 0) {
        errors.push(`Strategy ${config.strategy} requires a positive nValue`);
      }
    }

    if (config.weight !== undefined && config.weight < 0) {
      errors.push('Weight cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available aggregation strategies with descriptions
   */
  getAvailableStrategies(): Array<{
    strategy: AggregationStrategy;
    name: string;
    description: string;
    requiresNValue: boolean;
  }> {
    return [
      {
        strategy: 'SIMPLE_AVERAGE',
        name: 'Simple Average',
        description: 'Average all assessment scores equally',
        requiresNValue: false
      },
      {
        strategy: 'BEST_N',
        name: 'Best N',
        description: 'Take the best N scores and average them (e.g., best 3 out of 5)',
        requiresNValue: true
      },
      {
        strategy: 'DROP_LOWEST_N',
        name: 'Drop Lowest N',
        description: 'Drop N lowest scores and average the rest',
        requiresNValue: true
      },
      {
        strategy: 'WEIGHTED_AVERAGE',
        name: 'Weighted Average',
        description: 'Weight each assessment based on its weight field',
        requiresNValue: false
      },
      {
        strategy: 'MEDIAN',
        name: 'Median',
        description: 'Use the middle value instead of average',
        requiresNValue: false
      }
    ];
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const calculationService = new CalculationService();
