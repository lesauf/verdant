import { and, eq } from 'drizzle-orm';
import { Task } from '../../domain/entities/Task';
import { taskMapper } from '../mappers/taskMapper';
import { db } from '../sources/sqlite/client';
import { tasks } from '../sources/sqlite/schema';

/**
 * TaskRepository - Data access for Task entities
 * Handles SQLite persistence and sync queue
 */
export class TaskRepository {
  /**
   * Find all non-deleted tasks
   */
  async findAll(): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.isDeleted, 0));
    
    return rows.map(taskMapper.toDomain);
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<Task | null> {
    const rows = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.isDeleted, 0)));
    
    return rows.length > 0 ? taskMapper.toDomain(rows[0]) : null;
  }

  /**
   * Save new task
   */
  async save(task: Task): Promise<Task> {
    const dbModel = taskMapper.toDatabase(task);
    
    await db.insert(tasks).values({
      id: dbModel.id,
      title: dbModel.title,
      description: dbModel.description,
      status: dbModel.status,
      blockId: dbModel.blockId,
      assignedTo: dbModel.assignedTo,
      startDate: dbModel.startDate ? new Date(dbModel.startDate) : null,
      dueDate: dbModel.dueDate ? new Date(dbModel.dueDate) : null,
      createdAt: new Date(dbModel.createdAt),
      updatedAt: new Date(dbModel.updatedAt),
      syncedAt: dbModel.syncedAt ? new Date(dbModel.syncedAt) : null,
      isDeleted: dbModel.isDeleted,
    });

    // TODO: Queue for sync
    
    return task;
  }

  /**
   * Update existing task
   */
  async update(task: Task): Promise<Task> {
    const dbModel = taskMapper.toDatabase(task);
    
    await db
      .update(tasks)
      .set({
        title: dbModel.title,
        description: dbModel.description,
        status: dbModel.status,
        blockId: dbModel.blockId,
        assignedTo: dbModel.assignedTo,
        startDate: dbModel.startDate ? new Date(dbModel.startDate) : null,
        dueDate: dbModel.dueDate ? new Date(dbModel.dueDate) : null,
        updatedAt: new Date(dbModel.updatedAt),
      })
      .where(eq(tasks.id, task.id));

    // TODO: Queue for sync
    
    return task;
  }

  /**
   * Soft delete task
   */
  async delete(id: string): Promise<void> {
    await db
      .update(tasks)
      .set({
        isDeleted: 1,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));

    // TODO: Queue for sync
  }

  /**
   * Find tasks that need syncing
   */
  async findUnsynced(): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.syncedAt, null)
          // TODO: or updatedAt > syncedAt
        )
      );
    
    return rows.map(taskMapper.toDomain);
  }
}
