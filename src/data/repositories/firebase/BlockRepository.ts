import { Block } from '../../../domain/entities/Block';
import { firebaseDb } from '../../../infrastructure/config/firebase';
import { AppError } from '../../../infrastructure/errors/AppError';
import { BlockFirestoreModel, blockMapper } from '../../mappers/firebase/blockMapper';

/**
 * BlockRepository - Data access for Block entities using Firestore
 */
export class BlockRepository {
  private collection = firebaseDb.collection('blocks');

  /**
   * Find all non-deleted blocks
   */
  async findAll(): Promise<Block[]> {
    try {
      const snapshot = await this.collection
        .where('isDeleted', '==', false)
        .get();
      
      return snapshot.docs.map(doc => 
        blockMapper.toDomain({ id: doc.id, ...doc.data() } as BlockFirestoreModel)
      );
    } catch (error) {
      throw new AppError(
        `Failed to fetch blocks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BlockRepository',
        'FETCH_BLOCKS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find block by ID
   */
  async findById(id: string): Promise<Block | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      
      const data = { id: doc.id, ...doc.data() } as BlockFirestoreModel;
      if (data.isDeleted) return null;
      
      return blockMapper.toDomain(data);
    } catch (error) {
      throw new AppError(
        `Failed to fetch block ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BlockRepository',
        'FETCH_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Save new block
   */
  async save(block: Block): Promise<Block> {
    try {
      const data = blockMapper.toFirestore(block);
      await this.collection.doc(block.id).set(data);
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
      const data = blockMapper.toFirestore(block);
      await this.collection.doc(block.id).update(data);
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
  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).update({
        isDeleted: true,
        updatedAt: new Date() // Firestore doc update expects Date or Timestamp
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
