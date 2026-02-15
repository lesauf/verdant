import { FarmRepository } from 'data/repositories/firebase/FarmRepository';
import { RoleTemplateRepository } from 'data/repositories/firebase/RoleTemplateRepository';
import { FarmMember } from 'domain/entities/Farm';
import { AppError } from 'infrastructure/errors/AppError';

interface UpdateMemberRoleInput {
  farmId: string;
  userId: string;
  roleTemplateId: string;
}

/**
 * Use case for updating a member's role template assignment
 */
export class UpdateMemberRoleUseCase {
  private farmRepository: FarmRepository;
  private roleTemplateRepository: RoleTemplateRepository;

  constructor({
    farmRepository,
    roleTemplateRepository,
  }: {
    farmRepository: FarmRepository;
    roleTemplateRepository: RoleTemplateRepository;
  }) {
    this.farmRepository = farmRepository;
    this.roleTemplateRepository = roleTemplateRepository;
  }

  async execute(input: UpdateMemberRoleInput): Promise<void> {
    try {
      // Verify the role template exists
      const template = await this.roleTemplateRepository.findById(input.farmId, input.roleTemplateId);
      if (!template) {
        throw new AppError(
          `Role template ${input.roleTemplateId} not found`,
          'UpdateMemberRoleUseCase',
          'TEMPLATE_NOT_FOUND'
        );
      }

      // Get current members
      const members = await this.farmRepository.getMembers(input.farmId);
      const member = members.find(m => m.userId === input.userId);
      
      if (!member) {
        throw new AppError(
          `Member ${input.userId} not found in farm ${input.farmId}`,
          'UpdateMemberRoleUseCase',
          'MEMBER_NOT_FOUND'
        );
      }

      // Update member's role to reference the template ID
      const updatedMember: FarmMember = {
        ...member,
        role: input.roleTemplateId as any, // Store template ID in role field
      };

      await this.farmRepository.addMember(input.farmId, updatedMember);
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        `Failed to update member role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UpdateMemberRoleUseCase',
        'UPDATE_MEMBER_ROLE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
