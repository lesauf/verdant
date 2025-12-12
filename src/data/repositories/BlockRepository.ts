import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../../db/client';
import { blocks } from '../../../db/schema';
import { Block } from '../../domain/entities/Block';
import { blockMapper } from '../mappers/blockMapper';

/**
 * BlockRepository - Data access for Block entities
 * Handles SQLite persistence and sync queue
 */
export class BlockRepository {
  /**
   * Find all non-deleted blocks
   */
  async findAll(): Promise<Block[]> {
    const rows = await db
      .select()
      .from(blocks)
      .where(eq(blocks.isDeleted, false));
    
    return rows.map(row => blockMapper.toDomain({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      syncedAt: row.syncedAt ? row.syncedAt.toISOString() : null,
      isDeleted: row.isDeleted ? 1 : 0,
    }));
  }

  /**
   * Find block by ID
   */
  async findById(id: string): Promise<Block | null> {
    const rows = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, id), eq(blocks.isDeleted, false)));
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return blockMapper.toDomain({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      syncedAt: row.syncedAt ? row.syncedAt.toISOString() : null,
      isDeleted: row.isDeleted ? 1 : 0,
    });
  }

  /**
   * Save new block
   */
  async save(block: Block): Promise<Block> {
    const dbModel = blockMapper.toDatabase(block);
    
    await db.insert(blocks).values({
      id: dbModel.id,
      name: dbModel.name,
      areaHa: dbModel.areaHa,
      status: dbModel.status,
      geoJson: dbModel.geoJson,
      createdAt: new Date(dbModel.createdAt),
      updatedAt: new Date(dbModel.updatedAt),
      syncedAt: dbModel.syncedAt ? new Date(dbModel.syncedAt) : null,
      isDeleted: Boolean(dbModel.isDeleted),
    });

    // TODO: Queue for sync
    
    return block;
  }

  /**
   * Update existing block
   */
  async update(block: Block): Promise<Block> {
    const dbModel = blockMapper.toDatabase(block);
    
    await db
      .update(blocks)
      .set({
        name: dbModel.name,
        areaHa: dbModel.areaHa,
        status: dbModel.status,
        geoJson: dbModel.geoJson,
        updatedAt: new Date(dbModel.updatedAt),
      })
      .where(eq(blocks.id, block.id));

    // TODO: Queue for sync
    
    return block;
  }

  /**
   * Soft delete block
   */
  async delete(id: string): Promise<void> {
    await db
      .update(blocks)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(blocks.id, id));

    // TODO: Queue for sync
  }

  /**
   * Find blocks that need syncing
   */
  async findUnsynced(): Promise<Block[]> {
    const rows = await db
      .select()
      .from(blocks)
      .where(isNull(blocks.syncedAt));
    
    return rows.map(row => blockMapper.toDomain({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      syncedAt: row.syncedAt ? row.syncedAt.toISOString() : null,
      isDeleted: row.isDeleted ? 1 : 0,
    }));
  }
}
