import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseAuth } from '../../infrastructure/config/firebase';
import { AppError } from '../../infrastructure/errors/AppError';

/**
 * Service for handling Firebase Authentication
 */
export class AuthService {
  /**
   * Get currently signed in user
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return firebaseAuth.currentUser;
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, pass: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await firebaseAuth.createUserWithEmailAndPassword(email, pass);
    } catch (error) {
      throw new AppError(
        `Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AuthService',
        'AUTH_SIGNUP_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, pass: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await firebaseAuth.signInWithEmailAndPassword(email, pass);
    } catch (error) {
      throw new AppError(
        `Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AuthService',
        'AUTH_SIGNIN_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      throw new AppError(
        `Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AuthService',
        'AUTH_SIGNOUT_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return firebaseAuth.onAuthStateChanged(callback);
  }
}
