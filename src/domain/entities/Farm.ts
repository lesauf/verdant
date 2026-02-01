export type FarmRole = 'owner' | 'manager' | 'worker';

export interface FarmMember {
  userId: string;
  role: FarmRole;
  permissions: string[];
  joinedAt: Date;
}

export interface FarmGeolocation {
  latitude: number;
  longitude: number;
}

export class Farm {
  public readonly id!: string;
  public name!: string;
  public ownerId!: string;
  public location: FarmGeolocation | null = null;
  public createdAt!: Date;
  public updatedAt!: Date;
  public isDeleted: boolean = false;

  constructor(data?: Partial<Farm>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Check if a user has a specific permission
   * For now, this is a placeholder as permissions are stored in the 'members' subcollection
   */
  hasPermission(userId: string, permission: string): boolean {
    // This logic will be implemented in a service or via the repository
    return true; 
  }
}
