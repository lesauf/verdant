import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { RoleTemplateRepository } from '../../../data/repositories/firebase/RoleTemplateRepository';
import { AppError } from '../../../infrastructure/errors/AppError';

interface SyncResult {
  farmId: string;
  farmName: string;
  success: boolean;
  error?: string;
}

/**
 * Use case for syncing role templates across all farms owned by a user
 */
export class SyncRoleTemplatesAcrossFarmsUseCase {
  private farmRepository: FarmRepository;
  private roleTemplateRepository: RoleTemplateRepository;

  constructor({
    farmRepository,
    roleTemplateRepository,
  }: {
    farmRepository: FarmRepository;
    roleTemplateRepository: RoleTemplateRepository;
  }) {
    this.farmRepository = farmRepository;
    this.roleTemplateRepository = roleTemplateRepository;
  }

  async execute(userId: string, sourceFarmId: string): Promise<SyncResult[]> {
    try {
      // Verify user is owner of source farm
      const sourceFarm = await this.farmRepository.findById(sourceFarmId);
      if (!sourceFarm) {
        throw new AppError(
          `Source farm ${sourceFarmId} not found`,
          'SyncRoleTemplatesAcrossFarmsUseCase',
          'FARM_NOT_FOUND'
        );
      }

      if (sourceFarm.ownerId !== userId) {
        throw new AppError(
          'Only farm owners can sync role templates',
          'SyncRoleTemplatesAcrossFarmsUseCase',
          'PERMISSION_DENIED'
        );
      }

      // Get all farms owned by user
      const allFarms = await this.farmRepository.findAllForUser(userId);
      const ownedFarms = allFarms.filter((farm: any) => farm.ownerId === userId && farm.id !== sourceFarmId);

      // Get role templates from source farm (excluding system roles)
      const sourceTemplates = await this.roleTemplateRepository.findByFarmId(sourceFarmId);
      const templatesToSync = sourceTemplates.filter(template => !template.isSystemRole);

      // Sync to each farm
      const results: SyncResult[] = [];

      for (const targetFarm of ownedFarms) {
        try {
          // Get existing templates on target farm
          const existingTemplates = await this.roleTemplateRepository.findByFarmId(targetFarm.id);

          for (const sourceTemplate of templatesToSync) {
            // Check if template with same name exists
            const existing = existingTemplates.find(t => t.name === sourceTemplate.name);

            if (existing) {
              // Update existing template (only if not a system role)
              if (!existing.isSystemRole) {
                await this.roleTemplateRepository.update(targetFarm.id, existing.id, {
                  description: sourceTemplate.description,
                  permissions: sourceTemplate.permissions,
                });
              }
            } else {
              // Create new template
              await this.roleTemplateRepository.create(targetFarm.id, {
                name: sourceTemplate.name,
                description: sourceTemplate.description,
                permissions: sourceTemplate.permissions,
                isSystemRole: false,
                farmId: targetFarm.id,
              });
            }
          }

          results.push({
            farmId: targetFarm.id,
            farmName: targetFarm.name,
            success: true,
          });
        } catch (error) {
          results.push({
            farmId: targetFarm.id,
            farmName: targetFarm.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        `Failed to sync role templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SyncRoleTemplatesAcrossFarmsUseCase',
        'SYNC_ROLE_TEMPLATES_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
