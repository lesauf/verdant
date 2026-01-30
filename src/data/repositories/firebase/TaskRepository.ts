import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from '@react-native-firebase/firestore';
import { Task } from '../../../domain/entities/Task';
import { firebaseDb } from '../../../infrastructure/config/firebase';
import { AppError } from '../../../infrastructure/errors/AppError';
import { TaskFirestoreModel, taskMapper } from '../../mappers/firebase/taskMapper';

/**
 * TaskRepository - Data access for Task entities using Firestore
 */
export class TaskRepository {
  private collectionName = 'tasks';

  /**
   * Find all non-deleted tasks
   */
  async findAll(): Promise<Task[]> {
    try {
      const q = query(
        collection(firebaseDb, this.collectionName),
        where('isDeleted', '==', false)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => 
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
      const docRef = doc(firebaseDb, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists) return null;
      
      const data = { id: docSnap.id, ...docSnap.data() } as TaskFirestoreModel;
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
      const docRef = doc(firebaseDb, this.collectionName, task.id);
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
      const data = taskMapper.toFirestore(task);
      const docRef = doc(firebaseDb, this.collectionName, task.id);
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
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firebaseDb, this.collectionName, id);
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
   * Find tasks by block ID
   */
  async findByBlockId(blockId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(firebaseDb, this.collectionName),
        where('blockId', '==', blockId),
        where('isDeleted', '==', false)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => 
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
