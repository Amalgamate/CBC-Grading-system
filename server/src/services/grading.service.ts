import { PrismaClient, SummativeGrade, DetailedRubricRating, AggregationStrategy, FormativeAssessmentType } from '@prisma/client';

const prisma = new PrismaClient();

interface ScoreItem {
  score: number;
  weight?: number; // For weighted average strategy or individual assessment weight
}

export const gradingService = {
  /**
   * Get grading system for a school and type
   */
  async getGradingSystem(schoolId: string, type: 'SUMMATIVE' | 'CBC') {
    let system = await prisma.gradingSystem.findFirst({
      where: {
        schoolId,
        type,
        active: true,
        isDefault: true
      },
      include: {
        ranges: true
      }
    });

    if (!system) {
      // Create default if not exists
      system = await this.createDefaultSystem(schoolId, type);
    }

    return system;
  },

  /**
   * Get grading system by ID
   */
  async getGradingSystemById(id: string) {
    return await prisma.gradingSystem.findUnique({
      where: { id },
      include: { ranges: true }
    });
  },

  /**
   * Get Aggregation Config for a specific context
   * Hierarchy: Specific (Grade & Subject) -> Grade only -> Subject only -> Global (School only)
   */
  async getAggregationConfig(schoolId: string, type: FormativeAssessmentType, grade?: any, learningArea?: string) {
    // Try to find most specific config first
    // Since Prisma doesn't support "best match" query directly, we might need to fetch candidates and filter in code or use multiple queries.
    // Efficient approach: Fetch all configs for this school and type, then sort by specificity.

    const configs = await prisma.aggregationConfig.findMany({
      where: {
        schoolId,
        type
      }
    });

    // Sort by specificity:
    // 1. Grade + LearningArea (Most specific)
    // 2. Grade only
    // 3. LearningArea only
    // 4. Neither (Global default for this type)

    const matchedConfig = configs.find(c => c.grade === grade && c.learningArea === learningArea)
      || configs.find(c => c.grade === grade && !c.learningArea)
      || configs.find(c => !c.grade && c.learningArea === learningArea)
      || configs.find(c => !c.grade && !c.learningArea);

    return matchedConfig;
  },

  /**
   * Calculate aggregated score based on strategy
   */
  calculateAggregatedScore(scores: ScoreItem[], strategy: AggregationStrategy, nValue?: number): number {
    if (scores.length === 0) return 0;

    switch (strategy) {
      case 'SIMPLE_AVERAGE':
        return scores.reduce((sum, item) => sum + item.score, 0) / scores.length;

      case 'BEST_N':
        if (!nValue || nValue <= 0) return 0; // Invalid configuration
        const bestScores = scores.map(s => s.score).sort((a, b) => b - a).slice(0, nValue);
        if (bestScores.length === 0) return 0;
        return bestScores.reduce((sum, s) => sum + s, 0) / bestScores.length;

      case 'DROP_LOWEST_N':
        if (!nValue || nValue < 0) return this.calculateAggregatedScore(scores, 'SIMPLE_AVERAGE');
        const countToKeep = Math.max(0, scores.length - nValue);
        if (countToKeep === 0) return 0; // Dropped everything?
        const keptScores = scores.map(s => s.score).sort((a, b) => b - a).slice(0, countToKeep); // Highest kept
        return keptScores.reduce((sum, s) => sum + s, 0) / keptScores.length;

      case 'WEIGHTED_AVERAGE':
        // Assumes each score item has a 'weight' property. 
        // If not provided, defaults to 1.
        let totalWeight = 0;
        let weightedSum = 0;
        for (const item of scores) {
          const w = item.weight || 1;
          weightedSum += item.score * w;
          totalWeight += w;
        }
        return totalWeight === 0 ? 0 : weightedSum / totalWeight;

      case 'MEDIAN':
        const sorted = scores.map(s => s.score).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
          return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
          return sorted[mid];
        }

      default:
        return scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
    }
  },

  /**
   * Create default grading system based on hardcoded values
   */
  async createDefaultSystem(schoolId: string, type: 'SUMMATIVE' | 'CBC') {
    // Check if one exists to avoid duplicates (double check)
    const existing = await prisma.gradingSystem.findFirst({
      where: { schoolId, type, isDefault: true },
      include: { ranges: true }
    });
    if (existing) return existing;

    if (type === 'SUMMATIVE') {
      return await prisma.gradingSystem.create({
        data: {
          schoolId,
          name: 'Standard Summative Grading',
          type: 'SUMMATIVE',
          isDefault: true,
          ranges: {
            create: [
              { label: 'A', minPercentage: 80, maxPercentage: 100, summativeGrade: 'A', points: 4, color: '#10b981', description: 'Excellent' },
              { label: 'B', minPercentage: 60, maxPercentage: 79, summativeGrade: 'B', points: 3, color: '#3b82f6', description: 'Good' },
              { label: 'C', minPercentage: 50, maxPercentage: 59, summativeGrade: 'C', points: 2, color: '#f59e0b', description: 'Average' },
              { label: 'D', minPercentage: 40, maxPercentage: 49, summativeGrade: 'D', points: 1, color: '#ef4444', description: 'Below Average' },
              { label: 'E', minPercentage: 0, maxPercentage: 39, summativeGrade: 'E', points: 0, color: '#991b1b', description: 'Fail' },
            ]
          }
        },
        include: { ranges: true }
      });
    } else {
      // CBC
      return await prisma.gradingSystem.create({
        data: {
          schoolId,
          name: 'Standard CBC Rubric',
          type: 'CBC',
          isDefault: true,
          ranges: {
            create: [
              { label: 'EE1', minPercentage: 90, maxPercentage: 100, rubricRating: 'EE1', points: 8, color: '#10b981', description: 'Outstanding' },
              { label: 'EE2', minPercentage: 75, maxPercentage: 89, rubricRating: 'EE2', points: 7, color: '#34d399', description: 'Very High' },
              { label: 'ME1', minPercentage: 58, maxPercentage: 74, rubricRating: 'ME1', points: 6, color: '#3b82f6', description: 'High Average' },
              { label: 'ME2', minPercentage: 41, maxPercentage: 57, rubricRating: 'ME2', points: 5, color: '#60a5fa', description: 'Average' },
              { label: 'AE1', minPercentage: 31, maxPercentage: 40, rubricRating: 'AE1', points: 4, color: '#f59e0b', description: 'Low Average' },
              { label: 'AE2', minPercentage: 21, maxPercentage: 30, rubricRating: 'AE2', points: 3, color: '#fbbf24', description: 'Below Average' },
              { label: 'BE1', minPercentage: 11, maxPercentage: 20, rubricRating: 'BE1', points: 2, color: '#ef4444', description: 'Low' },
              { label: 'BE2', minPercentage: 0, maxPercentage: 10, rubricRating: 'BE2', points: 1, color: '#b91c1c', description: 'Very Low' },
            ]
          }
        },
        include: { ranges: true }
      });
    }
  },

  /**
   * Calculate grade for a percentage using the school's system
   */
  async calculateGrade(schoolId: string, percentage: number): Promise<SummativeGrade> {
    const system = await this.getGradingSystem(schoolId, 'SUMMATIVE');
    const range = system.ranges.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
    return range?.summativeGrade || 'E';
  },

  /**
   * Calculate grade with details (sync version if system is provided)
   */
  calculateGradeSync(percentage: number, ranges: any[]): SummativeGrade {
    const range = ranges.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
    return range?.summativeGrade || 'E';
  },

  /**
   * Calculate CBC rating with details (sync version)
   */
  calculateRatingSync(percentage: number, ranges: any[]): DetailedRubricRating {
    const range = ranges.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
    return range?.rubricRating || 'BE2';
  },

  /**
   * Get points for a specific rating from ranges
   */
  getPointsSync(rating: DetailedRubricRating, ranges: any[]): number {
    const range = ranges.find(r => r.rubricRating === rating);
    return range?.points || 1;
  },

  /**
   * Get average percentage for a specific rating from ranges
   */
  getAveragePercentageSync(rating: DetailedRubricRating, ranges: any[]): number {
    const range = ranges.find(r => r.rubricRating === rating);
    if (!range) return 0;
    return Math.round((range.minPercentage + range.maxPercentage) / 2);
  }
};
