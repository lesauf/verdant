import { collection, doc, getDoc, getDocs, limit, query, setDoc, Timestamp, where } from '@react-native-firebase/firestore';
import { User } from '../../../domain/entities/User';
import { firebaseDb } from '../../../infrastructure/config/firebase';
import { AppError } from '../../../infrastructure/errors/AppError';
import { UserFirestoreModel, userMapper } from '../../mappers/firebase/userMapper';

/**
 * UserRepository - Data access for User profiles using Firestore
 */
export class UserRepository {
  private collectionName = 'users';

  /**
   * Find user by ID (Auth UID)
   */
  async findById(id: string): Promise<User | null> {
    try {
      const docRef = doc(firebaseDb, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists) return null;
      
      const data = { id: docSnap.id, ...docSnap.data() } as UserFirestoreModel;

      return userMapper.toDomain(data);
    } catch (error) {
      throw new AppError(
        `Failed to fetch user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UserRepository',
        'FETCH_USER_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find user by Email (Exact match)
   * Note: Requires an index on 'email' field or use collectionGroup/where
   * For 'users' collection, strict 'where' query is fine.
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
        const usersRef = collection(firebaseDb, this.collectionName);
        const q = query(usersRef, where('email', '==', email), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const docSnap = snapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() } as UserFirestoreModel;
        return userMapper.toDomain(data);
    } catch (error) {
        throw new AppError(
            `Failed to fetch user by email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'UserRepository',
            'FETCH_USER_BY_EMAIL_ERROR',
            error instanceof Error ? error : undefined
        );
    }
  }

  /**
   * Sync User Profile (Create or Update)
   * Used to keep Firestore 'users' collection in sync with Auth
   */
  async syncUser(user: User): Promise<void> {
    try {
        const docRef = doc(firebaseDb, this.collectionName, user.id);
        const data = userMapper.toFirestore(user);
        
        // Use set with merge: true to avoid overwriting fields if we have partial updates later
        // But here we want to ensure the specific Auth fields are current
        await setDoc(docRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
    } catch (error) {
        throw new AppError(
            `Failed to sync user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'UserRepository',
            'SYNC_USER_ERROR',
            error instanceof Error ? error : undefined
        );
    }
  }
}
