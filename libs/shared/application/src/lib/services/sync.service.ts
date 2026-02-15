/**
 * Sync Service
 * Handles conflict resolution for offline-first sync
 */
export class SyncService {
  /**
   * Resolve conflict between local and remote entity
   * Strategy: Latest timestamp wins
   */
  resolveConflict<T extends { updatedAt: Date }>(
    local: T,
    remote: T
  ): T {
    return local.updatedAt > remote.updatedAt ? local : remote;
  }

  /**
   * Check if entity needs syncing
   */
  needsSync(entity: { syncedAt: Date | null; updatedAt: Date }): boolean {
    return entity.syncedAt === null || entity.updatedAt > entity.syncedAt;
  }

  /**
   * Mark entity as synced
   */
  markAsSynced<T extends { syncedAt: Date | null }>(entity: T): T {
    entity.syncedAt = new Date();
    return entity;
  }
}
