import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type DocumentSnapshot,
  type QueryConstraint
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { CulturalEvent, FilterState, PublicationStatus } from '../types';
import { formatDateBadge, formatTimeDisplay } from '../utils/dateUtils';

export interface PaginatedEventsResult {
  events: CulturalEvent[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export class EventsRepository {
  private collectionName = 'events';

  /**
   * Serializes Firestore document data into a CulturalEvent object,
   * guaranteeing dynamic date badge and time display.
   */
  private mapDocToEvent(snap: DocumentSnapshot): CulturalEvent {
    const data = snap.data() || {};
    const startAt = data.startAt || new Date().toISOString();

    return {
      id: snap.id,
      ...data,
      startAt,
      // Compute dynamic timeDisplay & dateBadge if missing or if real date changed
      dateBadge: data.dateBadge || formatDateBadge(startAt),
      timeDisplay: data.timeDisplay || formatTimeDisplay(startAt),
    } as CulturalEvent;
  }

  /**
   * Fetches published and public events with query constraints matching Firestore compound indexes.
   */
  async getPublishedEvents(
    filters?: Partial<FilterState>,
    cursor?: DocumentSnapshot | null,
    pageSize: number = 30
  ): Promise<CulturalEvent[]> {
    if (!isFirebaseConfigured || !db) {
      return [];
    }

    try {
      const constraints: QueryConstraint[] = [
        where('publicationStatus', '==', 'published'),
        orderBy('startAt', 'asc'),
        limit(pageSize)
      ];

      // Add city filter if specified
      if (filters?.cityId && filters.cityId !== 'all') {
        constraints.unshift(where('cityId', '==', filters.cityId));
      }

      // Add category filter if specified
      if (filters?.categoryId && filters.categoryId !== 'all') {
        constraints.unshift(where('categoryId', '==', filters.categoryId));
      }

      // Pagination cursor
      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);

      let events: CulturalEvent[] = [];
      snapshot.forEach((snap) => {
        events.push(this.mapDocToEvent(snap));
      });

      // Price filter in-memory if free
      if (filters?.priceFilter === 'free') {
        events = events.filter(e => e.priceType === 'free');
      } else if (filters?.priceFilter === 'paid') {
        events = events.filter(e => e.priceType === 'paid');
      }

      // Client-side search query refinement (band, title, summary, venue)
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const queryTerm = filters.searchQuery.toLowerCase().trim();
        events = events.filter(e =>
          (e.title && e.title.toLowerCase().includes(queryTerm)) ||
          (e.summary && e.summary.toLowerCase().includes(queryTerm)) ||
          (e.venueName && e.venueName.toLowerCase().includes(queryTerm)) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(queryTerm)) ||
          (e.tags && e.tags.some(t => t.toLowerCase().includes(queryTerm)))
        );
      }

      return events;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
    }
  }

  /**
   * Fetches published events with full cursor-based pagination metadata
   */
  async getPaginatedPublishedEvents(
    filters?: Partial<FilterState>,
    cursor?: DocumentSnapshot | null,
    pageSize: number = 18
  ): Promise<PaginatedEventsResult> {
    if (!isFirebaseConfigured || !db) {
      return { events: [], lastDoc: null, hasMore: false };
    }

    try {
      const constraints: QueryConstraint[] = [
        where('publicationStatus', '==', 'published'),
        orderBy('startAt', 'asc'),
        limit(pageSize)
      ];

      if (filters?.cityId && filters.cityId !== 'all') {
        constraints.unshift(where('cityId', '==', filters.cityId));
      }
      if (filters?.categoryId && filters.categoryId !== 'all') {
        constraints.unshift(where('categoryId', '==', filters.categoryId));
      }
      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);

      const events: CulturalEvent[] = [];
      snapshot.forEach((snap) => {
        events.push(this.mapDocToEvent(snap));
      });

      const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      const hasMore = snapshot.docs.length === pageSize;

      return { events, lastDoc, hasMore };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
    }
  }

  /**
   * Fetches a single event by Firestore document ID
   */
  async getEventById(id: string): Promise<CulturalEvent | null> {
    if (!isFirebaseConfigured || !db || !id) return null;

    try {
      const snap = await getDoc(doc(db, this.collectionName, id));
      if (!snap.exists()) return null;
      return this.mapDocToEvent(snap);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/${id}`);
    }
  }

  /**
   * Fetches a single event by slug
   */
  async getEventBySlug(slug: string): Promise<CulturalEvent | null> {
    if (!isFirebaseConfigured || !db || !slug) return null;

    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return this.mapDocToEvent(snapshot.docs[0]);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/slug/${slug}`);
    }
  }

  /**
   * Fetches events for an organizer
   */
  async getEventsByOrganizer(organizerId: string): Promise<CulturalEvent[]> {
    if (!isFirebaseConfigured || !db || !organizerId) return [];

    try {
      const q = query(
        collection(db, this.collectionName),
        where('organizerId', '==', organizerId),
        orderBy('startAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const events: CulturalEvent[] = [];
      snapshot.forEach((snap) => {
        events.push(this.mapDocToEvent(snap));
      });
      return events;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `${this.collectionName}?organizer=${organizerId}`);
    }
  }

  /**
   * Fetches events pending moderation review
   */
  async getPendingReviewEvents(): Promise<CulturalEvent[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
      const q = query(
        collection(db, this.collectionName),
        where('publicationStatus', '==', 'pending_review'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const events: CulturalEvent[] = [];
      snapshot.forEach((snap) => {
        events.push(this.mapDocToEvent(snap));
      });
      return events;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `${this.collectionName}?status=pending_review`);
    }
  }

  /**
   * Creates a new event in Firestore
   */
  async createEvent(
    eventData: Omit<CulturalEvent, 'id' | 'createdAt' | 'updatedAt'>,
    authorUid?: string
  ): Promise<CulturalEvent> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firestore no está conectado.');
    }

    const now = new Date().toISOString();
    const cleanSlug = (eventData.slug || eventData.title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newEventPayload = {
      ...eventData,
      slug: cleanSlug,
      authorUid: authorUid || null,
      attendeesCount: 0,
      savesCount: 0,
      dateBadge: eventData.dateBadge || formatDateBadge(eventData.startAt),
      timeDisplay: eventData.timeDisplay || formatTimeDisplay(eventData.startAt),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      const docRef = await addDoc(collection(db, this.collectionName), newEventPayload);
      return {
        ...eventData,
        id: docRef.id,
        slug: cleanSlug,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, this.collectionName);
    }
  }

  /**
   * Updates an existing event document
   */
  async updateEvent(id: string, updates: Partial<CulturalEvent>): Promise<void> {
    if (!isFirebaseConfigured || !db || !id) throw new Error('Firestore no está conectado');

    try {
      const { id: _, createdAt: __, ...allowedUpdates } = updates;
      await updateDoc(doc(db, this.collectionName, id), {
        ...allowedUpdates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.collectionName}/${id}`);
    }
  }

  /**
   * Updates publication status (approval / rejection)
   */
  async updatePublicationStatus(
    id: string,
    status: PublicationStatus,
    rejectionReason?: string
  ): Promise<boolean> {
    if (!isFirebaseConfigured || !db || !id) throw new Error('Firestore no está conectado');

    try {
      const updates: Record<string, any> = {
        publicationStatus: status,
        updatedAt: Timestamp.now(),
      };

      if (status === 'published') {
        updates.verificationStatus = 'verified';
        updates.publishedAt = Timestamp.now();
        updates.rejectionReason = null;
      } else if (status === 'rejected') {
        updates.rejectionReason = rejectionReason || 'No cumple con las pautas de publicación.';
      }

      await updateDoc(doc(db, this.collectionName, id), updates);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.collectionName}/${id}`);
    }
  }

  /**
   * Deletes an event
   */
  async deleteEvent(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !id) return;
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.collectionName}/${id}`);
    }
  }
}

export const eventsRepository = new EventsRepository();
