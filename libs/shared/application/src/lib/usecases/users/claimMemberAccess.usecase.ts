import { collectionGroup, doc, getDocs, query, where, writeBatch } from '@react-native-firebase/firestore';
import { User } from 'domain/entities/User';
import { firebaseDb } from 'infrastructure/config/firebase';
import { AppError } from 'infrastructure/errors/AppError';

export class ClaimMemberAccessUseCase {
  async execute(user: User): Promise<void> {
    try {
        console.log('ClaimMemberAccess: Checking for pending invites for', user.email);
        
        // Find all farm member records where inviteEmail matches user's email
        // We use collectionGroup to search across all farms
        const membersQuery = query(
            collectionGroup(firebaseDb, 'members'),
            where('inviteEmail', '==', user.email),
            where('status', '==', 'pending')
        );

        const snapshot = await getDocs(membersQuery);

        if (snapshot.empty) {
            console.log('ClaimMemberAccess: No pending invites found.');
            return;
        }

        console.log(`ClaimMemberAccess: Found ${snapshot.size} pending invites. Claiming...`);

        const batch = writeBatch(firebaseDb);

        snapshot.docs.forEach((docSnap: any) => {
            const memberRef = docSnap.ref;
            
            // Update the member record:
            // 1. Set real userId
            // 2. Set status to active
            // 3. Remove inviteEmail (optional, or keep for history) -> keeping it is fine, but maybe mark claimed?
            // Actually, we need to be careful. The doc ID is usually the userId.
            // If the doc ID was a shadow ID, we might want to migrate it to the real UID to keep consistency.
            // Consistency rule: Member Doc ID = User ID.
            
            // So we should:
            // 1. Create NEW document with real UID.
            // 2. Delete OLD document (shadow ID).
            
            const data = docSnap.data();
            const farmRef = memberRef.parent.parent; // farms/{farmId}
            
            if (!farmRef) return;

            const newMemberRef = doc(firebaseDb, `${farmRef.path}/members/${user.id}`);
            
            batch.set(newMemberRef, {
                ...data,
                userId: user.id,
                status: 'active',
                displayName: user.displayName || data.displayName,
                // inviteEmail: user.email // Keep for record
            });

            batch.delete(memberRef);
        });

        await batch.commit();
        console.log('ClaimMemberAccess: Successfully claimed memberships.');

    } catch (error) {
        throw new AppError(
            `Failed to claim access for user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'ClaimMemberAccessUseCase',
            'CLAIM_ACCESS_ERROR',
            error instanceof Error ? error : undefined
        );
    }
  }
}
