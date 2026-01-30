import { deleteObject, getDownloadURL, putFile, ref } from '@react-native-firebase/storage';
import { firebaseStorage } from '../../infrastructure/config/firebase';
import { AppError } from '../../infrastructure/errors/AppError';

/**
 * Service for handling Firebase Storage (pictures, documents, videos)
 */
export class StorageService {
  /**
   * Upload a file to a specific path
   */
  async uploadFile(path: string, localUri: string): Promise<string> {
    try {
      const storageRef = ref(firebaseStorage, path);
      await putFile(storageRef, localUri);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new AppError(
        `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'StorageService',
        'STORAGE_UPLOAD_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(firebaseStorage, path);
      await deleteObject(storageRef);
    } catch (error) {
      throw new AppError(
        `File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'StorageService',
        'STORAGE_DELETE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get download URL for a file
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(firebaseStorage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new AppError(
        `Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'StorageService',
        'STORAGE_URL_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
