import { Block, BlockStatus } from '../../../domain/entities/Block';
import { AppError } from '../../../infrastructure/errors/AppError';
import { ValidationService } from '../../services/validation.service';

import { BlockRepository } from '../../../data/repositories/firebase/BlockRepository';

export interface UpdateBlockInput {
  name?: string;
  areaHa?: number;
  status?: BlockStatus;
  geoJson?: any;
}

export class UpdateBlockUseCase {
  constructor(
    private blockRepository: BlockRepository,
    private validationService: ValidationService
  ) {}

  async execute(id: string, input: UpdateBlockInput): Promise<Block> {
    try {
      // Fetch existing block
      const block = await this.blockRepository.findById(id);
      if (!block) {
        throw new Error('Block not found');
      }

      // Apply updates with validation
      if (input.name !== undefined) {
        this.validationService.validateBlockName(input.name);
        block.name = input.name;
      }

      if (input.areaHa !== undefined) {
        this.validationService.validateArea(input.areaHa);
        block.areaHa = input.areaHa;
      }

      if (input.status !== undefined) {
        block.updateStatus(input.status);
      }

      if (input.geoJson !== undefined) {
        block.geoJson = input.geoJson;
      }

      // Update timestamp
      block.updatedAt = new Date();

      // Persist
      return await this.blockRepository.update(block);
    } catch (error) {
      throw new AppError(
        `Failed to update block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UpdateBlockUseCase',
        'UPDATE_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
