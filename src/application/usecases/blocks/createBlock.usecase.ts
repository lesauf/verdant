import { Block, BlockStatus } from '../../../domain/entities/Block';
import { AppError } from '../../../infrastructure/errors/AppError';
import { IdService } from '../../services/id.service';
import { ValidationService } from '../../services/validation.service';

import { BlockRepository } from '../../../data/repositories/firebase/BlockRepository';

export interface CreateBlockInput {
  name: string;
  farmId: string;
  areaHa: number;
  status: BlockStatus;
  geoJson?: any;
}

export class CreateBlockUseCase {
  private blockRepository: BlockRepository;
  private idService: IdService;
  private validationService: ValidationService;

  constructor({ 
    blockRepository, 
    idService, 
    validationService 
  }: { 
    blockRepository: BlockRepository; 
    idService: IdService; 
    validationService: ValidationService; 
  }) {
    this.blockRepository = blockRepository;
    this.idService = idService;
    this.validationService = validationService;
  }

  async execute(input: CreateBlockInput): Promise<Block> {
    try {
      // Validation using shared service
      this.validationService.validateBlockName(input.name);
      this.validationService.validateArea(input.areaHa);
      if (!input.farmId) throw new Error('farmId is required');

      // Create domain entity
      const block = new Block({
        id: this.idService.generate(),
        name: input.name,
        farmId: input.farmId,
        areaHa: input.areaHa,
        status: input.status,
        geoJson: input.geoJson || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedAt: null,
        isDeleted: false
      });

      // Persist through repository
      return await this.blockRepository.save(block);
    } catch (error) {
      throw new AppError(
        `Failed to create block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CreateBlockUseCase',
        'CREATE_BLOCK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
