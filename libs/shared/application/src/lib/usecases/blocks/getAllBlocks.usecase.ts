import { Block } from 'domain/entities/Block';
import { AppError } from 'infrastructure/errors/AppError';

import { BlockRepository } from 'data/repositories/firebase/BlockRepository';

export class GetAllBlocksUseCase {
  private blockRepository: BlockRepository;

  constructor({ blockRepository }: { blockRepository: BlockRepository }) {
    this.blockRepository = blockRepository;
  }

  async execute(farmId: string): Promise<Block[]> {
    try {
      return await this.blockRepository.findAll(farmId);
    } catch (error) {
      throw new AppError(
        `Failed to get blocks for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetAllBlocksUseCase',
        'GET_BLOCKS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
