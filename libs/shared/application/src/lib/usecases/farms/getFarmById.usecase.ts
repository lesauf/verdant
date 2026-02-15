import { FarmRepository } from 'data/repositories/firebase/FarmRepository';
import { Farm } from 'domain/entities/Farm';
import { AppError } from 'infrastructure/errors/AppError';

export class GetFarmByIdUseCase {
  private farmRepository: FarmRepository;

  constructor({ farmRepository }: { farmRepository: FarmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute(id: string): Promise<Farm | null> {
    try {
      return await this.farmRepository.findById(id);
    } catch (error) {
      throw new AppError(
        `Failed to get farm ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetFarmByIdUseCase',
        'GET_FARM_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
