import { Timestamp } from '@react-native-firebase/firestore';
import { User } from '../../../domain/entities/User';

export interface UserFirestoreModel {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const userMapper = {
    toDomain(firestoreModel: UserFirestoreModel): User {
        return {
            id: firestoreModel.id,
            email: firestoreModel.email,
            displayName: firestoreModel.displayName,
            photoURL: firestoreModel.photoURL,
            createdAt: firestoreModel.createdAt ? firestoreModel.createdAt.toDate() : new Date(),
            updatedAt: firestoreModel.updatedAt ? firestoreModel.updatedAt.toDate() : new Date(),
        };
    },

    toFirestore(domainModel: User): Omit<UserFirestoreModel, 'id'> {
        return {
            email: domainModel.email,
            displayName: domainModel.displayName,
            photoURL: domainModel.photoURL,
            createdAt: Timestamp.fromDate(domainModel.createdAt),
            updatedAt: Timestamp.fromDate(domainModel.updatedAt),
        };
    }
};
