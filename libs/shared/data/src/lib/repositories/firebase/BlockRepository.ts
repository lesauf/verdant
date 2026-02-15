import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from '@react-native-firebase/firestore';
import { Block } from 'domain/entities/Block';
import { firebaseDb } from 'infrastructure/config/firebase';
import { AppError } from 'infrastructure/errors/AppError';
import { BlockFirestoreModel, blockMapper } from '../../mappers/firebase/blockMapper';

/**
 * BlockRepository - Data access for Block entities using Firestore
 */
export class BlockRepository {
  private getCollectionPath(farmId: string) {
    return `farms/${farmId}/blocks`;
  }

  /**
   * Find all non-deleted blocks for a specific farm
   */
  async findAll(farmId: string): Promise<Block[]> {
    try {
      const q = query(
        collection(firebaseDb, this.getCollectionPath(farmId)), 
        where('isDeleted', '==', false)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => 
        blockMapper.toDomain({ id: doc.id, ...doc.data() } as BlockFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch blocks for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BlockRepository',
        'FETCH_BLOCKS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find block by ID within a farm
   */
  async findById(farmId: string, id: string): Promise<Block | null> {
    try {
      const docRef = doc(firebaseDb, this.getCollectionPath(farmId), id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists) return null;
      
      const data = { id: docSnap.id, ...docSnap.data() } as BlockFirestoreModel;
      if (data.isDeleted) return null;
      
      return blockMapper.toDomain(data);
    } catch (error) {
      throw new AppError(
        `Failed to fetch block ${id} in farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BlockRepository',
        'FETCH_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Save new block to a farm
   */
  async save(block: Block): Promise<Block> {
    try {
      if (!block.farmId) throw new Error('farmId is required to save a block');
      const data = blockMapper.toFirestore(block);
      const docRef = doc(firebaseDb, this.getCollectionPath(block.farmId), block.id);
      await setDoc(docRef, data);
      return block;
    } catch (error) {
      throw new AppError(
        `Failed to save block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BlockRepository',
        'SAVE_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update existing block
   */
  async update(block: Block): Promise<Block> {
    try {
      if (!block.farmId) throw new Error('farmId is required to update a block');
      const data = blockMapper.toFirestore(block);
      const docRef = doc(firebaseDb, this.getCollectionPath(block.farmId), block.id);
      await updateDoc(docRef, data as any);
      return block;
    } catch (error) {
      throw new AppError(
        `Failed to update block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BlockRepository',
        'UPDATE_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Soft delete block
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
        `Failed to delete block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BlockRepository',
        'DELETE_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
