import { Block, BlockStatus } from '../../../domain/entities/Block';
import { AppError } from '../../../infrastructure/errors/AppError';
import { IdService } from '../../services/id.service';
import { ValidationService } from '../../services/validation.service';

// Note: BlockRepository will be implemented in Week 3
// For now we use a placeholder interface
interface IBlockRepository {
  save(block: Block): Promise<Block>;
}

export interface CreateBlockInput {
  name: string;
  areaHa: number;
  status: BlockStatus;
  geoJson?: any;
}

export class CreateBlockUseCase {
  constructor(
    private blockRepository: IBlockRepository,
    private idService: IdService,
    private validationService: ValidationService
  ) {}

  async execute(input: CreateBlockInput): Promise<Block> {
    try {
      // Validation using shared service
      this.validationService.validateBlockName(input.name);
      this.validationService.validateArea(input.areaHa);

      // Create domain entity
      const block = new Block({
        id: this.idService.generate(),
        name: input.name,
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
