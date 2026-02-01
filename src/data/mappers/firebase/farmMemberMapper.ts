import { Timestamp } from '@react-native-firebase/firestore';
import { FarmMember, FarmRole } from '../../../domain/entities/Farm';

/**
 * Database model for Farm Member (from Firestore subcollection 'members')
 */
export interface FarmMemberFirestoreModel {
  userId: string;
  role: string;
  permissions: string[];
  joinedAt: Timestamp;
}

/**
 * Mapper: Domain Entity ↔ Firestore Model
 */
export const farmMemberMapper = {
  /**
   * Convert firestore document to domain entity
   */
  toDomain(data: FarmMemberFirestoreModel): FarmMember {
    return {
      userId: data.userId,
      role: data.role as FarmRole,
      permissions: data.permissions || [],
      joinedAt: data.joinedAt.toDate(),
    };
  },

  /**
   * Convert domain entity to firestore model data
   */
  toFirestore(domain: FarmMember): FarmMemberFirestoreModel {
    return {
      userId: domain.userId,
      role: domain.role,
      permissions: domain.permissions,
      joinedAt: Timestamp.fromDate(domain.joinedAt),
    };
  },
};
