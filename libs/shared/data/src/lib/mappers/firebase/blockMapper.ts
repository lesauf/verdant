import { Timestamp } from '@react-native-firebase/firestore';
import { Block } from 'domain/entities/Block';

/**
 * Database model for Block (from Firestore)
 */
export interface BlockFirestoreModel {
  id: string;
  name: string;
  farmId: string;
  areaHa: number;
  status: string;
  geoJson: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  syncedAt: Timestamp | null;
  isDeleted: boolean;
}

/**
 * Mapper: Domain Entity ↔ Firestore Model
 */
export const blockMapper = {
  /**
   * Convert firestore document to domain entity
   */
  toDomain(data: BlockFirestoreModel): Block {
    return new Block({
      id: data.id,
      name: data.name,
      farmId: data.farmId,
      areaHa: data.areaHa,
      status: data.status as any,
      geoJson: data.geoJson ? JSON.parse(data.geoJson) : null,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      syncedAt: data.syncedAt ? data.syncedAt.toDate() : null,
      isDeleted: data.isDeleted
    });
  },

  /**
   * Convert domain entity to firestore model data
   */
  toFirestore(domain: Block): Omit<BlockFirestoreModel, 'id'> {
    return {
      name: domain.name,
      farmId: domain.farmId,
      areaHa: domain.areaHa,
      status: domain.status,
      geoJson: domain.geoJson ? JSON.stringify(domain.geoJson) : null,
      createdAt: Timestamp.fromDate(domain.createdAt),
      updatedAt: Timestamp.fromDate(domain.updatedAt),
      syncedAt: domain.syncedAt ? Timestamp.fromDate(domain.syncedAt) : null,
      isDeleted: domain.isDeleted,
    };
  },
};
