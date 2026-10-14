import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { Organizer } from '../types';

export class OrganizersRepository {
  private collectionName = 'organizers';

  async getOrganizers(cityId?: string): Promise<Organizer[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
      let q = query(collection(db, this.collectionName));
      if (cityId && cityId !== 'all') {
        q = query(collection(db, this.collectionName), where('cityId', '==', cityId));
      }

      const snapshot = await getDocs(q);
      const organizers: Organizer[] = [];
      snapshot.forEach((snap) => {
        organizers.push({ id: snap.id, ...snap.data() } as Organizer);
      });
      return organizers;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
    }
  }

  async getOrganizerById(id: string): Promise<Organizer | null> {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const snap = await getDoc(doc(db, this.collectionName, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Organizer;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/${id}`);
    }
  }

  async getOrganizersByOwner(userId: string): Promise<Organizer[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
      const q = query(
        collection(db, this.collectionName),
        where('ownerIds', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      const organizers: Organizer[] = [];
      snapshot.forEach((snap) => {
        organizers.push({ id: snap.id, ...snap.data() } as Organizer);
      });
      return organizers;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `${this.collectionName}?owner=${userId}`);
    }
  }

  async createOrganizer(data: Omit<Organizer, 'id' | 'createdAt'>, ownerUid: string): Promise<Organizer> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    const now = new Date().toISOString();
    const ownerIds = Array.from(new Set([...(data.ownerIds || []), ownerUid]));

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        ownerIds,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        ...data,
        id: docRef.id,
        ownerIds,
        createdAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, this.collectionName);
    }
  }

  async updateOrganizer(id: string, updates: Partial<Organizer>): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    try {
      await updateDoc(doc(db, this.collectionName, id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.collectionName}/${id}`);
    }
  }

  async saveOrganizer(organizer: Organizer): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');
    try {
      await setDoc(doc(db, this.collectionName, organizer.id), {
        ...organizer,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${this.collectionName}/${organizer.id}`);
    }
  }
}

export const organizersRepository = new OrganizersRepository();
