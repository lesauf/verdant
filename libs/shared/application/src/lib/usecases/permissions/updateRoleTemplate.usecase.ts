import { RoleTemplateRepository } from 'data/repositories/firebase/RoleTemplateRepository';
import { Permission } from 'domain/entities/Permission';
import { RoleTemplate, RoleTemplateValidator } from 'domain/entities/RoleTemplate';
import { AppError } from 'infrastructure/errors/AppError';
import { PermissionService } from '../../services/PermissionService';

interface UpdateRoleTemplateInput {
  farmId: string;
  templateId: string;
  name?: string;
  description?: string;
  permissions?: Permission[];
}

/**
 * Use case for updating an existing role template
 */
export class UpdateRoleTemplateUseCase {
  private roleTemplateRepository: RoleTemplateRepository;
  private permissionService: PermissionService;

  constructor({
    roleTemplateRepository,
    permissionService
  }: {
    roleTemplateRepository: RoleTemplateRepository;
    permissionService: PermissionService;
  }) {
    this.roleTemplateRepository = roleTemplateRepository;
    this.permissionService = permissionService;
  }

  async execute(input: UpdateRoleTemplateInput): Promise<void> {
    try {
      // Get existing template
      const existing = await this.roleTemplateRepository.findById(input.farmId, input.templateId);
      if (!existing) {
        throw new AppError(
          `Role template ${input.templateId} not found`,
          'UpdateRoleTemplateUseCase',
          'TEMPLATE_NOT_FOUND'
        );
      }

      // Check if template can be edited
      if (!RoleTemplateValidator.canEdit(existing)) {
        throw new AppError(
          'System roles cannot be edited',
          'UpdateRoleTemplateUseCase',
          'CANNOT_EDIT_SYSTEM_ROLE'
        );
      }

      // Validate permissions if provided
      if (input.permissions) {
        const invalidPermissions = this.permissionService.validatePermissions(input.permissions);
        if (invalidPermissions.length > 0) {
          throw new AppError(
            `Invalid permissions: ${invalidPermissions.join(', ')}`,
            'UpdateRoleTemplateUseCase',
            'INVALID_PERMISSIONS'
          );
        }
      }

      // Check for duplicate name if name is being changed
      if (input.name && input.name !== existing.name) {
        const duplicate = await this.roleTemplateRepository.findByName(input.farmId, input.name);
        if (duplicate) {
          throw new AppError(
            `Role template with name "${input.name}" already exists`,
            'UpdateRoleTemplateUseCase',
            'DUPLICATE_NAME'
          );
        }
      }

      // Update the template
      const updates: Partial<RoleTemplate> = {};
      if (input.name) updates.name = input.name;
      if (input.description) updates.description = input.description;
      if (input.permissions) updates.permissions = input.permissions;

      await this.roleTemplateRepository.update(input.farmId, input.templateId, updates);
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        `Failed to update role template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UpdateRoleTemplateUseCase',
        'UPDATE_ROLE_TEMPLATE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
