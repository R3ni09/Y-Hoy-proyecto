<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEventsStore } from '../stores/eventsStore';
import { useCityStore } from '../stores/cityStore';
import EventCard from '../components/events/EventCard.vue';
import {
  Search,
  X,
  MapPin,
  RotateCcw,
  AlertCircle,
  RefreshCw
} from 'lucide-vue-next';

const route = useRoute();
const eventsStore = useEventsStore();
const cityStore = useCityStore();

onMounted(async () => {
  if (route.query.price === 'free') {
    eventsStore.filters.priceFilter = 'free';
  }
  if (route.query.date) {
    eventsStore.filters.dateFilter = route.query.date as any;
  }
  if (route.query.city) {
    eventsStore.filters.cityId = route.query.city as string;
  }
  await Promise.all([
    eventsStore.fetchCategories(),
    eventsStore.fetchPublishedEvents(),
    cityStore.fetchCities()
  ]);
});

watch(() => route.query, () => {
  if (route.query.price === 'free') {
    eventsStore.setFilter('priceFilter', 'free');
  }
});

function handleCategoryClick(categoryId: string) {
  if (eventsStore.filters.categoryId === categoryId) {
    eventsStore.setFilter('categoryId', 'all');
  } else {
    eventsStore.setFilter('categoryId', categoryId);
  }
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
    <!-- Header with Breadcrumb and Stats -->
    <div class="mb-6">
      <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <router-link to="/" class="hover:text-white">Inicio</router-link>
        <span>/</span>
        <span class="text-[#FFC69D]">Explorar cartelera</span>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            Explorar actividades y eventos
          </h1>
          <p class="text-sm text-gray-400 mt-1">
            {{ eventsStore.activeEventsCount }} experiencias encontradas en la base de datos oficial
          </p>
        </div>

        <!-- Reset filters button if any active -->
        <button
          v-if="eventsStore.filters.categoryId !== 'all' || eventsStore.filters.priceFilter !== 'all' || eventsStore.filters.dateFilter !== 'all' || eventsStore.filters.searchQuery || eventsStore.filters.cityId !== 'all'"
          @click="eventsStore.resetFilters"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#FFC69D] border border-white/10 transition-colors self-start sm:self-auto"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restablecer filtros</span>
        </button>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="eventsStore.error" class="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-between text-xs text-red-200">
      <div class="flex items-center gap-2.5">
        <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
        <span>{{ eventsStore.error }}</span>
      </div>
      <button
        @click="eventsStore.fetchPublishedEvents"
        class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1"
      >
        <RefreshCw class="w-3 h-3" />
        <span>Reintentar</span>
      </button>
    </div>

    <!-- Progressive Filter Bar -->
    <div class="p-4 rounded-2xl glass-panel flex flex-col gap-4 mb-8">
      <!-- Search Input + Dynamic City Filter Row -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="flex-1 w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#FFC69D]/40 focus-within:bg-white/10 transition-colors">
          <Search class="w-4 h-4 text-gray-400 shrink-0" />
          <input
            v-model="eventsStore.filters.searchQuery"
            @input="eventsStore.fetchPublishedEvents"
            type="text"
            placeholder="Buscar por banda, teatro, lugar o tema..."
            class="w-full bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
          />
          <button
            v-if="eventsStore.filters.searchQuery"
            @click="eventsStore.setFilter('searchQuery', '')"
            class="text-gray-400 hover:text-white"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Dynamic City Dropdown from Firestore -->
        <div class="w-full sm:w-auto relative">
          <select
            v-model="eventsStore.filters.cityId"
            @change="eventsStore.fetchPublishedEvents"
            class="w-full appearance-none px-4 py-2.5 rounded-xl bg-[#181B23] hover:bg-[#20242e] border border-white/10 text-xs sm:text-sm text-white cursor-pointer focus:outline-none pr-8 transition-colors"
          >
            <option value="all">Toda la región</option>
            <option
              v-for="city in cityStore.cities"
              :key="city.id"
              :value="city.id"
            >
              {{ city.name }} ({{ city.province }})
            </option>
          </select>
          <MapPin class="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <!-- Quick Date & Price Filter Pills -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <!-- Date Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            @click="eventsStore.setFilter('dateFilter', 'all')"
            class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            :class="eventsStore.filters.dateFilter === 'all' ? 'bg-[#FFC69D] text-[#172B46] font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'"
          >
            Todos los días
          </button>
          <button
            @click="eventsStore.setFilter('dateFilter', 'today')"
            class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            :class="eventsStore.filters.dateFilter === 'today' ? 'bg-[#FFC69D] text-[#172B46] font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'"
          >
            Hoy
          </button>
          <button
            @click="eventsStore.setFilter('dateFilter', 'weekend')"
            class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            :class="eventsStore.filters.dateFilter === 'weekend' ? 'bg-[#FFC69D] text-[#172B46] font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'"
          >
            Fin de semana
          </button>
        </div>

        <!-- Price Pills -->
        <div class="flex items-center gap-1.5">
          <button
            @click="eventsStore.setFilter('priceFilter', 'all')"
            class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            :class="eventsStore.filters.priceFilter === 'all' ? 'bg-white/20 text-white font-semibold' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
          >
            Cualquier precio
          </button>
          <button
            @click="eventsStore.setFilter('priceFilter', 'free')"
            class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            :class="eventsStore.filters.priceFilter === 'free' ? 'bg-[#006751] text-[#91E3C7] font-bold' : 'bg-white/5 text-[#91E3C7] hover:bg-white/10'"
          >
            Gratis únicamente
          </button>
        </div>
      </div>

      <!-- Categories Ribbon (populated from Firestore) -->
      <div v-if="eventsStore.categories.length > 0" class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-white/5">
        <button
          v-for="cat in eventsStore.categories"
          :key="cat.id"
          @click="handleCategoryClick(cat.id)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
          :class="eventsStore.filters.categoryId === cat.id ? 'bg-white/20 text-white border border-white/30 font-semibold shadow-sm' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'"
        >
          <span>{{ cat.emoji }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="eventsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      <div v-for="n in 6" :key="n" class="h-80 rounded-2xl bg-white/5 border border-white/5"></div>
    </div>

    <div v-else-if="eventsStore.events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      <EventCard
        v-for="event in eventsStore.events"
        :key="event.id"
        :event="event"
      />
    </div>

    <!-- Empty Search Results -->
    <div v-else class="text-center py-20 px-6 rounded-3xl bg-[#181B23] border border-white/10 max-w-lg mx-auto">
      <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#FFC69D]">
        <Search class="w-6 h-6" />
      </div>
      <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">No se encontraron eventos</h3>
      <p class="text-xs sm:text-sm text-gray-400 mt-2">
        Probá cambiando los términos de búsqueda o quitando algunos filtros aplicados.
      </p>
      <button
        @click="eventsStore.resetFilters"
        class="mt-5 px-5 py-2.5 rounded-xl bg-[#FFC69D] text-[#172B46] text-xs font-bold hover:bg-[#FFDCC4] transition-all"
      >
        Limpiar todos los filtros
      </button>
    </div>
  </div>
</template>
