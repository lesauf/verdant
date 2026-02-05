import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from '@react-native-firebase/firestore';
import { RoleTemplate } from '../../../domain/entities/RoleTemplate';
import { firebaseDb } from '../../../infrastructure/config/firebase';
import { AppError } from '../../../infrastructure/errors/AppError';
import { RoleTemplateFirestoreModel, RoleTemplateMapper } from '../../mappers/firebase/roleTemplateMapper';

/**
 * Repository for managing RoleTemplate entities in Firestore
 */
export class RoleTemplateRepository {
  private readonly collectionName = 'roleTemplates';

  /**
   * Get the collection reference for a specific farm
   */
  private getFarmCollection(farmId: string) {
    return collection(firebaseDb, 'farms', farmId, this.collectionName);
  }

  /**
   * Find all role templates for a farm
   */
  async findByFarmId(farmId: string): Promise<RoleTemplate[]> {
    try {
      const collectionRef = this.getFarmCollection(farmId);
      const snapshot = await getDocs(collectionRef);

      return snapshot.docs.map((doc: any) => {
        const data = doc.data() as RoleTemplateFirestoreModel;
        return RoleTemplateMapper.toDomain({ ...data, id: doc.id });
      });
    } catch (error) {
      throw new AppError(
        `Failed to fetch role templates for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RoleTemplateRepository',
        'FETCH_ROLE_TEMPLATES_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find a role template by ID
   */
  async findById(farmId: string, templateId: string): Promise<RoleTemplate | null> {
    try {
      const docRef = doc(firebaseDb, 'farms', farmId, this.collectionName, templateId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data() as RoleTemplateFirestoreModel;
      return RoleTemplateMapper.toDomain({ ...data, id: snapshot.id });
    } catch (error) {
      throw new AppError(
        `Failed to fetch role template ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RoleTemplateRepository',
        'FETCH_ROLE_TEMPLATE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Create a new role template
   */
  async create(farmId: string, template: Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleTemplate> {
    try {
      const docRef = doc(this.getFarmCollection(farmId));
      const now = new Date();

      const newTemplate: RoleTemplate = {
        ...template,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };

      const firestoreData = RoleTemplateMapper.toFirestore(newTemplate);
      await setDoc(docRef, firestoreData);

      return newTemplate;
    } catch (error) {
      throw new AppError(
        `Failed to create role template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RoleTemplateRepository',
        'CREATE_ROLE_TEMPLATE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update an existing role template
   */
  async update(farmId: string, templateId: string, updates: Partial<RoleTemplate>): Promise<void> {
    try {
      const docRef = doc(firebaseDb, 'farms', farmId, this.collectionName, templateId);
      const updateData = RoleTemplateMapper.toFirestoreUpdate(updates);

      await updateDoc(docRef, updateData);
    } catch (error) {
      throw new AppError(
        `Failed to update role template ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RoleTemplateRepository',
        'UPDATE_ROLE_TEMPLATE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete a role template
   */
  async delete(farmId: string, templateId: string): Promise<void> {
    try {
      const docRef = doc(firebaseDb, 'farms', farmId, this.collectionName, templateId);
      await deleteDoc(docRef);
    } catch (error) {
      throw new AppError(
        `Failed to delete role template ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RoleTemplateRepository',
        'DELETE_ROLE_TEMPLATE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find a role template by name within a farm
   */
  async findByName(farmId: string, name: string): Promise<RoleTemplate | null> {
    try {
      const collectionRef = this.getFarmCollection(farmId);
      const q = query(collectionRef, where('name', '==', name));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data() as RoleTemplateFirestoreModel;
      return RoleTemplateMapper.toDomain({ ...data, id: doc.id });
    } catch (error) {
      throw new AppError(
        `Failed to find role template by name ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RoleTemplateRepository',
        'FIND_ROLE_TEMPLATE_BY_NAME_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
