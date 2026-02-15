import { Permission } from './Permission';

/**
 * Role Template Entity
 * Represents a reusable set of permissions that can be assigned to farm members
 */
export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean; // true for Owner (cannot be edited/deleted)
  farmId: string; // Farm this template belongs to
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Default role template names
 */
export const DefaultRoleNames = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  WORKER: 'Worker',
} as const;

/**
 * Factory functions for creating default role templates
 */
export class RoleTemplateFactory {
  /**
   * Create Owner role template (system role with all permissions)
   */
  static createOwnerTemplate(farmId: string): Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: DefaultRoleNames.OWNER,
      description: 'Farm owner with full access to all features',
      permissions: ['*'],
      isSystemRole: true,
      farmId,
    };
  }

  /**
   * Create Manager role template (editable)
   */
  static createManagerTemplate(farmId: string): Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: DefaultRoleNames.MANAGER,
      description: 'Farm manager with broad permissions',
      permissions: [
        'tasks:*',
        'blocks:*',
        'members:view',
        'members:invite',
        'members:edit',
        'farm:view',
        'farm:edit',
        'attachments:*',
      ],
      isSystemRole: false,
      farmId,
    };
  }

  /**
   * Create Worker role template (editable)
   */
  static createWorkerTemplate(farmId: string): Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: DefaultRoleNames.WORKER,
      description: 'Farm worker with basic task access',
      permissions: [
        'tasks:view',
        'tasks:create',
        'tasks:edit',
        'blocks:view',
        'members:view',
        'farm:view',
        'attachments:view',
        'attachments:create',
      ],
      isSystemRole: false,
      farmId,
    };
  }
}

/**
 * Validation helper for role templates
 */
export class RoleTemplateValidator {
  /**
   * Validate that a role template has required fields
   */
  static validate(template: Partial<RoleTemplate>): string[] {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Role name is required');
    }

    if (!template.farmId) {
      errors.push('Farm ID is required');
    }

    if (!template.permissions || template.permissions.length === 0) {
      errors.push('At least one permission is required');
    }

    return errors;
  }

  /**
   * Check if a role template can be edited
   */
  static canEdit(template: RoleTemplate): boolean {
    return !template.isSystemRole;
  }

  /**
   * Check if a role template can be deleted
   */
  static canDelete(template: RoleTemplate): boolean {
    return !template.isSystemRole;
  }
}
