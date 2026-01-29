import { Block } from '../../../domain/entities/Block';

/**
 * Database model for Block (from SQLite)
 */
interface BlockDbModel {
  id: string;
  name: string;
  areaHa: number;
  status: string;
  geoJson: string | null;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  isDeleted: number; // SQLite uses 0/1 for boolean
}

/**
 * Mapper: Domain Entity ↔ Database Model
 */
export const blockMapper = {
  /**
   * Convert database row to domain entity
   */
  toDomain(db: BlockDbModel): Block {
    return new Block({
      id: db.id,
      name: db.name,
      areaHa: db.areaHa,
      status: db.status as any,
      geoJson: db.geoJson ? JSON.parse(db.geoJson) : null,
      createdAt: new Date(db.createdAt),
      updatedAt: new Date(db.updatedAt),
      syncedAt: db.syncedAt ? new Date(db.syncedAt) : null,
      isDeleted: db.isDeleted === 1
    });
  },

  /**
   * Convert domain entity to database model
   */
  toDatabase(domain: Block): BlockDbModel {
    return {
      id: domain.id,
      name: domain.name,
      areaHa: domain.areaHa,
      status: domain.status,
      geoJson: domain.geoJson ? JSON.stringify(domain.geoJson) : null,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
      syncedAt: domain.syncedAt ? domain.syncedAt.toISOString() : null,
      isDeleted: domain.isDeleted ? 1 : 0,
    };
  },
};
