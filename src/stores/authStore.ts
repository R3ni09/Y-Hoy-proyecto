import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile, UserRole } from '../types';
import { firebaseAuthService } from '../services/firebase/auth';
import { usersRepository } from '../repositories/users.repository';
import { favoritesRepository } from '../repositories/favorites.repository';
import { isFirebaseConfigured } from '../services/firebase/config';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const isLoading = ref<boolean>(true);
  const isFavoritesLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const favorites = ref<string[]>([]);

  const isAuthenticated = computed(() => Boolean(user.value));
  const userRole = computed<UserRole>(() => user.value?.role || 'user');
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'moderator');
  const isOrganizer = computed(() => user.value?.role === 'organizer' || user.value?.role === 'admin');

  /**
   * Loads user favorites directly from Firestore subcollection users/{uid}/favorites
   */
  async function loadUserFavorites(uid: string) {
    if (!uid) {
      favorites.value = [];
      return;
    }
    isFavoritesLoading.value = true;
    try {
      favorites.value = await favoritesRepository.getFavoriteIds(uid);
    } catch (err: any) {
      console.warn('Could not load user favorites from Firestore:', err);
      favorites.value = [];
    } finally {
      isFavoritesLoading.value = false;
    }
  }

  /**
   * Initializes auth state listener from Firebase Auth and syncs with Firestore users/{uid}
   */
  if (isFirebaseConfigured) {
    firebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      isLoading.value = true;
      if (firebaseUser) {
        try {
          // Fetch or initialize profile from Firestore
          let profile = await usersRepository.getUserProfile(firebaseUser.uid);
          if (!profile) {
            profile = await usersRepository.createUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Usuario Cultural',
              photoURL: firebaseUser.photoURL || undefined,
              preferredCityId: 'corrientes',
              preferredCategoryIds: ['musica', 'aire-libre'],
              role: firebaseUser.email === 'renatavillalba24@gmail.com' ? 'admin' : 'user',
            });
          }
          user.value = profile;
          await loadUserFavorites(firebaseUser.uid);
        } catch (err: any) {
          console.error('Error synchronizing user profile:', err);
          // Fallback minimal profile from Auth token
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Usuario Cultural',
            photoURL: firebaseUser.photoURL || undefined,
            preferredCityId: 'corrientes',
            preferredCategoryIds: ['musica'],
            role: firebaseUser.email === 'renatavillalba24@gmail.com' ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        user.value = null;
        favorites.value = [];
      }
      isLoading.value = false;
    });
  } else {
    isLoading.value = false;
  }

  async function loginWithGoogle() {
    isLoading.value = true;
    error.value = null;
    try {
      await firebaseAuthService.loginWithGoogle();
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión con Google';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loginWithEmail(email: string, pass: string) {
    isLoading.value = true;
    error.value = null;
    try {
      await firebaseAuthService.loginWithEmail(email, pass);
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión con correo';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function registerWithEmail(email: string, pass: string, displayName: string) {
    isLoading.value = true;
    error.value = null;
    try {
      await firebaseAuthService.registerWithEmail(email, pass, displayName);
    } catch (err: any) {
      error.value = err.message || 'Error al registrarse';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await firebaseAuthService.logout();
      user.value = null;
      favorites.value = [];
    } catch (err: any) {
      error.value = err.message || 'Error al cerrar sesión';
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(email: string) {
    error.value = null;
    await firebaseAuthService.resetPassword(email);
  }

  async function updateUserProfile(updates: Partial<UserProfile>) {
    if (!user.value?.uid) return;
    isLoading.value = true;
    try {
      await usersRepository.updateUserProfile(user.value.uid, updates);
      user.value = {
        ...user.value,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar perfil';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Toggles favorite status in Firestore users/{uid}/favorites/{eventId}
   */
  async function toggleFavorite(eventId: string) {
    if (!user.value) {
      throw new Error('Debés iniciar sesión para guardar eventos favoritos.');
    }

    const uid = user.value.uid;
    const isCurrentlySaved = favorites.value.includes(eventId);

    // Optimistic UI update
    if (isCurrentlySaved) {
      favorites.value = favorites.value.filter(id => id !== eventId);
    } else {
      favorites.value.push(eventId);
    }

    try {
      if (isCurrentlySaved) {
        await favoritesRepository.removeFavorite(uid, eventId);
      } else {
        await favoritesRepository.addFavorite(uid, eventId);
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

  return {
    user,
    isLoading,
    isFavoritesLoading,
    error,
    favorites,
    isAuthenticated,
    userRole,
    isAdmin,
    isOrganizer,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    resetPassword,
    updateUserProfile,
    toggleFavorite,
    isFavorite,
    loadUserFavorites
  };
});
