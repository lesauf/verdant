import { Block } from '../../../domain/entities/Block';
import { AppError } from '../../../infrastructure/errors/AppError';

interface IBlockRepository {
  findAll(): Promise<Block[]>;
}

export class GetAllBlocksUseCase {
  constructor(private blockRepository: IBlockRepository) {}

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
