import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile } from '../types';
import { usersRepository } from '../repositories/users.repository';
import { favoritesRepository } from '../repositories/favorites.repository';
import { isFirebaseConfigured } from '../services/firebase/config';
import { getVisitorId, isCurationUnlocked, setCurationUnlocked } from '../services/visitor/visitor';

/**
 * Local visitor session — replacement for the old Firebase-Auth-backed authStore.
 *
 * Identity = a random visitorId kept in localStorage. The profile and the
 * favorites subcollection live in Cloud Firestore under users/{visitorId}.
 * Curation mode (moderation panel) unlocks with the VITE_ADMIN_KEY passcode.
 */
export const useUserStore = defineStore('user', () => {
  const visitorId = getVisitorId();

  const user = ref<UserProfile | null>(null);
  const isLoading = ref<boolean>(true);
  const isFavoritesLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const favorites = ref<string[]>([]);
  const isCurator = ref<boolean>(isCurationUnlocked());

  const isReady = computed(() => Boolean(user.value));
  const displayName = computed(() => user.value?.displayName || 'Visitante Cultural');

  function buildLocalProfile(): UserProfile {
    const now = new Date().toISOString();
    return {
      uid: visitorId,
      displayName: 'Visitante Cultural',
      preferredCityId: 'corrientes',
      preferredCategoryIds: ['musica', 'aire-libre'],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Loads visitor favorites from Firestore subcollection users/{visitorId}/favorites
   */
  async function loadUserFavorites() {
    isFavoritesLoading.value = true;
    try {
      favorites.value = await favoritesRepository.getFavoriteIds(visitorId);
    } catch (err: any) {
      console.warn('Could not load visitor favorites from Firestore:', err);
      favorites.value = [];
    } finally {
      isFavoritesLoading.value = false;
    }
  }

  /**
   * Fetches (or creates) the visitor profile in Firestore and loads favorites.
   */
  async function initialize() {
    if (!isFirebaseConfigured) {
      user.value = buildLocalProfile();
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    try {
      let profile = await usersRepository.getUserProfile(visitorId);
      if (!profile) {
        profile = await usersRepository.createUserProfile({
          uid: visitorId,
          displayName: 'Visitante Cultural',
          preferredCityId: 'corrientes',
          preferredCategoryIds: ['musica', 'aire-libre'],
        });
      }
      user.value = profile;
      await loadUserFavorites();
    } catch (err: any) {
      console.warn('No se pudo sincronizar el perfil del visitante con Firestore. Usando perfil local:', err?.message || err);
      user.value = buildLocalProfile();
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUserProfile(updates: Partial<UserProfile>) {
    if (!user.value) return;
    isLoading.value = true;
    error.value = null;
    try {
      await usersRepository.updateUserProfile(visitorId, updates);
      user.value = {
        ...user.value,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el perfil';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Toggles favorite status in Firestore users/{visitorId}/favorites/{eventId}
   */
  async function toggleFavorite(eventId: string) {
    if (!eventId) return;

    const isCurrentlySaved = favorites.value.includes(eventId);

    // Optimistic UI update
    if (isCurrentlySaved) {
      favorites.value = favorites.value.filter(id => id !== eventId);
    } else {
      favorites.value.push(eventId);
    }

    try {
      if (isCurrentlySaved) {
        await favoritesRepository.removeFavorite(visitorId, eventId);
      } else {
        await favoritesRepository.addFavorite(visitorId, eventId);
      }
    } catch (err) {
      // Revert optimistic update on error
      if (isCurrentlySaved) {
        favorites.value.push(eventId);
      } else {
        favorites.value = favorites.value.filter(id => id !== eventId);
      }
      console.error('Error toggling favorite in Firestore:', err);
      throw err;
    }
  }

  function isFavorite(eventId: string): boolean {
    return favorites.value.includes(eventId);
  }

  /**
   * Unlocks the curation/moderation mode with the passcode from VITE_ADMIN_KEY.
   * Demo-grade only: the key travels in the client bundle.
   */
  function unlockCuration(key: string): boolean {
    const expected = (import.meta.env.VITE_ADMIN_KEY as string | undefined) || '';
    if (!expected) {
      throw new Error('La clave de curaduría no está configurada. Definí VITE_ADMIN_KEY en tu archivo .env.');
    }
    const ok = key.trim() === expected;
    isCurator.value = ok;
    setCurationUnlocked(ok);
    return ok;
  }

  function lockCuration() {
    isCurator.value = false;
    setCurationUnlocked(false);
  }

  // Auto-initialize on first use (mirrors the old auth state listener pattern)
  initialize();

  return {
    visitorId,
    user,
    isLoading,
    isFavoritesLoading,
    error,
    favorites,
    isCurator,
    isReady,
    displayName,
    updateUserProfile,
    toggleFavorite,
    isFavorite,
    loadUserFavorites,
    unlockCuration,
    lockCuration,
  };
});
