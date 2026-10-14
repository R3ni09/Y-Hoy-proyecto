/**
 * Local visitor identity — replacement for Firebase Authentication.
 *
 * The app only uses Hosting + Cloud Firestore (Spark plan), so there is no
 * server-verifiable identity. Instead, each browser gets a random, unguessable
 * visitorId (crypto.randomUUID) persisted in localStorage. That id is used as
 * the document key for the visitor profile and favorites subcollection in
 * Firestore (users/{visitorId}/favorites/{eventId}).
 *
 * The "curation mode" (moderation panel) is unlocked with a simple passcode
 * from VITE_ADMIN_KEY; the unlocked state lives in sessionStorage so it
 * survives navigation but not browser restarts.
 */

const VISITOR_ID_STORAGE_KEY = 'yhoy:visitorId';
const ADMIN_UNLOCK_STORAGE_KEY = 'yhoy:adminUnlocked';

function generateVisitorId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `vis_${crypto.randomUUID()}`;
  }
  return `vis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Returns the local visitor id, creating it on first use.
 */
export function getVisitorId(): string {
  if (typeof localStorage === 'undefined') return 'vis_anonymous';
  let id = localStorage.getItem(VISITOR_ID_STORAGE_KEY);
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem(VISITOR_ID_STORAGE_KEY, id);
  }
  return id;
}

/**
 * Whether the curation/moderation mode was unlocked with the admin passcode.
 */
export function isCurationUnlocked(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_UNLOCK_STORAGE_KEY) === 'true';
}

/**
 * Persists or clears the curation unlock state.
 */
export function setCurationUnlocked(unlocked: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  if (unlocked) {
    sessionStorage.setItem(ADMIN_UNLOCK_STORAGE_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_UNLOCK_STORAGE_KEY);
  }
}
