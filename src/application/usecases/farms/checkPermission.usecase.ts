import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { FarmRole } from '../../../domain/entities/Farm';
import { AppError } from '../../../infrastructure/errors/AppError';

export class CheckPermissionUseCase {
  private farmRepository: FarmRepository;

  constructor({ farmRepository }: { farmRepository: FarmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute(userId: string, farmId: string, requiredRole: FarmRole): Promise<boolean> {
    try {
      const members = await this.farmRepository.getMembers(farmId);
      const member = members.find(m => m.userId === userId);
      
      if (!member) return false;

      // Role hierarchy
      const roles: FarmRole[] = ['worker', 'manager', 'owner'];
      const userRoleIndex = roles.indexOf(member.role);
      const requiredRoleIndex = roles.indexOf(requiredRole);

      return userRoleIndex >= requiredRoleIndex;
    } catch (error) {
      throw new AppError(
        `Failed to check permission for user ${userId} on farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CheckPermissionUseCase',
        'CHECK_PERMISSION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
