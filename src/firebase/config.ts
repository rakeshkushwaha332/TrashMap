import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
// For development purposes only - replace with actual Firebase config in production
const firebaseConfig = {
    apiKey: "AIzaSyA-test-key-for-development-only",
    authDomain: "trashmap-dev.firebaseapp.com",
    projectId: "trashmap-dev",
    storageBucket: "trashmap-dev.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Setup local emulators for development
if (window.location.hostname === 'localhost') {
    try {
        // Auth emulator
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        
        // Firestore emulator
        connectFirestoreEmulator(db, 'localhost', 8080);
        
        // Storage emulator
        connectStorageEmulator(storage, 'localhost', 9199);
        
        // Functions emulator
        connectFunctionsEmulator(functions, 'localhost', 5001);
        
        console.log('Connected to Firebase emulators');
    } catch (error) {
        console.warn('Failed to connect to Firebase emulators, using production services', error);
    }
}

export { app, auth, db, storage, functions }; 