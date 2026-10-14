import { computed } from 'vue';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const authStore = useAuthStore();

  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isLoading = computed(() => authStore.isLoading);
  const userRole = computed(() => authStore.userRole);
  const isAdmin = computed(() => authStore.isAdmin);
  const isOrganizer = computed(() => authStore.isOrganizer);
  const error = computed(() => authStore.error);

  return {
    user,
    isAuthenticated,
    isLoading,
    userRole,
    isAdmin,
    isOrganizer,
    error,
    loginWithGoogle: authStore.loginWithGoogle,
    loginWithEmail: authStore.loginWithEmail,
    registerWithEmail: authStore.registerWithEmail,
    logout: authStore.logout,
    resetPassword: authStore.resetPassword,
    updateProfile: authStore.updateUserProfile,
  };
}
