import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { UserProfile } from '../types';

export class UsersRepository {
  private collectionName = 'users';

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured || !db || !uid) return null;

    try {
      const snap = await getDoc(doc(db, this.collectionName, uid));
      if (!snap.exists()) return null;
      return { uid: snap.id, ...snap.data() } as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/${uid}`);
    }
  }

  async createUserProfile(profile: Partial<UserProfile> & { uid: string; email: string }): Promise<UserProfile> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    const now = new Date().toISOString();
    const fullProfile: UserProfile = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName || 'Usuario Cultural',
      photoURL: profile.photoURL || undefined,
      preferredCityId: profile.preferredCityId || 'corrientes',
      preferredCategoryIds: profile.preferredCategoryIds || ['musica', 'aire-libre'],
      role: profile.role || (profile.email === 'renatavillalba24@gmail.com' ? 'admin' : 'user'),
      status: 'active',
      preferences: profile.preferences || {
        notifyNewEvents: true,
        receiveNewsletter: false,
        theme: 'dark'
      },
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, this.collectionName, profile.uid), {
        ...fullProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      return fullProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${this.collectionName}/${profile.uid}`);
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!isFirebaseConfigured || !db || !uid) throw new Error('Firestore no está conectado');

    try {
      const { uid: _, role: __, createdAt: ___, ...allowedUpdates } = updates;
      await updateDoc(doc(db, this.collectionName, uid), {
        ...allowedUpdates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.collectionName}/${uid}`);
    }
  }
}

export const usersRepository = new UsersRepository();
