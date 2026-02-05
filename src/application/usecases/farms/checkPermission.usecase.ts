import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { RoleTemplateRepository } from '../../../data/repositories/firebase/RoleTemplateRepository';
import { FarmRole } from '../../../domain/entities/Farm';
import { Permission } from '../../../domain/entities/Permission';
import { AppError } from '../../../infrastructure/errors/AppError';
import { PermissionService } from '../../services/PermissionService';

/**
 * Use case for checking if a user has specific permissions on a farm
 * Supports both legacy role-based checks and new permission-based checks
 */
export class CheckPermissionUseCase {
  public farmRepository: FarmRepository;
  public roleTemplateRepository: RoleTemplateRepository;
  public permissionService: PermissionService;

  constructor(deps: { 
    farmRepository: FarmRepository;
    roleTemplateRepository: RoleTemplateRepository;
    permissionService: PermissionService;
  }) {
    this.farmRepository = deps.farmRepository;
    this.roleTemplateRepository = deps.roleTemplateRepository;
    this.permissionService = deps.permissionService;
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, farmId: string, requiredPermission: Permission): Promise<boolean> {
    try {
      const members = await this.farmRepository.getMembers(farmId);
      const member = members.find(m => m.userId === userId);
      
      if (!member) return false;

      // Get user's role template
      const roleTemplate = await this.roleTemplateRepository.findById(farmId, member.role);
      if (!roleTemplate) {
        // Fallback to legacy role hierarchy if no template found
        return this.legacyRoleCheck(member.role as FarmRole, requiredPermission);
      }

      // Use custom permissions if set, otherwise use template permissions
      const userPermissions = (member.customPermissions || roleTemplate.permissions) as Permission[];

      return this.permissionService.hasPermission(userPermissions, requiredPermission);
    } catch (error) {
      throw new AppError(
        `Failed to check permission for user ${userId} on farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CheckPermissionUseCase',
        'CHECK_PERMISSION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Legacy role hierarchy check for backward compatibility
   * @deprecated Use permission-based checks instead
   */
  async execute(userId: string, farmId: string, requiredRole: FarmRole): Promise<boolean> {
    try {
      const members = await this.farmRepository.getMembers(farmId);
      const member = members.find(m => m.userId === userId);
      
      if (!member) return false;

      // Role hierarchy
      const roles: FarmRole[] = ['worker', 'manager', 'owner'];
      const userRoleIndex = roles.indexOf(member.role as FarmRole);
      const requiredRoleIndex = roles.indexOf(requiredRole);

      return userRoleIndex >= requiredRoleIndex;
    } catch (error) {
      throw new AppError(
        `Failed to check permission for user ${userId} on farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CheckPermissionUseCase',
        'CHECK_PERMISSION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Legacy role-based permission mapping
   */
  private legacyRoleCheck(role: FarmRole, permission: Permission): boolean {
    // Owner has all permissions
    if (role === 'owner') return true;

    // Manager permissions
    const managerPermissions: Permission[] = [
      'tasks:*', 'blocks:*', 'members:view', 'members:invite', 
      'members:edit', 'farm:view', 'farm:edit', 'attachments:*'
    ];

    // Worker permissions
    const workerPermissions: Permission[] = [
      'tasks:view', 'tasks:create', 'tasks:edit', 'blocks:view',
      'members:view', 'farm:view', 'attachments:view', 'attachments:create'
    ];

    const rolePermissions = role === 'manager' ? managerPermissions : workerPermissions;
    return this.permissionService.hasPermission(rolePermissions, permission);
  }
}
