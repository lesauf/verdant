import auth, {
    FirebaseAuthTypes,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from '@react-native-firebase/auth';
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
      return await createUserWithEmailAndPassword(firebaseAuth, email, pass);
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
      return await signInWithEmailAndPassword(firebaseAuth, email, pass);
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
   * Sign in with Google
   */
  async signInWithGoogle(idToken: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Use the generic signInWithCredential method from the modular API 
      // or just call it on the auth object if using namespaced
      return await auth().signInWithCredential(googleCredential);
    } catch (error) {
      throw new AppError(
        `Google sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AuthService',
        'AUTH_GOOGLE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(firebaseAuth);
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
    return onAuthStateChanged(firebaseAuth, callback);
  }
}
