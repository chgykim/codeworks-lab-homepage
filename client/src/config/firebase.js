import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "rustic-sage.firebaseapp.com",
  projectId: "rustic-sage",
  storageBucket: "rustic-sage.firebasestorage.app",
  messagingSenderId: "119948658294",
  appId: "1:119948658294:web:c2a75dd8ac27917c6ec157",
  measurementId: "G-FM65CZ1KVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Admin email
const ADMIN_EMAIL = 'chgykim0@gmail.com';

// Google Sign In
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Get ID token for server verification
    const idToken = await user.getIdToken();

    return {
      success: true,
      user: {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      },
      idToken,
      isAdmin: user.email === ADMIN_EMAIL
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Sign Out
export async function firebaseSignOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Get ID token for API calls
export async function getIdToken() {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

// Check if current user is admin
export function isCurrentUserAdmin() {
  const user = auth.currentUser;
  return user && user.email === ADMIN_EMAIL;
}

// Auth state observer
export function onAuthStateChange(callback) {
  return auth.onAuthStateChanged(callback);
}

export { auth, ADMIN_EMAIL };
