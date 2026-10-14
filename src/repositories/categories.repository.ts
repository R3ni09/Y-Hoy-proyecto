import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { Category } from '../types';

export class CategoriesRepository {
  private collectionName = 'categories';

  /**
   * Fetches all active categories ordered by displayOrder
   */
  async getCategories(): Promise<Category[]> {
    if (!isFirebaseConfigured || !db) {
      return [];
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      const categories: Category[] = [];
      snapshot.forEach((snap) => {
        categories.push({ id: snap.id, ...snap.data() } as Category);
      });
      return categories;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
    }
  }

  /**
   * Fetches a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const first = snapshot.docs[0];
      return { id: first.id, ...first.data() } as Category;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/slug/${slug}`);
    }
  }

  /**
   * Admin: create or update category
   */
  async saveCategory(cat: Category): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');
    try {
      await setDoc(doc(db, this.collectionName, cat.id), {
        ...cat,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${this.collectionName}/${cat.id}`);
    }
  }
}

export const categoriesRepository = new CategoriesRepository();
