import { Block } from '../../../domain/entities/Block';
import { AppError } from '../../../infrastructure/errors/AppError';

import { BlockRepository } from '../../../data/repositories/BlockRepository';

export class GetBlockByIdUseCase {
  constructor(private blockRepository: BlockRepository) {}

  async execute(id: string): Promise<Block> {
    try {
      const block = await this.blockRepository.findById(id);
      if (!block) {
        throw new Error('Block not found');
      }
      return block;
    } catch (error) {
      throw new AppError(
        `Failed to get block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetBlockByIdUseCase',
        'GET_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
