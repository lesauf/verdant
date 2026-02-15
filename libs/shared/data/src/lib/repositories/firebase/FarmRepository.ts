import { collection, collectionGroup, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from '@react-native-firebase/firestore';
import { Farm, FarmMember } from 'domain/entities/Farm';
import { firebaseDb } from 'infrastructure/config/firebase';
import { AppError } from 'infrastructure/errors/AppError';
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
      console.log('FarmRepository: Fetching farms for user', userId);
      
      // 1. Find farms where user is a member using collectionGroup
      const membersQuery = query(
        collectionGroup(firebaseDb, 'members'),
        where('userId', '==', userId)
      );
      
      const memberSnapshots = await getDocs(membersQuery);
      console.log(`FarmRepository: Found ${memberSnapshots.docs.length} memberships`);
      
      const farmIds = memberSnapshots.docs.map((docSnap: any) => {
        // The parent of the member document is the 'members' collection,
        // and its parent is the farm document.
        return docSnap.ref.parent.parent?.id;
      }).filter((id: string | undefined): id is string => !!id);

      if (farmIds.length === 0) {
        console.log('FarmRepository: No farms found for user');
        return [];
      }

      // 2. Fetch the actual farm documents
      // Note: Firestore 'where in' is limited to 10-30 IDs usually.
      // For now we fetch them individually or in batches if needed.
      const farmPromises = farmIds.map((id: string) => this.findById(id));
      const farms = await Promise.all(farmPromises);
      
      const activeFarms = farms.filter((f: Farm | null): f is Farm => f !== null);
      console.log(`FarmRepository: Returning ${activeFarms.length} active farms`);
      
      return activeFarms;
    } catch (error) {
      console.error('FarmRepository: Error in findAllForUser', error);
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
    console.log('FarmRepository: Saving farm', farm.id);
    try {
      const data = farmMapper.toFirestore(farm);
      const docRef = doc(firebaseDb, this.collectionName, farm.id);
      console.log('FarmRepository: Setting farm document');
      await setDoc(docRef, data);
      
      console.log('FarmRepository: Adding owner to members subcollection');
      const memberRef = doc(firebaseDb, `${this.collectionName}/${farm.id}/members`, farm.ownerId);
      await setDoc(memberRef, farmMemberMapper.toFirestore({
        userId: farm.ownerId,
        role: 'owner',
        permissions: ['all'],
        joinedAt: new Date(),
        status: 'active',
        displayName: 'Owner' // Ideally this should be the user's name
      }));

      console.log('FarmRepository: Farm saved successfully');
      return farm;
    } catch (error) {
      console.error('FarmRepository: Error saving farm', error);
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
