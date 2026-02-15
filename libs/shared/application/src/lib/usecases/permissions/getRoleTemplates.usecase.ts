import { RoleTemplateRepository } from 'data/repositories/firebase/RoleTemplateRepository';
import { RoleTemplate } from 'domain/entities/RoleTemplate';
import { AppError } from 'infrastructure/errors/AppError';

/**
 * Use case for retrieving role templates for a farm
 */
export class GetRoleTemplatesUseCase {
  private roleTemplateRepository: RoleTemplateRepository;

  constructor({roleTemplateRepository}: {roleTemplateRepository: RoleTemplateRepository}) {
    this.roleTemplateRepository = roleTemplateRepository;
  }

  async execute(farmId: string): Promise<RoleTemplate[]> {
    try {
      return await this.roleTemplateRepository.findByFarmId(farmId);
    } catch (error) {
      throw new AppError(
        `Failed to get role templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetRoleTemplatesUseCase',
        'GET_ROLE_TEMPLATES_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
