export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public blockId: string | null,
    public assignedTo: string | null,
    public startDate: Date | null,
    public dueDate: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public syncedAt: Date | null = null,
    public isDeleted: boolean = false
  ) {}

  /**
   * Business rule: Task is overdue if it has a due date in the past and is not complete
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.status === 'Done') {
      return false;
    }
    return this.dueDate < new Date();
  }

  /**
   * Business rule: Can only complete tasks that aren't already done
   */
  canComplete(): boolean {
    return this.status !== 'Done';
  }

  /**
   * Mark task as complete
   */
  complete(): void {
    if (!this.canComplete()) {
      throw new Error('Task is already completed');
    }
    this.status = 'Done';
    this.updatedAt = new Date();
  }

  /**
   * Assign task to a block
   */
  assignToBlock(blockId: string): void {
    this.blockId = blockId;
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
   * Check if task needs syncing
   */
  needsSync(): boolean {
    return this.syncedAt === null || this.updatedAt > this.syncedAt;
  }
}
