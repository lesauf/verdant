import { Timestamp, collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from '@react-native-firebase/firestore';
import { Note } from 'domain/entities/Note';
import { firebaseDb } from 'infrastructure/config/firebase';
import { AppError } from 'infrastructure/errors/AppError';
import { NoteFirestoreModel, noteMapper } from '../../mappers/firebase/noteMapper';

/**
 * NoteRepository - Data access for Note entities using Firestore
 */
export class NoteRepository {
  private getCollectionPath(farmId: string) {
    return `farms/${farmId}/notes`;
  }

  /**
   * Find all non-deleted notes for a farm
   */
  async findAll(farmId: string): Promise<Note[]> {
    try {
      const q = query(
        collection(firebaseDb, this.getCollectionPath(farmId)),
        where('isDeleted', '==', false),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => 
        noteMapper.toDomain({ id: doc.id, ...doc.data() } as NoteFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch notes for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NoteRepository',
        'FETCH_NOTES_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find note by ID
   */
  async findById(farmId: string, id: string): Promise<Note | null> {
    try {
      const docRef = doc(firebaseDb, this.getCollectionPath(farmId), id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists) return null;
      
      const data = { id: docSnap.id, ...docSnap.data() } as NoteFirestoreModel;
      if (data.isDeleted) return null;
      
      return noteMapper.toDomain(data);
    } catch (error) {
      throw new AppError(
        `Failed to fetch note ${id} in farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NoteRepository',
        'FETCH_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Save new note
   */
  async save(note: Note): Promise<Note> {
    try {
      if (!note.farmId) throw new Error('farmId is required to save a note');
      const data = noteMapper.toFirestore(note);
      const docRef = doc(firebaseDb, this.getCollectionPath(note.farmId), note.id);
      await setDoc(docRef, data);
      return note;
    } catch (error) {
      throw new AppError(
        `Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NoteRepository',
        'SAVE_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update existing note
   */
  async update(note: Note): Promise<Note> {
    try {
      if (!note.farmId) throw new Error('farmId is required to update a note');
      const data = noteMapper.toFirestore(note);
      const docRef = doc(firebaseDb, this.getCollectionPath(note.farmId), note.id);
      await updateDoc(docRef, data as any);
      return note;
    } catch (error) {
      throw new AppError(
        `Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NoteRepository',
        'UPDATE_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Soft delete note
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
        `Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NoteRepository',
        'DELETE_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
