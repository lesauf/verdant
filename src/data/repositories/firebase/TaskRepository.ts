import { Task } from '../../../domain/entities/Task';
import { firebaseDb } from '../../../infrastructure/config/firebase';
import { AppError } from '../../../infrastructure/errors/AppError';
import { TaskFirestoreModel, taskMapper } from '../../mappers/firebase/taskMapper';

/**
 * TaskRepository - Data access for Task entities using Firestore
 */
export class TaskRepository {
  private collection = firebaseDb.collection('tasks');

  /**
   * Find all non-deleted tasks
   */
  async findAll(): Promise<Task[]> {
    try {
      const snapshot = await this.collection
        .where('isDeleted', '==', false)
        .get();
      
      return snapshot.docs.map(doc => 
        taskMapper.toDomain({ id: doc.id, ...doc.data() } as TaskFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'FETCH_TASKS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<Task | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      
      const data = { id: doc.id, ...doc.data() } as TaskFirestoreModel;
      if (data.isDeleted) return null;
      
      return taskMapper.toDomain(data);
    } catch (error) {
      throw new AppError(
        `Failed to fetch task ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'FETCH_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Save new task
   */
  async save(task: Task): Promise<Task> {
    try {
      const data = taskMapper.toFirestore(task);
      await this.collection.doc(task.id).set(data);
      return task;
    } catch (error) {
      throw new AppError(
        `Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'SAVE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update existing task
   */
  async update(task: Task): Promise<Task> {
    try {
      const data = taskMapper.toFirestore(task);
      await this.collection.doc(task.id).update(data);
      return task;
    } catch (error) {
      throw new AppError(
        `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'UPDATE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Soft delete task
   */
  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).update({
        isDeleted: true,
        updatedAt: new Date()
      });
    } catch (error) {
      throw new AppError(
        `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'DELETE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find tasks by block ID
   */
  async findByBlockId(blockId: string): Promise<Task[]> {
    try {
      const snapshot = await this.collection
        .where('blockId', '==', blockId)
        .where('isDeleted', '==', false)
        .get();
      
      return snapshot.docs.map(doc => 
        taskMapper.toDomain({ id: doc.id, ...doc.data() } as TaskFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch tasks for block ${blockId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'FETCH_TASKS_BY_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
