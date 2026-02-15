/**
 * ID Generation Service
 * Generates unique IDs for entities
 */
export class IdService {
  /**
   * Generate a unique ID
   * Format: timestamp-random
   */
  generate(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a UUID v4 (for future use)
   */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
