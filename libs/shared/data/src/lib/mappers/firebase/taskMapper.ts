import { Timestamp } from '@react-native-firebase/firestore';
import { Task } from 'domain/entities/Task';

/**
 * Database model for Task (from Firestore)
 */
export interface TaskFirestoreModel {
  id: string;
  title: string;
  description: string | null;
  farmId: string;
  status: string;
  blockId: string | null;
  assignedTo: string | null;
  startDate: Timestamp | null;
  dueDate: Timestamp | null;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  syncedAt: Timestamp | null;
  isDeleted: boolean;
}

/**
 * Mapper: Domain Entity ↔ Firestore Model
 */
export const taskMapper = {
  /**
   * Convert firestore document to domain entity
   */
  toDomain(data: TaskFirestoreModel): Task {
    return new Task({
      id: data.id,
      title: data.title,
      description: data.description,
      farmId: data.farmId,
      status: data.status as any,
      blockId: data.blockId,
      assignedTo: data.assignedTo,
      startDate: data.startDate ? data.startDate.toDate() : null,
      dueDate: data.dueDate ? data.dueDate.toDate() : null,
      completedAt: data.completedAt ? data.completedAt.toDate() : null,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      syncedAt: data.syncedAt ? data.syncedAt.toDate() : null,
      isDeleted: data.isDeleted
    });
  },

  /**
   * Convert domain entity to firestore model data
   */
  toFirestore(domain: Task): Omit<TaskFirestoreModel, 'id'> {
    return {
      title: domain.title,
      description: domain.description,
      farmId: domain.farmId,
      status: domain.status,
      blockId: domain.blockId,
      assignedTo: domain.assignedTo,
      startDate: domain.startDate ? Timestamp.fromDate(domain.startDate) : null,
      dueDate: domain.dueDate ? Timestamp.fromDate(domain.dueDate) : null,
      completedAt: domain.completedAt ? Timestamp.fromDate(domain.completedAt) : null,
      createdAt: Timestamp.fromDate(domain.createdAt),
      updatedAt: Timestamp.fromDate(domain.updatedAt),
      syncedAt: domain.syncedAt ? Timestamp.fromDate(domain.syncedAt) : null,
      isDeleted: domain.isDeleted,
    };
  },
};
