/**
 * Permission System for Verdant Farm Management
 * 
 * Permissions follow the pattern: <resource>:<action>
 * Wildcards are supported: tasks:* grants all task permissions
 */

// Task Permissions
export type TaskPermission =
  | 'tasks:view'
  | 'tasks:create'
  | 'tasks:edit'
  | 'tasks:delete'
  | 'tasks:assign'
  | 'tasks:*';

// Block Permissions
export type BlockPermission =
  | 'blocks:view'
  | 'blocks:create'
  | 'blocks:edit'
  | 'blocks:delete'
  | 'blocks:*';

// Member Permissions
export type MemberPermission =
  | 'members:view'
  | 'members:invite'
  | 'members:edit'
  | 'members:remove'
  | 'members:*';

// Farm Permissions
export type FarmPermission =
  | 'farm:view'
  | 'farm:edit'
  | 'farm:delete'
  | 'farm:*';

// Crop Permissions (Future)
export type CropPermission =
  | 'crops:view'
  | 'crops:create'
  | 'crops:edit'
  | 'crops:delete'
  | 'crops:*';

// Attachment Permissions
export type AttachmentPermission =
  | 'attachments:view'
  | 'attachments:create'
  | 'attachments:delete'
  | 'attachments:*';

// All Permissions Union
export type Permission =
  | TaskPermission
  | BlockPermission
  | MemberPermission
  | FarmPermission
  | CropPermission
  | AttachmentPermission
  | '*'; // Super admin - all permissions

/**
 * Permission Categories for UI organization
 */
export const PermissionCategories = {
  TASKS: 'Tasks',
  BLOCKS: 'Blocks',
  MEMBERS: 'Members',
  FARM: 'Farm',
  CROPS: 'Crops',
  ATTACHMENTS: 'Attachments',
} as const;

/**
 * All available permissions grouped by category
 */
export const PermissionsByCategory: Record<string, Permission[]> = {
  [PermissionCategories.TASKS]: [
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'tasks:delete',
    'tasks:assign',
  ],
  [PermissionCategories.BLOCKS]: [
    'blocks:view',
    'blocks:create',
    'blocks:edit',
    'blocks:delete',
  ],
  [PermissionCategories.MEMBERS]: [
    'members:view',
    'members:invite',
    'members:edit',
    'members:remove',
  ],
  [PermissionCategories.FARM]: [
    'farm:view',
    'farm:edit',
    'farm:delete',
  ],
  [PermissionCategories.CROPS]: [
    'crops:view',
    'crops:create',
    'crops:edit',
    'crops:delete',
  ],
  [PermissionCategories.ATTACHMENTS]: [
    'attachments:view',
    'attachments:create',
    'attachments:delete',
  ],
};

/**
 * Permission action labels for UI
 */
export const PermissionActions = {
  VIEW: 'View',
  CREATE: 'Create',
  EDIT: 'Edit',
  DELETE: 'Delete',
  ASSIGN: 'Assign',
  INVITE: 'Invite',
  REMOVE: 'Remove',
} as const;

/**
 * Helper function to check if a permission string is valid
 */
export function isValidPermission(permission: string): permission is Permission {
  if (permission === '*') return true;
  
  const allPermissions = Object.values(PermissionsByCategory).flat();
  return allPermissions.includes(permission as Permission);
}

/**
 * Helper function to get resource from permission
 * Example: 'tasks:create' -> 'tasks'
 */
export function getPermissionResource(permission: Permission): string {
  if (permission === '*') return '*';
  return permission.split(':')[0];
}

/**
 * Helper function to get action from permission
 * Example: 'tasks:create' -> 'create'
 */
export function getPermissionAction(permission: Permission): string {
  if (permission === '*') return '*';
  return permission.split(':')[1];
}
