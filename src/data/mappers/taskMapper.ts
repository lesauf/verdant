import { Task } from '../../domain/entities/Task';

/**
 * Database model for Task (from SQLite)
 */
interface TaskDbModel {
  id: string;
  title: string;
  description: string | null;
  status: string;
  blockId: string | null;
  assignedTo: string | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  isDeleted: number;
}

/**
 * Mapper: Domain Entity ↔ Database Model
 */
export const taskMapper = {
  /**
   * Convert database row to domain entity
   */
  toDomain(db: TaskDbModel): Task {
    return new Task(
      db.id,
      db.title,
      db.description,
      db.status as any,
      db.blockId,
      db.assignedTo,
      db.startDate ? new Date(db.startDate) : null,
      db.dueDate ? new Date(db.dueDate) : null,
      new Date(db.createdAt),
      new Date(db.updatedAt),
      db.syncedAt ? new Date(db.syncedAt) : null,
      db.isDeleted === 1
    );
  },

  /**
   * Convert domain entity to database model
   */
  toDatabase(domain: Task): TaskDbModel {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      status: domain.status,
      blockId: domain.blockId,
      assignedTo: domain.assignedTo,
      startDate: domain.startDate ? domain.startDate.toISOString() : null,
      dueDate: domain.dueDate ? domain.dueDate.toISOString() : null,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
      syncedAt: domain.syncedAt ? domain.syncedAt.toISOString() : null,
      isDeleted: domain.isDeleted ? 1 : 0,
    };
  },
};
