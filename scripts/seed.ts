/**
 * Manual development seed script for ¿Y hoy?
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Populates Cloud Firestore collections:
 *   - cities
 *   - categories
 *   - organizers
 *   - events
 *
 * Safe & Idempotent: Uses setDoc with merge: true.
 * Never runs automatically in client application.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { CITIES, CATEGORIES, ORGANIZERS, INITIAL_EVENTS } from '../src/data/seedData';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('\n❌ ERROR: Firebase credentials missing in environment.');
  console.error('Please configure your .env file with:');
  console.error('  VITE_FIREBASE_API_KEY=...');
  console.error('  VITE_FIREBASE_AUTH_DOMAIN=...');
  console.error('  VITE_FIREBASE_PROJECT_ID=...');
  console.error('  VITE_FIREBASE_STORAGE_BUCKET=...');
  console.error('  VITE_FIREBASE_MESSAGING_SENDER_ID=...');
  console.error('  VITE_FIREBASE_APP_ID=...\n');
  process.exit(1);
}

console.log(`\n🌱 Starting seed for project: ${firebaseConfig.projectId} ...`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  try {
    // 1. Seed Cities
    console.log(`\n📍 Seeding ${CITIES.length} cities...`);
    for (const city of CITIES) {
      await setDoc(doc(db, 'cities', city.id), {
        ...city,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      console.log(`  ✓ City: ${city.name} (${city.province})`);
    }

    // 2. Seed Categories
    console.log(`\n🏷️ Seeding ${CATEGORIES.length} categories...`);
    for (const cat of CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), {
        ...cat,
        isActive: true,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      console.log(`  ✓ Category: ${cat.emoji} ${cat.name}`);
    }

    // 3. Seed Organizers
    console.log(`\n🏛️ Seeding ${ORGANIZERS.length} organizers...`);
    for (const org of ORGANIZERS) {
      await setDoc(doc(db, 'organizers', org.id), {
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

      await setDoc(doc(db, 'events', evt.id), {
        ...evt,
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
