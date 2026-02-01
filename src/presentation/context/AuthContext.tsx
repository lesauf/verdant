import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

        const subscriber = auth().onAuthStateChanged((user) => {
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

            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
        } catch (error) {
            console.log('Google Sign-In Error:');
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setIsLoading(true);
            await GoogleSignin.signOut();
            await auth().signOut();
        } catch (error) {
            console.error('Sign-Out Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
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
