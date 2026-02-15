import { Timestamp } from '@react-native-firebase/firestore';
import { FarmMember, FarmRole } from 'domain/entities/Farm';

/**
 * Database model for Farm Member (from Firestore subcollection 'members')
 */
export interface FarmMemberFirestoreModel {
  userId: string;
  role: string;
  permissions: string[];
  joinedAt: Timestamp;
  inviteEmail?: string;
  displayName?: string;
  status?: string; // 'active' | 'pending'
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
      inviteEmail: data.inviteEmail,
      displayName: data.displayName,
      status: (data.status as 'active' | 'pending') || 'active', // Default to active for backward compatibility
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
      inviteEmail: domain.inviteEmail,
      displayName: domain.displayName,
      status: domain.status,
    };
  },
};
