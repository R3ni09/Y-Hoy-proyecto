import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  documentId,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { CulturalEvent } from '../types';

export class FavoritesRepository {
  /**
   * Subcollection strategy: users/{userId}/favorites/{eventId}
   */
  private getFavoritesCollection(userId: string) {
    if (!db) throw new Error('Firestore no está disponible');
    return collection(db, 'users', userId, 'favorites');
  }

  async getFavoriteIds(userId: string): Promise<string[]> {
    if (!isFirebaseConfigured || !db || !userId) return [];

    try {
      const q = query(
        this.getFavoritesCollection(userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const ids: string[] = [];
      snapshot.forEach((snap) => {
        ids.push(snap.id);
      });
      return ids;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/favorites`);
    }
  }

  async isFavorite(userId: string, eventId: string): Promise<boolean> {
    if (!isFirebaseConfigured || !db || !userId || !eventId) return false;

    try {
      const snap = await getDoc(doc(db, 'users', userId, 'favorites', eventId));
      return snap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/favorites/${eventId}`);
    }
  }

  async addFavorite(userId: string, eventId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !userId || !eventId) {
      throw new Error('Usuario o evento no válido');
    }

    try {
      await setDoc(doc(db, 'users', userId, 'favorites', eventId), {
        eventId,
        userId,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/favorites/${eventId}`);
    }
  }

  async removeFavorite(userId: string, eventId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !userId || !eventId) return;

    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/favorites/${eventId}`);
    }
  }

  /**
   * Retrieves full CulturalEvent objects for the user's favorites
   */
  async getFavoriteEvents(userId: string): Promise<CulturalEvent[]> {
    const favoriteIds = await this.getFavoriteIds(userId);
    if (favoriteIds.length === 0 || !db) return [];

    // Firestore `where(documentId(), 'in', ...)` supports up to 30 items per query
    const results: CulturalEvent[] = [];
    const chunks: string[][] = [];
    for (let i = 0; i < favoriteIds.length; i += 30) {
      chunks.push(favoriteIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      try {
        const q = query(collection(db, 'events'), where(documentId(), 'in', chunk));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          results.push({ id: d.id, ...d.data() } as CulturalEvent);
        });
      } catch (err) {
        console.warn('Error fetching favorite event batch:', err);
      }
    }

    // Preserve recency order matching favoriteIds
    return results.sort((a, b) => favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id));
  }
}

export const favoritesRepository = new FavoritesRepository();
