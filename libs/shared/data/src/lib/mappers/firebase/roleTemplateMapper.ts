import { Timestamp } from '@react-native-firebase/firestore';
import { Permission } from 'domain/entities/Permission';
import { RoleTemplate } from 'domain/entities/RoleTemplate';

/**
 * Firestore model for RoleTemplate
 */
export interface RoleTemplateFirestoreModel {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  farmId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Mapper for converting between domain RoleTemplate and Firestore model
 */
export class RoleTemplateMapper {
  /**
   * Convert Firestore model to domain entity
   */
  static toDomain(data: RoleTemplateFirestoreModel): RoleTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      permissions: data.permissions as Permission[],
      isSystemRole: data.isSystemRole,
      farmId: data.farmId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  /**
   * Convert domain entity to Firestore model
   */
  static toFirestore(domain: RoleTemplate): RoleTemplateFirestoreModel {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      permissions: domain.permissions,
      isSystemRole: domain.isSystemRole,
      farmId: domain.farmId,
      createdAt: Timestamp.fromDate(domain.createdAt),
      updatedAt: Timestamp.fromDate(domain.updatedAt),
    };
  }

  /**
   * Convert partial domain entity to Firestore update data
   */
  static toFirestoreUpdate(
    domain: Partial<RoleTemplate>
  ): Partial<Omit<RoleTemplateFirestoreModel, 'id' | 'createdAt'>> {
    const update: Partial<Omit<RoleTemplateFirestoreModel, 'id' | 'createdAt'>> = {};

    if (domain.name !== undefined) update.name = domain.name;
    if (domain.description !== undefined) update.description = domain.description;
    if (domain.permissions !== undefined) update.permissions = domain.permissions;
    if (domain.isSystemRole !== undefined) update.isSystemRole = domain.isSystemRole;
    if (domain.farmId !== undefined) update.farmId = domain.farmId;
    
    // Always update the updatedAt timestamp
    update.updatedAt = Timestamp.fromDate(new Date());

    return update;
  }
}
