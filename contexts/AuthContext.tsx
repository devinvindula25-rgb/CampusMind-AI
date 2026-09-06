/**
 * CampusMind AI - Authentication Context
 * Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types';
import { UserRole } from '@/constants/theme';
import { seedAllData } from '@/services/seedFirestore';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as User;
            setUserProfile(profile);

            // Auto-seed on first login
            if (!(profile as any).isSeeded) {
              console.log('[Auth] First login detected — seeding data...');
              seedAllData(firebaseUser.uid).catch((e) =>
                console.warn('[Auth] Seed failed:', e)
              );
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, profile: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      const userProfile: User = {
        uid: credential.user.uid,
        email,
        name: profile.name || '',
        designation: profile.designation || '',
        department: profile.department || '',
        faculty: profile.faculty || '',
        role: (profile.role as UserRole) || 'qa_officer',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', credential.user.uid), userProfile);
      setUserProfile(userProfile);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (err: any) {
      setError('Failed to sign out');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, signIn, signUp, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'Authentication failed. Please try again';
  }
}
