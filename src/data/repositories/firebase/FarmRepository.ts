import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from '@react-native-firebase/firestore';
import { Farm, FarmMember } from '../../../domain/entities/Farm';
import { firebaseDb } from '../../../infrastructure/config/firebase';
import { AppError } from '../../../infrastructure/errors/AppError';
import { FarmFirestoreModel, farmMapper } from '../../mappers/firebase/farmMapper';
import { FarmMemberFirestoreModel, farmMemberMapper } from '../../mappers/firebase/farmMemberMapper';

/**
 * FarmRepository - Data access for Farm entities using Firestore
 */
export class FarmRepository {
  private collectionName = 'farms';

  /**
   * Find all farms where user is owner or member
   */
  async findAllForUser(userId: string): Promise<Farm[]> {
    try {
      // Note: This requires a composite index if we were querying multiple fields,
      // but here we might need to find farms where ownerId == userId 
      // AND also find farms where user is in the 'members' subcollection.
      // Firestore doesn't easily support "find document where subcollection contains X" across all documents.
      
      // Approach:
      // 1. Find farms where ownerId == userId
      const ownedQuery = query(
        collection(firebaseDb, this.collectionName),
        where('ownerId', '==', userId),
        where('isDeleted', '==', false)
      );
      const ownedSnapshot = await getDocs(ownedQuery);
      const ownedFarms = ownedSnapshot.docs.map((doc: any) => 
        farmMapper.toDomain({ id: doc.id, ...doc.data() } as FarmFirestoreModel)
      );

      // 2. Note: For members, in a real app, we might store a list of farmIds on the user profile 
      // or use a collectionGroup query on 'members'. 
      // For now, let's stick to ownerId for the initial implementation and add collectionGroup later if needed.
      
      return ownedFarms;
    } catch (error) {
      throw new AppError(
        `Failed to fetch farms: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FarmRepository',
        'FETCH_FARMS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find farm by ID
   */
  async findById(id: string): Promise<Farm | null> {
    try {
      const docRef = doc(firebaseDb, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists) return null;
      
      const data = { id: docSnap.id, ...docSnap.data() } as FarmFirestoreModel;
      if (data.isDeleted) return null;
      
      return farmMapper.toDomain(data);
    } catch (error) {
      throw new AppError(
        `Failed to fetch farm ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FarmRepository',
        'FETCH_FARM_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Save new farm
   */
  async save(farm: Farm): Promise<Farm> {
    try {
      const data = farmMapper.toFirestore(farm);
      const docRef = doc(firebaseDb, this.collectionName, farm.id);
      await setDoc(docRef, data);
      
      // Also add the owner to the members subcollection by default
      const memberRef = doc(firebaseDb, `${this.collectionName}/${farm.id}/members`, farm.ownerId);
      await setDoc(memberRef, farmMemberMapper.toFirestore({
        userId: farm.ownerId,
        role: 'owner',
        permissions: ['all'],
        joinedAt: new Date()
      }));

      return farm;
    } catch (error) {
      throw new AppError(
        `Failed to save farm: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FarmRepository',
        'SAVE_FARM_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update existing farm
   */
  async update(farm: Farm): Promise<Farm> {
    try {
      const data = farmMapper.toFirestore(farm);
      const docRef = doc(firebaseDb, this.collectionName, farm.id);
      await updateDoc(docRef, data as any);
      return farm;
    } catch (error) {
      throw new AppError(
        `Failed to update farm: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FarmRepository',
        'UPDATE_FARM_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get members of a farm
   */
  async getMembers(farmId: string): Promise<FarmMember[]> {
    try {
      const membersRef = collection(firebaseDb, `${this.collectionName}/${farmId}/members`);
      const snapshot = await getDocs(membersRef);
      return snapshot.docs.map((doc: any) => 
        farmMemberMapper.toDomain(doc.data() as FarmMemberFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch members for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FarmRepository',
        'FETCH_MEMBERS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Add a member to a farm
   */
  async addMember(farmId: string, member: FarmMember): Promise<void> {
    try {
      const memberRef = doc(firebaseDb, `${this.collectionName}/${farmId}/members`, member.userId);
      await setDoc(memberRef, farmMemberMapper.toFirestore(member));
    } catch (error) {
      throw new AppError(
        `Failed to add member to farm: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FarmRepository',
        'ADD_MEMBER_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
