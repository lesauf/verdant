import { UserRepository } from '../../../data/repositories/firebase/UserRepository';
import { User } from '../../../domain/entities/User';

export class SyncUserUseCase {
    private userRepository: UserRepository;

    constructor({ userRepository }: { userRepository: UserRepository }) {
        this.userRepository = userRepository;
    }

    async execute(user: User): Promise<void> {
        // Find existing user to preserve createdAt if exists
        const existingUser = await this.userRepository.findById(user.id);
        
        const userToSave: User = {
            ...user,
            createdAt: existingUser ? existingUser.createdAt : new Date(),
            updatedAt: new Date()
        };

        await this.userRepository.syncUser(userToSave);
    }
}
