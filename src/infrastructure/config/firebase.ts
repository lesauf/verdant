import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

/**
 * Firebase initialization and exported services
 * Using @react-native-firebase which picks up config from native files
 */

// Configure Firestore offline persistence
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

export const firebaseAuth = auth();
export const firebaseDb = firestore();
export const firebaseStorage = storage();

export default {
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
};
