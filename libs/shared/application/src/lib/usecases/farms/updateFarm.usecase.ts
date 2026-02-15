import { FarmRepository } from 'data/repositories/firebase/FarmRepository';
import { Farm } from 'domain/entities/Farm';
import { AppError } from 'infrastructure/errors/AppError';

export class UpdateFarmUseCase {
  private farmRepository: FarmRepository;

  constructor({ farmRepository }: { farmRepository: FarmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute(id: string, updates: Partial<Farm>): Promise<Farm> {
    try {
      const farm = await this.farmRepository.findById(id);
      if (!farm) {
        throw new Error('Farm not found');
      }

      if (updates.name !== undefined) farm.name = updates.name;
      if (updates.location !== undefined) farm.location = updates.location;
      
      farm.updatedAt = new Date();

      return await this.farmRepository.update(farm);
    } catch (error) {
      throw new AppError(
        `Failed to update farm ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UpdateFarmUseCase',
        'UPDATE_FARM_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
