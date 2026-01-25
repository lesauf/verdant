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
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  isDeleted: boolean;
}

/**
 * Mapper: Domain Entity ↔ Database Model
 */
export const taskMapper = {
  /**
   * Convert database row to domain entity
   */
  toDomain(db: TaskDbModel): Task {
    return new Task({
      id: db.id,
      title: db.title,
      description: db.description,
      status: db.status as any,
      blockId: db.blockId,
      assignedTo: db.assignedTo,
      startDate: db.startDate ? new Date(db.startDate) : null,
      dueDate: db.dueDate ? new Date(db.dueDate) : null,
      completedAt: db.completedAt ? new Date(db.completedAt) : null,
      createdAt: new Date(db.createdAt),
      updatedAt: new Date(db.updatedAt),
      syncedAt: db.syncedAt ? new Date(db.syncedAt) : null,
      isDeleted: db.isDeleted
    });
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
      completedAt: domain.completedAt ? domain.completedAt.toISOString() : null,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
      syncedAt: domain.syncedAt ? domain.syncedAt.toISOString() : null,
      isDeleted: domain.isDeleted,
    };
  },
};
