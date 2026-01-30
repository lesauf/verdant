import { getApps, initializeApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import firestore, { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

/**
 * Firebase initialization and exported services
 * Using modern modular API to resolve deprecation warnings
 */

const firebaseConfig = {
  apiKey: "AIzaSyBa0POD4ogrG6HeBb-0Di573h_d-OA-Mkc",
  appId: "1:77155287508:android:87933f7c706fd87c3b9641",
  projectId: "verdant-e6185",
  databaseURL: "https://verdant-e6185.firebaseio.com",
  storageBucket: "verdant-e6185.firebasestorage.app",
  messagingSenderId: "77155287508",
};

// Ensure Firebase is initialized
const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

// Initialize Firestore (Functional approach)
// Cast to any to resolve transient lint error where initializeApp return type 
// is sometimes seen as a Union with Promise in some build environments
export const firebaseDb = getFirestore(app as any);

// Configure Firestore settings
firebaseDb.settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

export const firebaseAuth = getAuth(app as any);
export const firebaseStorage = getStorage(app as any);

export default {
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
};
