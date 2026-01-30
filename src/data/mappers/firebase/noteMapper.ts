import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Note } from '../../../domain/entities/Note';

/**
 * Database model for Note (from Firestore)
 */
export interface NoteFirestoreModel {
  id: string;
  title: string;
  type: string;
  content: string;
  items: string; // JSON string for ShoppingItem[]
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
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
      type: domain.type,
      content: domain.content || "",
      items: JSON.stringify(domain.items || []),
      createdAt: FirebaseFirestoreTypes.Timestamp.fromDate(domain.createdAt || new Date()),
      updatedAt: FirebaseFirestoreTypes.Timestamp.fromDate(domain.updatedAt || new Date()),
      isDeleted: domain.isDeleted,
    };
  },
};
