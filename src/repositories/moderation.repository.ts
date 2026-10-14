import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../services/firebase/config';
import type { CulturalEvent, EventReport, ModerationQueueItem } from '../types';

export class ModerationRepository {
  private eventsCollection = 'events';
  private moderationQueueCollection = 'moderationQueue';
  private reportsCollection = 'eventReports';

  /**
   * Fetches events awaiting moderation review
   */
  async getPendingReviewEvents(): Promise<CulturalEvent[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
      const q = query(
        collection(db, this.eventsCollection),
        where('publicationStatus', '==', 'pending_review'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const events: CulturalEvent[] = [];
      snapshot.forEach((snap) => {
        events.push({ id: snap.id, ...snap.data() } as CulturalEvent);
      });
      return events;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `${this.eventsCollection}?status=pending_review`);
    }
  }

  /**
   * Approves an event for publication
   */
  async approveEvent(eventId: string, reviewerUid: string, notes?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    try {
      await updateDoc(doc(db, this.eventsCollection, eventId), {
        publicationStatus: 'published',
        verificationStatus: 'verified',
        publishedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Record in moderation queue
      await addDoc(collection(db, this.moderationQueueCollection), {
        eventId,
        submittedBy: reviewerUid,
        status: 'approved',
        notes: notes || 'Aprobado por el equipo curatorial',
        reviewedBy: reviewerUid,
        reviewedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.eventsCollection}/${eventId}`);
    }
  }

  /**
   * Rejects an event with a required justification reason
   */
  async rejectEvent(eventId: string, reason: string, reviewerUid: string): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    try {
      await updateDoc(doc(db, this.eventsCollection, eventId), {
        publicationStatus: 'rejected',
        rejectionReason: reason.trim(),
        updatedAt: Timestamp.now(),
      });

      // Record in moderation queue
      await addDoc(collection(db, this.moderationQueueCollection), {
        eventId,
        submittedBy: reviewerUid,
        status: 'rejected',
        notes: reason.trim(),
        reviewedBy: reviewerUid,
        reviewedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.eventsCollection}/${eventId}`);
    }
  }

  /**
   * Reports an issue with an event
   */
  async submitReport(report: Omit<EventReport, 'id' | 'createdAt'>): Promise<string> {
    if (!isFirebaseConfigured || !db) throw new Error('Firestore no está conectado');

    try {
      const docRef = await addDoc(collection(db, this.reportsCollection), {
        ...report,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, this.reportsCollection);
    }
  }
}

export const moderationRepository = new ModerationRepository();
