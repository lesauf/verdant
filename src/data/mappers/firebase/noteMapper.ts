import { Timestamp } from '@react-native-firebase/firestore';
import { Note } from '../../../domain/entities/Note';

/**
 * Database model for Note (from Firestore)
 */
export interface NoteFirestoreModel {
  id: string;
  title: string;
  farmId: string;
  type: string;
  content: string;
  items: string; // JSON string for ShoppingItem[]
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted: boolean;
}

/**
 * Mapper: Domain Entity ↔ Firestore Model
 */
export const noteMapper = {
  /**
   * Convert firestore document to domain entity
   */
  toDomain(data: NoteFirestoreModel): Note {
    return new Note({
      id: data.id,
      title: data.title,
      farmId: data.farmId,
      type: data.type as any,
      content: data.content,
      items: data.items ? JSON.parse(data.items) : [],
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      isDeleted: data.isDeleted
    });
  },

  /**
   * Convert domain entity to firestore model data
   */
  toFirestore(domain: Note): Omit<NoteFirestoreModel, 'id'> {
    return {
      title: domain.title,
      farmId: domain.farmId,
      type: domain.type,
      content: domain.content || "",
      items: JSON.stringify(domain.items || []),
      createdAt: Timestamp.fromDate(domain.createdAt || new Date()),
      updatedAt: Timestamp.fromDate(domain.updatedAt || new Date()),
      isDeleted: domain.isDeleted,
    };
  },
};
