import { computed } from 'vue';
import { useAuthStore } from '../stores/authStore';

export function useFavorites() {
  const authStore = useAuthStore();

  const favorites = computed(() => authStore.favorites);
  const isLoading = computed(() => authStore.isFavoritesLoading);

  function isFavorite(eventId: string): boolean {
    return authStore.isFavorite(eventId);
  }

  async function toggleFavorite(eventId: string): Promise<void> {
    await authStore.toggleFavorite(eventId);
  }

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
  };
}
