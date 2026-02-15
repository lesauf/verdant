import { collection, deleteDoc, doc, getDocs, query, setDoc, Timestamp, where } from '@react-native-firebase/firestore';
import { firebaseDb } from 'infrastructure/config/firebase';
import { AppError } from 'infrastructure/errors/AppError';

export interface AttachmentFirestoreModel {
  id: string;
  taskId: string;
  type: string;
  uri: string;
  createdAt: Timestamp;
}

/**
 * AttachmentRepository - Data access for Attachment entities using Firestore
 */
export class AttachmentRepository {
  private collectionName = 'attachments';

  /**
   * Find attachments by task ID
   */
  async findByTaskId(taskId: string): Promise<AttachmentFirestoreModel[]> {
    try {
      const q = query(
        collection(firebaseDb, this.collectionName),
        where('taskId', '==', taskId)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as AttachmentFirestoreModel));
    } catch (error) {
      throw new AppError(
        `Failed to fetch attachments for task ${taskId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AttachmentRepository',
        'FETCH_ATTACHMENTS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Save new attachment
   */
  async save(attachment: Omit<AttachmentFirestoreModel, 'createdAt'> & { createdAt: Date }): Promise<void> {
    try {
      const { createdAt, ...rest } = attachment;
      const data = {
        ...rest,
        createdAt: Timestamp.fromDate(createdAt)
      };
      const docRef = doc(firebaseDb, this.collectionName, attachment.id);
      await setDoc(docRef, data);
    } catch (error) {
      throw new AppError(
        `Failed to save attachment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AttachmentRepository',
        'SAVE_ATTACHMENT_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete attachment
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firebaseDb, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new AppError(
        `Failed to delete attachment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AttachmentRepository',
        'DELETE_ATTACHMENT_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
