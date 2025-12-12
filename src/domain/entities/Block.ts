export type BlockStatus = 'Planted' | 'Prep' | 'Fallow';

export class Block {
  public readonly id!: string;
  public name!: string;
  public areaHa!: number;
  public status!: BlockStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public geoJson!: any | null;
  public readonly createdAt!: Date;
  public updatedAt!: Date;
  public syncedAt: Date | null = null;
  public isDeleted: boolean = false;

  constructor(data?: Partial<Block>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Business rule: Can only plant on blocks that are in Prep or Fallow status
   */
  canPlant(): boolean {
    return this.status === 'Prep' || this.status === 'Fallow';
  }

  /**
   * Update block status and mark as modified
   */
  updateStatus(newStatus: BlockStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Soft delete for sync purposes
   */
  markForDeletion(): void {
    this.isDeleted = true;
    this.updatedAt = new Date();
  }

  /**
   * Check if block needs syncing
   */
  needsSync(): boolean {
    return this.syncedAt === null || this.updatedAt > this.syncedAt;
  }
}
