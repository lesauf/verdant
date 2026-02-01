import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { Farm } from '../../../domain/entities/Farm';
import { AppError } from '../../../infrastructure/errors/AppError';

export class GetFarmsForUserUseCase {
  private farmRepository: FarmRepository;

  constructor({ farmRepository }: { farmRepository: FarmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute(userId: string): Promise<Farm[]> {
    try {
      return await this.farmRepository.findAllForUser(userId);
    } catch (error) {
      throw new AppError(
        `Failed to get farms for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetFarmsForUserUseCase',
        'GET_FARMS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
