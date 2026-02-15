import { FirebaseAuthTypes, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getContainer } from 'infrastructure/di/container';

interface AuthContextData {
    user: FirebaseAuthTypes.User | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Configure Google Sign-In
        GoogleSignin.configure({
            webClientId: '77155287508-l9iub27gd1uhrld2sk2bicgv103rojtn.apps.googleusercontent.com',
            offlineAccess: true,
        });

        const auth = getAuth();
        const subscriber = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Sync user to Firestore
                try {
                    const container = getContainer();
                    const syncUserUseCase = container.resolve('syncUserUseCase');
                    const userEntity = {
                        id: user.uid,
                        email: user.email || '',
                        displayName: user.displayName || '',
                        photoURL: user.photoURL || undefined,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    await syncUserUseCase.execute(userEntity);

                    // Check for and claim any pending invites
                    const claimMemberAccessUseCase = container.resolve('claimMemberAccessUseCase');
                    await claimMemberAccessUseCase.execute(userEntity);

                } catch (error) {
                    console.error('Failed to sync user profile or claim access:', error);
                }
            }
            setUser(user);
            setIsLoading(false);
        });
        return subscriber; // unsubscribe on unmount
    }, []);

    const signInWithGoogle = async () => {
        try {
            setIsLoading(true);
            await GoogleSignin.hasPlayServices();
            const { data } = await GoogleSignin.signIn();
            const idToken = data?.idToken;

            if (!idToken) {
                throw new Error('No ID token found');
            }

            const googleCredential = GoogleAuthProvider.credential(idToken);
            const auth = getAuth();
            await signInWithCredential(auth, googleCredential);
            // onAuthStateChanged will handle the sync
        } catch (error) {
            console.log('Google Sign-In Error:');
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOutUser = async () => {
        try {
            setIsLoading(true);
            await GoogleSignin.signOut();
            const auth = getAuth();
            await signOut(auth);
        } catch (error) {
            console.error('Sign-Out Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut: signOutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
