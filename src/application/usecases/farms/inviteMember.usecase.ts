import * as Crypto from 'expo-crypto';
import { FarmRepository } from '../../../data/repositories/firebase/FarmRepository';
import { UserRepository } from '../../../data/repositories/firebase/UserRepository';
import { FarmMember, FarmRole } from '../../../domain/entities/Farm';
import { AppError } from '../../../infrastructure/errors/AppError';

export class InviteMemberUseCase {
  private farmRepository: FarmRepository;
  private userRepository: UserRepository;

  constructor({ farmRepository, userRepository }: { 
    farmRepository: FarmRepository;
    userRepository: UserRepository;
  }) {
    this.farmRepository = farmRepository;
    this.userRepository = userRepository;
  }

  async execute(params: {
    farmId: string;
    email: string;
    role: FarmRole;
    invitedByUserId: string;
  }): Promise<void> {
    const { farmId, email, role, invitedByUserId } = params;

    // 1. Verify permissions (Basic check: is user a member? Real RBAC is TODO)
    const members = await this.farmRepository.getMembers(farmId);
    const currentUserMember = members.find(m => m.userId === invitedByUserId);

    if (!currentUserMember || (currentUserMember.role !== 'owner' && currentUserMember.role !== 'manager')) {
       throw new AppError(
        'You do not have permission to invite members.',
        'InviteMemberUseCase',
        'PERMISSION_DENIED'
       );
    }

    // 2. Check if user already exists in the system
    const existingUser = await this.userRepository.findByEmail(email);

    let newMember: FarmMember;

    if (existingUser) {
        // Real Member
        // Check if already a member of this farm
        if (members.some(m => m.userId === existingUser.id)) {
            throw new AppError(
                'User is already a member of this farm.',
                'InviteMemberUseCase',
                'ALREADY_MEMBER'
            );
        }

        newMember = {
            userId: existingUser.id,
            role,
            permissions: [], // Default permissions based on role can be set here
            joinedAt: new Date(),
            status: 'active',
            displayName: existingUser.displayName
        };
    } else {
        // Shadow Member
        // Check if already invited (by email)
        if (members.some(m => m.inviteEmail === email)) {
             throw new AppError(
                'User has already been invited.',
                'InviteMemberUseCase',
                'ALREADY_INVITED'
            );
        }

        const shadowId = `shadow_${Crypto.randomUUID()}`;
        
        newMember = {
            userId: shadowId,
            role,
            permissions: [],
            joinedAt: new Date(),
            status: 'pending',
            inviteEmail: email,
            displayName: email.split('@')[0] // Default display name from email
        };
    }

    // 3. Add to Farm
    await this.farmRepository.addMember(farmId, newMember);
  }
}
