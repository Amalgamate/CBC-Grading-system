/**
 * Configuration Service
 * Manages term configurations and aggregation rules
 * Handles defaults, validation, and configuration retrieval
 */

import { PrismaClient, Term, Grade, FormativeAssessmentType, AggregationStrategy } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CreateTermConfigInput {
  schoolId: string;
  academicYear: number;
  term: Term;
  startDate: Date;
  endDate: Date;
  formativeWeight: number;
  summativeWeight: number;
  isActive?: boolean;
  createdBy: string;
}

interface UpdateTermConfigInput {
  startDate?: Date;
  endDate?: Date;
  formativeWeight?: number;
  summativeWeight?: number;
  isActive?: boolean;
  isClosed?: boolean;
}

interface CreateAggregationConfigInput {
  schoolId: string;
  grade?: Grade;
  learningArea?: string;
  type: FormativeAssessmentType;
  strategy: AggregationStrategy;
  nValue?: number;
  weight?: number;
  createdBy: string;
}

interface UpdateAggregationConfigInput {
  strategy?: AggregationStrategy;
  nValue?: number;
  weight?: number;
}

interface StreamConfigInput {
  id?: string;
  schoolId: string;
  name: string;
  active?: boolean;
}

interface UpsertClassInput {
  id?: string;
  schoolId: string;
  branchId?: string | null;
  name: string;
  grade: Grade;
  stream?: string | null;
  teacherId?: string | null;
  capacity?: number;
  room?: string | null;
  academicYear?: number;
  term?: Term;
  active?: boolean;
}

interface TermConfiguration {
  termConfig: any;
  aggregationConfigs: any[];
}

// ============================================
// CONFIG SERVICE
// ============================================

export class ConfigService {

  /**
   * Get term configuration for a school
   * Creates default if it doesn't exist
   */
  async getTermConfig(params: {
    schoolId: string;
    term: Term;
    academicYear: number;
  }): Promise<any> {
    const { schoolId, term, academicYear } = params;

    let config = await prisma.termConfig.findUnique({
      where: {
        schoolId_academicYear_term: {
          schoolId,
          academicYear,
          term
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create default if doesn't exist
    if (!config) {
      config = await this.createDefaultTermConfig(schoolId, term, academicYear);
    }

    return config;
  }

  /**
   * Create default term configuration
   */
  private async createDefaultTermConfig(
    schoolId: string,
    term: Term,
    academicYear: number
  ): Promise<any> {
    // Calculate default dates based on term
    const dates = this.getDefaultTermDates(term, academicYear);

    // Find a system user or admin to assign as creator
    const systemUser = await prisma.user.findFirst({
      where: {
        schoolId,
        role: { in: ['ADMIN', 'HEAD_TEACHER'] }
      }
    });

    if (!systemUser) {
      throw new Error('No admin user found to create default configuration');
    }

    return await prisma.termConfig.create({
      data: {
        schoolId,
        academicYear,
        term,
        startDate: dates.startDate,
        endDate: dates.endDate,
        formativeWeight: 40.0,  // Default 40%
        summativeWeight: 60.0,  // Default 60%
        isActive: false,
        isClosed: false,
        createdBy: systemUser.id
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Get default term dates based on Kenyan school calendar
   */
  private getDefaultTermDates(term: Term, academicYear: number): {
    startDate: Date;
    endDate: Date;
  } {
    const year = academicYear;

    switch (term) {
      case 'TERM_1':
        return {
          startDate: new Date(year, 0, 2),   // January 2
          endDate: new Date(year, 3, 15)     // April 15
        };
      case 'TERM_2':
        return {
          startDate: new Date(year, 4, 1),   // May 1
          endDate: new Date(year, 7, 31)     // August 31
        };
      case 'TERM_3':
        return {
          startDate: new Date(year, 8, 1),   // September 1
          endDate: new Date(year, 10, 30)    // November 30
        };
      default:
        return {
          startDate: new Date(year, 0, 1),
          endDate: new Date(year, 11, 31)
        };
    }
  }

  /**
   * Create or update term configuration
   */
  async upsertTermConfig(
    data: CreateTermConfigInput
  ): Promise<any> {
    // Validate weights
    this.validateWeights(data.formativeWeight, data.summativeWeight);

    const { schoolId, academicYear, term, createdBy, ...updateData } = data;

    // If setting as active, deactivate others
    if (data.isActive) {
      await this.deactivateOtherTerms(schoolId);
    }

    return await prisma.termConfig.upsert({
      where: {
        schoolId_academicYear_term: {
          schoolId,
          academicYear,
          term
        }
      },
      update: updateData,
      create: {
        schoolId,
        academicYear,
        term,
        ...updateData,
        createdBy
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Update existing term configuration
   */
  async updateTermConfig(
    id: string,
    data: UpdateTermConfigInput
  ): Promise<any> {
    // Validate weights if provided
    if (data.formativeWeight !== undefined || data.summativeWeight !== undefined) {
      const config = await prisma.termConfig.findUnique({ where: { id } });
      if (!config) {
        throw new Error('Term configuration not found');
      }

      const formativeWeight = data.formativeWeight ?? config.formativeWeight;
      const summativeWeight = data.summativeWeight ?? config.summativeWeight;

      this.validateWeights(formativeWeight, summativeWeight);
    }

    // If setting as active, deactivate others
    if (data.isActive) {
      const config = await prisma.termConfig.findUnique({ where: { id } });
      if (config) {
        await this.deactivateOtherTerms(config.schoolId);
      }
    }

    return await prisma.termConfig.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Deactivate all other term configs for a school
   */
  private async deactivateOtherTerms(schoolId: string): Promise<void> {
    await prisma.termConfig.updateMany({
      where: {
        schoolId,
        isActive: true
      },
      data: {
        isActive: false
      }
    });
  }

  /**
   * Validate that weights sum to 100
   */
  private validateWeights(formativeWeight: number, summativeWeight: number): void {
    const total = formativeWeight + summativeWeight;

    if (Math.abs(total - 100) > 0.01) { // Allow small floating point errors
      throw new Error(
        `Weights must sum to 100%. Current sum: ${total}%`
      );
    }

    if (formativeWeight < 0 || summativeWeight < 0) {
      throw new Error('Weights cannot be negative');
    }

    if (formativeWeight > 100 || summativeWeight > 100) {
      throw new Error('Individual weights cannot exceed 100%');
    }
  }

  /**
   * Get all term configurations for a school
   */
  async getSchoolTermConfigs(schoolId: string): Promise<any[]> {
    return await prisma.termConfig.findMany({
      where: { schoolId },
      orderBy: [
        { academicYear: 'desc' },
        { term: 'desc' }
      ],
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Get active term configuration for a school
   */
  async getActiveTermConfig(schoolId: string): Promise<any | null> {
    return await prisma.termConfig.findFirst({
      where: {
        schoolId,
        isActive: true
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Get aggregation configuration for specific assessment type
   */
  async getAggregationConfig(params: {
    schoolId: string;
    assessmentType: FormativeAssessmentType;
    grade?: Grade;
    learningArea?: string;
  }): Promise<any> {
    const { schoolId, assessmentType, grade, learningArea } = params;

    // Try to find most specific config first
    const config = await prisma.aggregationConfig.findFirst({
      where: {
        schoolId,
        type: assessmentType,
        OR: [
          // Grade and subject specific
          { grade, learningArea },
          // Grade specific only
          { grade, learningArea: null },
          // Subject specific only
          { grade: null, learningArea },
          // School-wide default
          { grade: null, learningArea: null }
        ]
      },
      orderBy: [
        // Prioritize most specific configs
        { grade: 'desc' },
        { learningArea: 'desc' }
      ],
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return config;
  }

  /**
   * Get all aggregation configurations for a school
   */
  async getSchoolAggregationConfigs(schoolId: string): Promise<any[]> {
    return await prisma.aggregationConfig.findMany({
      where: { schoolId },
      orderBy: [
        { type: 'asc' },
        { grade: 'asc' }
      ],
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Create aggregation configuration
   */
  async createAggregationConfig(
    data: CreateAggregationConfigInput
  ): Promise<any> {
    // Validate strategy parameters
    this.validateAggregationStrategy(data.strategy, data.nValue, data.weight);

    return await prisma.aggregationConfig.create({
      data: {
        schoolId: data.schoolId,
        grade: data.grade,
        learningArea: data.learningArea,
        type: data.type,
        strategy: data.strategy,
        nValue: data.nValue,
        weight: data.weight ?? 1.0,
        createdBy: data.createdBy
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Update aggregation configuration
   */
  async updateAggregationConfig(
    id: string,
    data: UpdateAggregationConfigInput
  ): Promise<any> {
    // Get existing config
    const existing = await prisma.aggregationConfig.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Aggregation configuration not found');
    }

    // Validate strategy if being updated
    const strategy = data.strategy ?? existing.strategy;
    const nValue = data.nValue !== undefined ? data.nValue : existing.nValue;
    const weight = data.weight !== undefined ? data.weight : existing.weight;

    this.validateAggregationStrategy(strategy, nValue, weight);

    return await prisma.aggregationConfig.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Delete aggregation configuration
   */
  async deleteAggregationConfig(id: string): Promise<void> {
    await prisma.aggregationConfig.delete({
      where: { id }
    });
  }

  // ============================================
  // STREAM CONFIGURATION METHODS
  // ============================================

  /**
   * Get all stream configurations for a school
   */
  async getStreamConfigs(schoolId: string): Promise<any[]> {
    return await prisma.streamConfig.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Create or update stream configuration
   */
  async upsertStreamConfig(data: StreamConfigInput): Promise<any> {
    const { id, schoolId, name, active } = data;

    // Check if name already exists for this school (excluding current record if update)
    const existing = await prisma.streamConfig.findFirst({
      where: {
        schoolId,
        name: { equals: name, mode: 'insensitive' },
        id: id ? { not: id } : undefined
      }
    });

    if (existing) {
      throw new Error(`Stream "${name}" already exists`);
    }

    if (id) {
      // Update
      return await prisma.streamConfig.update({
        where: { id },
        data: {
          name,
          active: active !== undefined ? active : undefined
        }
      });
    } else {
      // Create
      return await prisma.streamConfig.create({
        data: {
          schoolId,
          name,
          active: active !== undefined ? active : true
        }
      });
    }
  }

  /**
   * Delete stream configuration
   */
  async deleteStreamConfig(id: string): Promise<void> {
    // Optional: Check for dependencies before deletion (e.g., learners assigned to this stream)
    // For now, we rely on the database constraints or soft checks if needed
    // But since Learners use a String field now, there's no FK constraint blocking this directly,
    // though we might want to warn if used.

    // Check if any learners are using this stream name? 
    // This is tricky because the Learner model uses a plain string now, not a relation.
    // Ideally, we should check, but for MVP let's allow deletion.

    await prisma.streamConfig.delete({
      where: { id }
    });
  }

  // ============================================
  // CLASS MANAGEMENT METHODS
  // ============================================

  /**
   * Get all classes for a school
   */
  async getClasses(schoolId: string): Promise<any[]> {
    return await prisma.class.findMany({
      where: {
        branch: {
          schoolId
        }
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { academicYear: 'desc' },
        { grade: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Create or update a class
   */
  async upsertClass(data: UpsertClassInput): Promise<any> {
    const { id, schoolId, ...classData } = data;

    // Ensure we have a branchId
    let branchId = classData.branchId;
    if (!branchId) {
      // Find the first branch for this school
      const branch = await prisma.branch.findFirst({
        where: { schoolId }
      });
      if (!branch) {
        throw new Error('No branch found for this school. Cannot create class.');
      }
      branchId = branch.id;
    }

    // Clean data for Prisma (remove schoolId and id from data object)
    const { branchId: _, ...prismaData } = classData;

    // Normalize optional fields
    const normalizedData = {
      ...prismaData,
      stream: prismaData.stream || null,
      teacherId: prismaData.teacherId || null,
      capacity: prismaData.capacity || 40,
      academicYear: prismaData.academicYear || 2025,
      term: prismaData.term || 'TERM_1'
    };

    if (id) {
      // Update
      return await prisma.class.update({
        where: { id },
        data: {
          ...normalizedData,
          branchId: branchId as string
        },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          branch: true
        }
      });
    } else {
      // Create
      console.log('Upserting class with data:', {
        branchId,
        ...normalizedData
      });

      // Check for unique constraint: branchId, grade, stream, academicYear, term
      const existing = await prisma.class.findFirst({
        where: {
          branchId: branchId as string,
          grade: normalizedData.grade,
          stream: normalizedData.stream,
          academicYear: normalizedData.academicYear,
          term: normalizedData.term
        }
      });

      if (existing) {
        console.warn('Class already exists:', existing.id);
        throw new Error(`A class with this grade and stream already exists for the selected academic period.`);
      }

      console.log('Creating new class record...');
      return await prisma.class.create({
        data: {
          ...normalizedData,
          branchId: branchId as string
        },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          branch: true
        }
      });
    }
  }

  /**
   * Delete a class
   */
  async deleteClass(id: string): Promise<void> {
    // Check for enrollments before deletion
    const enrollmentCount = await prisma.classEnrollment.count({
      where: { classId: id }
    });

    if (enrollmentCount > 0) {
      throw new Error(`Cannot delete class: ${enrollmentCount} learners are currently enrolled.`);
    }

    await prisma.class.delete({
      where: { id }
    });
  }

  /**
   * Validate aggregation strategy parameters
   */
  private validateAggregationStrategy(
    strategy: AggregationStrategy,
    nValue?: number | null,
    weight?: number | null
  ): void {
    if (strategy === 'BEST_N' || strategy === 'DROP_LOWEST_N') {
      if (!nValue || nValue <= 0) {
        throw new Error(
          `Strategy ${strategy} requires a positive nValue (number of assessments)`
        );
      }
    }

    if (weight !== null && weight !== undefined) {
      if (weight < 0) {
        throw new Error('Weight cannot be negative');
      }
      if (weight > 100) {
        throw new Error('Weight cannot exceed 100');
      }
    }
  }

  /**
   * Get complete term configuration including aggregation rules
   */
  async getTermConfigurations(params: {
    schoolId: string;
    term: Term;
    academicYear: number;
  }): Promise<TermConfiguration> {
    const termConfig = await this.getTermConfig(params);
    const aggregationConfigs = await prisma.aggregationConfig.findMany({
      where: {
        schoolId: params.schoolId
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      termConfig,
      aggregationConfigs
    };
  }

  /**
   * Reset all configurations to defaults for a term
   */
  async resetToDefaults(params: {
    schoolId: string;
    term: Term;
    academicYear: number;
    userId: string;
  }): Promise<TermConfiguration> {
    const { schoolId, term, academicYear, userId } = params;

    // Delete existing term config
    await prisma.termConfig.deleteMany({
      where: {
        schoolId,
        term,
        academicYear
      }
    });

    // Delete all aggregation configs for this school
    await prisma.aggregationConfig.deleteMany({
      where: { schoolId }
    });

    // Create new default config
    const dates = this.getDefaultTermDates(term, academicYear);
    const termConfig = await prisma.termConfig.create({
      data: {
        schoolId,
        academicYear,
        term,
        startDate: dates.startDate,
        endDate: dates.endDate,
        formativeWeight: 40.0,
        summativeWeight: 60.0,
        isActive: false,
        isClosed: false,
        createdBy: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      termConfig,
      aggregationConfigs: []
    };
  }

  /**
   * Bulk create default aggregation configs for common assessment types
   */
  async createDefaultAggregationConfigs(
    schoolId: string,
    userId: string
  ): Promise<any[]> {
    const defaultConfigs = [
      {
        type: 'OPENER' as FormativeAssessmentType,
        strategy: 'DROP_LOWEST_N' as AggregationStrategy,
        nValue: 2,  // Drop 2 lowest opener tests
        weight: 0.2 // 20% weight
      },
      {
        type: 'CAT' as FormativeAssessmentType,
        strategy: 'BEST_N' as AggregationStrategy,
        nValue: 3,  // Best 3 CATs
        weight: 0.5 // 50% weight
      },
      {
        type: 'ASSIGNMENT' as FormativeAssessmentType,
        strategy: 'SIMPLE_AVERAGE' as AggregationStrategy,
        nValue: null,
        weight: 0.3 // 30% weight
      }
    ];

    const created = [];
    for (const config of defaultConfigs) {
      const result = await prisma.aggregationConfig.create({
        data: {
          schoolId,
          type: config.type,
          strategy: config.strategy,
          nValue: config.nValue,
          weight: config.weight,
          createdBy: userId
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      created.push(result);
    }

    return created;
  }

  /**
   * Get configuration summary for admin dashboard
   */
  async getConfigurationSummary(schoolId: string): Promise<{
    totalTermConfigs: number;
    activeTermConfig: any | null;
    totalAggregationConfigs: number;
    configsByType: Record<string, number>;
  }> {
    const [termConfigs, activeConfig, aggConfigs] = await Promise.all([
      prisma.termConfig.count({ where: { schoolId } }),
      this.getActiveTermConfig(schoolId),
      prisma.aggregationConfig.findMany({ where: { schoolId } })
    ]);

    const configsByType = aggConfigs.reduce((acc, config) => {
      acc[config.type] = (acc[config.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTermConfigs: termConfigs,
      activeTermConfig: activeConfig,
      totalAggregationConfigs: aggConfigs.length,
      configsByType
    };
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const configService = new ConfigService();
