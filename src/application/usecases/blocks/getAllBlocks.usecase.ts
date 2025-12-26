import { Block } from '../../../domain/entities/Block';
import { AppError } from '../../../infrastructure/errors/AppError';

import { BlockRepository } from '../../../data/repositories/BlockRepository';

export class GetAllBlocksUseCase {
  constructor(private blockRepository: BlockRepository) {}

  async execute(): Promise<Block[]> {
    try {
      return await this.blockRepository.findAll();
    } catch (error) {
      throw new AppError(
        `Failed to get blocks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetAllBlocksUseCase',
        'GET_BLOCKS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
