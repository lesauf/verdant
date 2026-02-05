import { RoleTemplateRepository } from '../../../data/repositories/firebase/RoleTemplateRepository';
import { Permission } from '../../../domain/entities/Permission';
import { RoleTemplate, RoleTemplateValidator } from '../../../domain/entities/RoleTemplate';
import { AppError } from '../../../infrastructure/errors/AppError';
import { PermissionService } from '../../services/PermissionService';

interface CreateRoleTemplateInput {
  farmId: string;
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * Use case for creating a new role template
 */
export class CreateRoleTemplateUseCase {
  private roleTemplateRepository: RoleTemplateRepository;
  private permissionService: PermissionService;

  constructor({
    roleTemplateRepository,
    permissionService,
  }: {
    roleTemplateRepository: RoleTemplateRepository;
    permissionService: PermissionService;
  }) {
    this.roleTemplateRepository = roleTemplateRepository;
    this.permissionService = permissionService;
  }

  async execute(input: CreateRoleTemplateInput): Promise<RoleTemplate> {
    try {
      // Validate input
      const validationErrors = RoleTemplateValidator.validate({
        name: input.name,
        farmId: input.farmId,
        permissions: input.permissions,
      });

      if (validationErrors.length > 0) {
        throw new AppError(
          `Validation failed: ${validationErrors.join(', ')}`,
          'CreateRoleTemplateUseCase',
          'VALIDATION_ERROR'
        );
      }

      // Validate permissions
      const invalidPermissions = this.permissionService.validatePermissions(input.permissions);
      if (invalidPermissions.length > 0) {
        throw new AppError(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
          'CreateRoleTemplateUseCase',
          'INVALID_PERMISSIONS'
        );
      }

      // Check if name already exists
      const existing = await this.roleTemplateRepository.findByName(input.farmId, input.name);
      if (existing) {
        throw new AppError(
          `Role template with name "${input.name}" already exists`,
          'CreateRoleTemplateUseCase',
          'DUPLICATE_NAME'
        );
      }

      // Create the template
      return await this.roleTemplateRepository.create(input.farmId, {
        name: input.name,
        description: input.description,
        permissions: input.permissions,
        isSystemRole: false, // User-created templates are never system roles
        farmId: input.farmId,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        `Failed to create role template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CreateRoleTemplateUseCase',
        'CREATE_ROLE_TEMPLATE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
