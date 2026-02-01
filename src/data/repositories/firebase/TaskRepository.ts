import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from '@react-native-firebase/firestore';
import { Task } from '../../../domain/entities/Task';
import { firebaseDb } from '../../../infrastructure/config/firebase';
import { AppError } from '../../../infrastructure/errors/AppError';
import { TaskFirestoreModel, taskMapper } from '../../mappers/firebase/taskMapper';

/**
 * TaskRepository - Data access for Task entities using Firestore
 */
export class TaskRepository {
  private getCollectionPath(farmId: string) {
    return `farms/${farmId}/tasks`;
  }

  /**
   * Find all non-deleted tasks for a farm
   */
  async findAll(farmId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(firebaseDb, this.getCollectionPath(farmId)),
        where('isDeleted', '==', false)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => 
        taskMapper.toDomain({ id: doc.id, ...doc.data() } as TaskFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch tasks for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'FETCH_TASKS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find task by ID
   */
  async findById(farmId: string, id: string): Promise<Task | null> {
    try {
      const docRef = doc(firebaseDb, this.getCollectionPath(farmId), id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists) return null;
      
      const data = { id: docSnap.id, ...docSnap.data() } as TaskFirestoreModel;
      if (data.isDeleted) return null;
      
      return taskMapper.toDomain(data);
    } catch (error) {
      throw new AppError(
        `Failed to fetch task ${id} in farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      if (!task.farmId) throw new Error('farmId is required to save a task');
      const data = taskMapper.toFirestore(task);
      const docRef = doc(firebaseDb, this.getCollectionPath(task.farmId), task.id);
      await setDoc(docRef, data);
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
      if (!task.farmId) throw new Error('farmId is required to update a task');
      const data = taskMapper.toFirestore(task);
      const docRef = doc(firebaseDb, this.getCollectionPath(task.farmId), task.id);
      await updateDoc(docRef, data as any);
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
  async delete(farmId: string, id: string): Promise<void> {
    try {
      const docRef = doc(firebaseDb, this.getCollectionPath(farmId), id);
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: Timestamp.now()
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
   * Find tasks by block ID within a farm
   */
  async findByBlockId(farmId: string, blockId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(firebaseDb, this.getCollectionPath(farmId)),
        where('blockId', '==', blockId),
        where('isDeleted', '==', false)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => 
        taskMapper.toDomain({ id: doc.id, ...doc.data() } as TaskFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch tasks for block ${blockId} in farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TaskRepository',
        'FETCH_TASKS_BY_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
