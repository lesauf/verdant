import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { FarmMember, FarmRole } from '../../../domain/entities/Farm';
import { AppError } from '../../../infrastructure/errors/AppError';

export interface AddMemberInput {
  farmId: string;
  userId: string;
  role: FarmRole;
  permissions?: string[];
}

export class ManageMembersUseCase {
  private farmRepository: FarmRepository;

  constructor({ farmRepository }: { farmRepository: FarmRepository }) {
    this.farmRepository = farmRepository;
  }

  async addMember(input: AddMemberInput): Promise<void> {
    try {
      const member: FarmMember = {
        userId: input.userId,
        role: input.role,
        permissions: input.permissions || [],
        joinedAt: new Date(),
        status: 'active',
      };
      
      await this.farmRepository.addMember(input.farmId, member);
    } catch (error) {
      throw new AppError(
        `Failed to add member to farm ${input.farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ManageMembersUseCase',
        'ADD_MEMBER_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getMembers(farmId: string): Promise<FarmMember[]> {
    try {
      return await this.farmRepository.getMembers(farmId);
    } catch (error) {
       throw new AppError(
        `Failed to get members for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ManageMembersUseCase',
        'GET_MEMBERS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
