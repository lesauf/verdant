// import { Permission, getPermissionResource } from 'domain/entities/Permission';

import { getPermissionResource, Permission } from "domain/entities/Permission";

/**
 * Permission Service
 * Centralized logic for checking and validating permissions
 */
export class PermissionService {
  /**
   * Check if a user has a specific permission
   * Supports wildcard permissions (e.g., 'tasks:*' grants all task permissions)
   * 
   * @param userPermissions - Array of permissions the user has
   * @param requiredPermission - The permission to check for
   * @returns true if user has the permission
   */
  hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
    // Super admin check
    if (userPermissions.includes('*')) {
      return true;
    }

    // Direct permission match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Wildcard permission check (e.g., 'tasks:*' grants 'tasks:create')
    const requiredResource = getPermissionResource(requiredPermission);
    const wildcardPermission = `${requiredResource}:*` as Permission;
    
    if (userPermissions.includes(wildcardPermission)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a user has ALL of the specified permissions
   * 
   * @param userPermissions - Array of permissions the user has
   * @param requiredPermissions - Array of permissions to check for
   * @returns true if user has all permissions
   */
  hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => 
      this.hasPermission(userPermissions, permission)
    );
  }

  /**
   * Check if a user has ANY of the specified permissions
   * 
   * @param userPermissions - Array of permissions the user has
   * @param requiredPermissions - Array of permissions to check for
   * @returns true if user has at least one permission
   */
  hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(permission => 
      this.hasPermission(userPermissions, permission)
    );
  }

  /**
   * Expand wildcard permissions to their full set
   * Example: ['tasks:*'] -> ['tasks:view', 'tasks:create', 'tasks:edit', 'tasks:delete', 'tasks:assign']
   * 
   * @param permissions - Array of permissions (may include wildcards)
   * @returns Array of expanded permissions
   */
  expandWildcards(permissions: Permission[]): Permission[] {
    const expanded = new Set<Permission>();

    for (const permission of permissions) {
      if (permission === '*') {
        // Super admin - return all possible permissions
        return this.getAllPermissions();
      }

      if (permission.endsWith(':*')) {
        // Expand resource wildcard
        const resource = getPermissionResource(permission);
        const resourcePermissions = this.getPermissionsForResource(resource);
        resourcePermissions.forEach(p => expanded.add(p));
      } else {
        expanded.add(permission);
      }
    }

    return Array.from(expanded);
  }

  /**
   * Get all permissions for a specific resource
   * 
   * @param resource - Resource name (e.g., 'tasks', 'blocks')
   * @returns Array of permissions for that resource
   */
  private getPermissionsForResource(resource: string): Permission[] {
    const allPermissions = this.getAllPermissions();
    return allPermissions.filter(p => getPermissionResource(p) === resource);
  }

  /**
   * Get all available permissions in the system
   * 
   * @returns Array of all permissions
   */
  private getAllPermissions(): Permission[] {
    return [
      // Tasks
      'tasks:view', 'tasks:create', 'tasks:edit', 'tasks:delete', 'tasks:assign',
      // Blocks
      'blocks:view', 'blocks:create', 'blocks:edit', 'blocks:delete',
      // Members
      'members:view', 'members:invite', 'members:edit', 'members:remove',
      // Farm
      'farm:view', 'farm:edit', 'farm:delete',
      // Crops
      'crops:view', 'crops:create', 'crops:edit', 'crops:delete',
      // Attachments
      'attachments:view', 'attachments:create', 'attachments:delete',
    ];
  }

  /**
   * Validate that all permissions in an array are valid
   * 
   * @param permissions - Array of permissions to validate
   * @returns Array of invalid permissions (empty if all valid)
   */
  validatePermissions(permissions: Permission[]): string[] {
    const allPermissions = this.getAllPermissions();
    const validWildcards = ['*', 'tasks:*', 'blocks:*', 'members:*', 'farm:*', 'crops:*', 'attachments:*'];
    
    const invalid: string[] = [];

    for (const permission of permissions) {
      if (!allPermissions.includes(permission) && !validWildcards.includes(permission)) {
        invalid.push(permission);
      }
    }

    return invalid;
  }
}
