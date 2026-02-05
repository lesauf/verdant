import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { RoleTemplateRepository } from '../../../data/repositories/firebase/RoleTemplateRepository';
import { RoleTemplateFactory } from '../../../domain/entities/RoleTemplate';
import { AppError } from '../../../infrastructure/errors/AppError';

interface MigrationResult {
  farmId: string;
  farmName: string;
  success: boolean;
  templatesCreated: number;
  error?: string;
}

/**
 * Use case for migrating farms to use role templates
 * Creates default role templates (Owner, Manager, Worker) for each farm
 */
export class MigrateToRoleTemplatesUseCase {
  private farmRepository: FarmRepository;
  private roleTemplateRepository: RoleTemplateRepository;

  constructor({farmRepository, roleTemplateRepository}: {farmRepository: FarmRepository, roleTemplateRepository: RoleTemplateRepository}) {
    this.farmRepository = farmRepository;
    this.roleTemplateRepository = roleTemplateRepository;
  }

  /**
   * Migrate a single farm to use role templates
   */
  async migrateFarm(farmId: string): Promise<MigrationResult> {
    try {
      const farm = await this.farmRepository.findById(farmId);
      if (!farm) {
        return {
          farmId,
          farmName: 'Unknown',
          success: false,
          templatesCreated: 0,
          error: 'Farm not found',
        };
      }

      // Check if templates already exist
      const existingTemplates = await this.roleTemplateRepository.findByFarmId(farmId);
      if (existingTemplates.length > 0) {
        return {
          farmId,
          farmName: farm.name,
          success: true,
          templatesCreated: 0,
          error: 'Templates already exist',
        };
      }

      // Create default templates
      const ownerTemplate = RoleTemplateFactory.createOwnerTemplate(farmId);
      const managerTemplate = RoleTemplateFactory.createManagerTemplate(farmId);
      const workerTemplate = RoleTemplateFactory.createWorkerTemplate(farmId);

      await this.roleTemplateRepository.create(farmId, ownerTemplate);
      await this.roleTemplateRepository.create(farmId, managerTemplate);
      await this.roleTemplateRepository.create(farmId, workerTemplate);

      return {
        farmId,
        farmName: farm.name,
        success: true,
        templatesCreated: 3,
      };
    } catch (error) {
      return {
        farmId,
        farmName: 'Unknown',
        success: false,
        templatesCreated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Migrate all farms for a user to use role templates
   */
  async migrateAllUserFarms(userId: string): Promise<MigrationResult[]> {
    try {
      const farms = await this.farmRepository.findAllForUser(userId);
      const results: MigrationResult[] = [];

      for (const farm of farms) {
        const result = await this.migrateFarm(farm.id);
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new AppError(
        `Failed to migrate farms: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MigrateToRoleTemplatesUseCase',
        'MIGRATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get migration status for a farm
   */
  async getMigrationStatus(farmId: string): Promise<{
    isMigrated: boolean;
    templateCount: number;
    hasOwnerTemplate: boolean;
    hasManagerTemplate: boolean;
    hasWorkerTemplate: boolean;
  }> {
    try {
      const templates = await this.roleTemplateRepository.findByFarmId(farmId);
      
      return {
        isMigrated: templates.length > 0,
        templateCount: templates.length,
        hasOwnerTemplate: templates.some(t => t.name === 'Owner'),
        hasManagerTemplate: templates.some(t => t.name === 'Manager'),
        hasWorkerTemplate: templates.some(t => t.name === 'Worker'),
      };
    } catch (error) {
      throw new AppError(
        `Failed to get migration status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MigrateToRoleTemplatesUseCase',
        'GET_MIGRATION_STATUS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
