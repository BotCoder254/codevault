// @ts-nocheck
import { writable } from 'svelte/store';
import { auth, db, googleProvider, githubProvider } from '../firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const user = writable(null);
export const loading = writable(true);

// Initialize auth state listener
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    user.set({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      ...userData
    });
  } else {
    user.set(null);
  }
  loading.set(false);
});

export const signUp = async (email, password, displayName) => {
  try {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await firebaseUpdateProfile(firebaseUser, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      displayName,
      email,
      createdAt: new Date(),
      username: displayName.toLowerCase().replace(/\s+/g, ''),
      role: 'user'
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || 'user',
        role: 'user'
      });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithGithub = async () => {
  try {
    const { user: firebaseUser } = await signInWithPopup(auth, githubProvider);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || 'user',
        role: 'user'
      });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateProfile = async (updates) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    // Update Firebase Auth profile
    await firebaseUpdateProfile(currentUser, updates);
    
    // Update user store
    user.update(current => ({
      ...current,
      ...updates
    }));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};