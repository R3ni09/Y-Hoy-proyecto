/**
 * Seed script for ¿Y hoy? — Cloud Firestore via the Admin SDK.
 *
 * Why Admin SDK? The web client no longer has Firebase Auth (Spark plan uses
 * only Hosting + Firestore), so the client SDK cannot pass the security rules
 * for writes. The Admin SDK bypasses rules and is the supported way to seed.
 *
 * Setup:
 *   1. Firebase console > Project settings > Service accounts
 *      > "Generate new private key" and save it as ./serviceAccount.json
 *   2. Add to your .env:
 *        GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
 *   3. Run:
 *        npx tsx scripts/seed.ts
 *
 * Populates Cloud Firestore collections:
 *   - cities
 *   - categories
 *   - organizers
 *   - events
 *
 * Safe & idempotent: uses setDoc with merge: true.
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { CITIES, CATEGORIES, ORGANIZERS, INITIAL_EVENTS } from '../src/data/seedData';

dotenv.config();

const projectId = process.env.FIRESTORE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'y-hoy-efe60';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('\n❌ ERROR: Missing GOOGLE_APPLICATION_CREDENTIALS.');
  console.error('Generate a service account key from the Firebase console');
  console.error('(Project settings > Service accounts > Generate new private key),');
  console.error('save it as ./serviceAccount.json and add to your .env:');
  console.error('  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json\n');
  process.exit(1);
}

console.log(`\n🌱 Starting seed for Firestore project: ${projectId} ...`);

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});
const db = getFirestore(app);

async function seed() {
  try {
    // 1. Seed Cities
    console.log(`\n📍 Seeding ${CITIES.length} cities...`);
    for (const city of CITIES) {
      await db.collection('cities').doc(city.id).set({
        ...city,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      console.log(`  ✓ City: ${city.name} (${city.province})`);
    }

    // 2. Seed Categories
    console.log(`\n🏷️ Seeding ${CATEGORIES.length} categories...`);
    for (const cat of CATEGORIES) {
      await db.collection('categories').doc(cat.id).set({
        ...cat,
        isActive: true,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      console.log(`  ✓ Category: ${cat.emoji} ${cat.name}`);
    }

    // 3. Seed Organizers
    console.log(`\n🏛️ Seeding ${ORGANIZERS.length} organizers...`);
    for (const org of ORGANIZERS) {
      await db.collection('organizers').doc(org.id).set({
        ...org,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      console.log(`  ✓ Organizer: ${org.name}`);
    }

    // 4. Seed Events (with dates dynamically relative to current date)
    console.log(`\n📅 Seeding ${INITIAL_EVENTS.length} events...`);
    const now = new Date();

    for (let i = 0; i < INITIAL_EVENTS.length; i++) {
      const evt = INITIAL_EVENTS[i];

      // Distribute dates: some today, some tomorrow, some this weekend, some next week
      const eventDate = new Date(now);
      if (i % 4 === 0) {
        eventDate.setHours(21, 0, 0, 0); // Today 21:00
      } else if (i % 4 === 1) {
        eventDate.setDate(now.getDate() + 1); // Tomorrow
        eventDate.setHours(19, 30, 0, 0);
      } else if (i % 4 === 2) {
        eventDate.setDate(now.getDate() + 3); // Weekend
        eventDate.setHours(18, 0, 0, 0);
      } else {
        eventDate.setDate(now.getDate() + 7); // Next week
        eventDate.setHours(20, 0, 0, 0);
      }

      const isoStart = eventDate.toISOString();
      const { id: eventId, ...eventPayload } = evt;

      await db.collection('events').doc(eventId).set({
        ...eventPayload,
        startAt: isoStart,
        publicationStatus: 'published',
        verificationStatus: 'verified',
        isSeedDemo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      console.log(`  ✓ Event: ${evt.title.slice(0, 45)}...`);
    }

    console.log('\n✨ Database seed completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed with error:', err);
    process.exit(1);
  }
}

seed();
