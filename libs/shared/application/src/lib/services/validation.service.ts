/**
 * Validation Service
 * Shared validation logic for use cases
 */
export class ValidationService {
  /**
   * Validate block name
   */
  validateBlockName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Block name is required');
    }
    if (name.length > 100) {
      throw new Error('Block name must be less than 100 characters');
    }
  }

  /**
   * Validate block area
   */
  validateArea(areaHa: number): void {
    if (areaHa <= 0) {
      throw new Error('Area must be greater than zero');
    }
    if (areaHa > 10000) {
      throw new Error('Area is too large (max 10,000 hectares)');
    }
  }

  /**
   * Validate task title
   */
  validateTaskTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    if (title.length > 200) {
      throw new Error('Task title must be less than 200 characters');
    }
  }

  /**
   * Validate date range
   */
  validateDateRange(startDate: Date | null, dueDate: Date | null): void {
    if (startDate && dueDate && startDate > dueDate) {
      throw new Error('Start date cannot be after due date');
    }
  }
}
