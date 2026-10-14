import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  setDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { City } from '../types';

export class CitiesRepository {
  private collectionName = 'cities';

  async getCities(): Promise<City[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      const cities: City[] = [];
      snapshot.forEach((snap) => {
        cities.push({ id: snap.id, ...snap.data() } as City);
      });
      return cities;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
    }
  }

  async getCityById(id: string): Promise<City | null> {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const snap = await getDoc(doc(db, this.collectionName, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as City;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/${id}`);
    }
  }

  async saveCity(city: City): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');
    try {
      await setDoc(doc(db, this.collectionName, city.id), city, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${this.collectionName}/${city.id}`);
    }
  }
}

export const citiesRepository = new CitiesRepository();
