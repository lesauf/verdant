import { Timestamp } from '@react-native-firebase/firestore';
import { Farm, FarmGeolocation } from 'domain/entities/Farm';

/**
 * Database model for Farm (from Firestore)
 */
export interface FarmFirestoreModel {
  id: string;
  name: string;
  ownerId: string;
  location: { latitude: number; longitude: number } | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted: boolean;
}

/**
 * Mapper: Domain Entity ↔ Firestore Model
 */
export const farmMapper = {
  /**
   * Convert firestore document to domain entity
   */
  toDomain(data: FarmFirestoreModel): Farm {
    return new Farm({
      id: data.id,
      name: data.name,
      ownerId: data.ownerId,
      location: data.location as FarmGeolocation | null,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      isDeleted: data.isDeleted
    });
  },

  /**
   * Convert domain entity to firestore model data
   */
  toFirestore(domain: Farm): Omit<FarmFirestoreModel, 'id'> {
    return {
      name: domain.name,
      ownerId: domain.ownerId,
      location: domain.location ? {
        latitude: domain.location.latitude,
        longitude: domain.location.longitude
      } : null,
      createdAt: Timestamp.fromDate(domain.createdAt),
      updatedAt: Timestamp.fromDate(domain.updatedAt),
      isDeleted: domain.isDeleted,
    };
  },
};
