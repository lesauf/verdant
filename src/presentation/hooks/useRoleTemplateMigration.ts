import { MigrateToRoleTemplatesUseCase } from '@/src/application/usecases/permissions/migrateToRoleTemplates.usecase';
import { getContainer } from '@/src/infrastructure/di/container';
import { useEffect, useState } from 'react';

/**
 * Hook to automatically migrate a farm to use role templates
 * Runs when the farm is first loaded or when switching farms
 */
export function useRoleTemplateMigration(farmId: string | null) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Reset migration status when farm changes
  useEffect(() => {
    setMigrationComplete(false);
  }, [farmId]);

  useEffect(() => {
    if (!farmId || migrationComplete) return;

    const runMigration = async () => {
      try {
        setIsMigrating(true);
        const container = getContainer();
        const migrateUseCase = container.resolve<MigrateToRoleTemplatesUseCase>('migrateToRoleTemplatesUseCase');

        // Check if migration is needed
        const status = await migrateUseCase.getMigrationStatus(farmId);
        
        if (!status.isMigrated) {
          console.log(`[Migration] Migrating farm ${farmId} to role templates...`);
          const result = await migrateUseCase.migrateFarm(farmId);
          
          if (result.success) {
            console.log(`[Migration] Successfully created ${result.templatesCreated} role templates for ${result.farmName}`);
          } else {
            console.error(`[Migration] Failed to migrate farm: ${result.error}`);
          }
        } else {
          console.log(`[Migration] Farm ${farmId} already has role templates (${status.templateCount} templates)`);
        }

        setMigrationComplete(true);
      } catch (error) {
        console.error('[Migration] Error during migration:', error);
      } finally {
        setIsMigrating(false);
      }
    };

    runMigration();
  }, [farmId, migrationComplete]);

  return { isMigrating, migrationComplete };
}
