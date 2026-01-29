import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Task } from '../../../domain/entities/Task';

/**
 * Database model for Task (from Firestore)
 */
export interface TaskFirestoreModel {
  id: string;
  title: string;
  description: string | null;
  status: string;
  blockId: string | null;
  assignedTo: string | null;
  startDate: FirebaseFirestoreTypes.Timestamp | null;
  dueDate: FirebaseFirestoreTypes.Timestamp | null;
  completedAt: FirebaseFirestoreTypes.Timestamp | null;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  syncedAt: FirebaseFirestoreTypes.Timestamp | null;
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
      status: domain.status,
      blockId: domain.blockId,
      assignedTo: domain.assignedTo,
      startDate: domain.startDate ? FirebaseFirestoreTypes.Timestamp.fromDate(domain.startDate) : null,
      dueDate: domain.dueDate ? FirebaseFirestoreTypes.Timestamp.fromDate(domain.dueDate) : null,
      completedAt: domain.completedAt ? FirebaseFirestoreTypes.Timestamp.fromDate(domain.completedAt) : null,
      createdAt: FirebaseFirestoreTypes.Timestamp.fromDate(domain.createdAt),
      updatedAt: FirebaseFirestoreTypes.Timestamp.fromDate(domain.updatedAt),
      syncedAt: domain.syncedAt ? FirebaseFirestoreTypes.Timestamp.fromDate(domain.syncedAt) : null,
      isDeleted: domain.isDeleted,
    };
  },
};
