import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { Venue } from '../types';

export class VenuesRepository {
  private collectionName = 'venues';

  async getVenues(cityId?: string): Promise<Venue[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
      let q = query(collection(db, this.collectionName));
      if (cityId && cityId !== 'all') {
        q = query(collection(db, this.collectionName), where('cityId', '==', cityId));
      }

      const snapshot = await getDocs(q);
      const venues: Venue[] = [];
      snapshot.forEach((snap) => {
        venues.push({ id: snap.id, ...snap.data() } as Venue);
      });
      return venues;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
    }
  }

  async getVenueById(id: string): Promise<Venue | null> {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const snap = await getDoc(doc(db, this.collectionName, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Venue;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/${id}`);
    }
  }

  async createVenue(venueData: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venue> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    const now = new Date().toISOString();
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...venueData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        ...venueData,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, this.collectionName);
    }
  }

  async saveVenue(venue: Venue): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');
    try {
      await setDoc(doc(db, this.collectionName, venue.id), {
        ...venue,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${this.collectionName}/${venue.id}`);
    }
  }
}

export const venuesRepository = new VenuesRepository();
