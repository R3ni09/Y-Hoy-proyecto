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

  /**
   * Creates (or merges) the local visitor profile in Firestore.
   * No Firebase Auth: `uid` is the locally generated visitorId.
   */
  async createUserProfile(profile: Partial<UserProfile> & { uid: string }): Promise<UserProfile> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    const now = new Date().toISOString();
    const fullProfile: UserProfile = {
      uid: profile.uid,
      displayName: profile.displayName || 'Visitante Cultural',
      preferredCityId: profile.preferredCityId || 'corrientes',
      preferredCategoryIds: profile.preferredCategoryIds || ['musica', 'aire-libre'],
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
      const { uid: _, createdAt: __, ...allowedUpdates } = updates;
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
