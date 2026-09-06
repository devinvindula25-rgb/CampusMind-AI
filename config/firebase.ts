/**
 * CampusMind AI - Firebase Configuration
 *
 * IMPORTANT: Replace the placeholder values below with your actual
 * Firebase project configuration from the Firebase Console.
 * Go to: Firebase Console > Project Settings > General > Your apps > Web app
 */

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore - TS complains about getReactNativePersistence missing in firebase/auth types but it works at runtime in React Native
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDslgoTULXS39MepekXJHFsNf1GWFf-bMw',
  authDomain: 'campusmind-ai-980a2.firebaseapp.com',
  projectId: 'campusmind-ai-980a2',
  storageBucket: 'campusmind-ai-980a2.firebasestorage.app',
  messagingSenderId: '608970652129',
  appId: '1:608970652129:web:10b8a26342581dd2b2baa0',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth - use platform-specific persistence
let auth: ReturnType<typeof getAuth>;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // For native platforms, use AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
