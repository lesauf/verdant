import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { Farm, FarmGeolocation } from '../../../domain/entities/Farm';
import { AppError } from '../../../infrastructure/errors/AppError';
import { IdService } from '../../services/id.service';

export interface CreateFarmInput {
  name: string;
  ownerId: string;
  location?: FarmGeolocation | null;
}

export class CreateFarmUseCase {
  private farmRepository: FarmRepository;
  private idService: IdService;

  constructor({ farmRepository, idService }: { farmRepository: FarmRepository; idService: IdService }) {
    this.farmRepository = farmRepository;
    this.idService = idService;
  }

  async execute(input: CreateFarmInput): Promise<Farm> {
    try {
      const now = new Date();
      const farm = new Farm({
        id: this.idService.generate(),
        name: input.name,
        ownerId: input.ownerId,
        location: input.location || null,
        createdAt: now,
        updatedAt: now,
        isDeleted: false
      });

      return await this.farmRepository.save(farm);
    } catch (error) {
      throw new AppError(
        `Failed to create farm: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CreateFarmUseCase',
        'CREATE_FARM_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
