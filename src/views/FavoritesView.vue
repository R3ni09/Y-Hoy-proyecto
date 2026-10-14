<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { favoritesRepository } from '../repositories/favorites.repository';
import type { CulturalEvent } from '../types';
import EventCard from '../components/events/EventCard.vue';
import { Bookmark, Compass, AlertCircle } from 'lucide-vue-next';

const userStore = useUserStore();

const savedEvents = ref<CulturalEvent[]>([]);
const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);

async function loadFavorites() {
  if (!userStore.visitorId) {
    savedEvents.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;
  try {
    savedEvents.value = await favoritesRepository.getFavoriteEvents(userStore.visitorId);
  } catch (err: any) {
    errorMessage.value = err.message || 'Error al cargar los planes guardados desde Firestore.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadFavorites();
});

// Re-load when the favorite IDs change
watch(() => userStore.favorites, () => {
  loadFavorites();
}, { deep: true });
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
    <div class="mb-8">
      <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <router-link to="/" class="hover:text-white">Inicio</router-link>
        <span>/</span>
        <span class="text-[#FFC69D]">Mis planes guardados</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight flex items-center gap-3">
        <span>Guardados</span>
        <span class="text-sm px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFC69D] font-normal">
          {{ savedEvents.length }}
        </span>
      </h1>
      <p class="text-sm text-gray-400 mt-1">
        Tus actividades y recitales favoritos, sincronizados en Cloud Firestore para este dispositivo.
      </p>
    </div>

    <!-- Error State -->
    <div v-if="errorMessage" class="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-center max-w-md mx-auto space-y-3">
      <AlertCircle class="w-8 h-8 text-red-400 mx-auto" />
      <p class="text-xs sm:text-sm text-red-200">{{ errorMessage }}</p>
      <button
        @click="loadFavorites"
        class="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
      >
        Reintentar
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-else-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      <div v-for="n in 3" :key="n" class="h-80 rounded-2xl bg-white/5 border border-white/5"></div>
    </div>

    <!-- Grid of saved events -->
    <div v-else-if="savedEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCard
        v-for="event in savedEvents"
        :key="event.id"
        :event="event"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 px-6 rounded-3xl bg-[#181B23] border border-white/10 max-w-md mx-auto">
      <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#FFC69D]">
        <Bookmark class="w-6 h-6" />
      </div>
      <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">No tenés eventos guardados</h3>
      <p class="text-xs sm:text-sm text-gray-400 mt-2">
        Hacé clic en el ícono de marcador en cualquier tarjeta de evento para armar tu itinerario cultural.
      </p>
      <router-link
        to="/explorar"
        class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC69D] text-[#172B46] text-xs font-bold hover:bg-[#FFDCC4] transition-all"
      >
        <Compass class="w-4 h-4" />
        <span>Descubrir planes ahora</span>
      </router-link>
    </div>
  </div>
</template>
