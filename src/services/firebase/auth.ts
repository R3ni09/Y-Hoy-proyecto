import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  type Unsubscribe
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

export class FirebaseAuthService {
  private googleProvider = new GoogleAuthProvider();

  constructor() {
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

  getCurrentUser(): User | null {
    if (!isFirebaseConfigured || !auth) return null;
    return auth.currentUser;
  }

  async loginWithGoogle(): Promise<User> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication no está configurado. Verificá las variables de entorno VITE_FIREBASE_*.');
    }
    const result = await signInWithPopup(auth, this.googleProvider);
    return result.user;
  }

  async loginWithEmail(email: string, pass: string): Promise<User> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication no está configurado.');
    }
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return credential.user;
  }

  async registerWithEmail(email: string, pass: string, displayName: string): Promise<User> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication no está configurado.');
    }
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName) {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    }
    return credential.user;
  }

  async logout(): Promise<void> {
    if (!isFirebaseConfigured || !auth) return;
    await fbSignOut(auth);
  }

  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication no está configurado.');
    }
    await sendPasswordResetEmail(auth, email.trim());
  }

  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    if (!isFirebaseConfigured || !auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }
}

export const firebaseAuthService = new FirebaseAuthService();
