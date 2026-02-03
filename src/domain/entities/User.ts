/**
 * User Entity
 * Represents a registered user in the system.
 */
export interface User {
    id: string; // Firebase Auth UID
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}
