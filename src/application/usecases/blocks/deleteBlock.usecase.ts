import { AppError } from '../../../infrastructure/errors/AppError';

import { BlockRepository } from '../../../data/repositories/firebase/BlockRepository';

export class DeleteBlockUseCase {
  constructor(private blockRepository: BlockRepository) {}

  async execute(id: string): Promise<void> {
    try {
      // Verify block exists
      const block = await this.blockRepository.findById(id);
      if (!block) {
        throw new Error('Block not found');
      }

      // Soft delete (for sync)
      await this.blockRepository.delete(id);
    } catch (error) {
      throw new AppError(
        `Failed to delete block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DeleteBlockUseCase',
        'DELETE_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
