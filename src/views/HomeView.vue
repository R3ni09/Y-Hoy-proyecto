<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEventsStore } from '../stores/eventsStore';
import { useCityStore } from '../stores/cityStore';
import EventCard from '../components/events/EventCard.vue';
import { isToday, isThisWeekend, isUpcoming } from '../utils/dateUtils';
import {
  Search,
  Calendar,
  ArrowRight,
  Sparkles,
  Ticket,
  AlertCircle,
  RefreshCw
} from 'lucide-vue-next';

const router = useRouter();
const eventsStore = useEventsStore();
const cityStore = useCityStore();

// Search state in Hero
const searchQuery = ref('');
const selectedDate = ref<'all' | 'today' | 'weekend'>('all');
const activeTab = ref<'all' | 'today' | 'weekend' | 'upcoming'>('today');

onMounted(async () => {
  await eventsStore.fetchPublishedEvents();
});

function handleSearchSubmit() {
  eventsStore.setFilter('searchQuery', searchQuery.value);
  if (selectedDate.value !== 'all') {
    eventsStore.setFilter('dateFilter', selectedDate.value);
  }
  router.push('/explorar');
}

// Discovery plans filtered dynamically by the actual startAt date
const discoveryPlans = computed(() => {
  const all = eventsStore.events;
  if (activeTab.value === 'today') {
    return all.filter(e => isToday(e.startAt) || (e.dateBadge && e.dateBadge.toLowerCase().includes('hoy'))).slice(0, 6);
  } else if (activeTab.value === 'weekend') {
    return all.filter(e => isThisWeekend(e.startAt) || (e.dateBadge && (e.dateBadge.toLowerCase().includes('sáb') || e.dateBadge.toLowerCase().includes('dom')))).slice(0, 6);
  } else if (activeTab.value === 'upcoming') {
    return all.filter(e => isUpcoming(e.startAt)).slice(0, 6);
  }
  return all.slice(0, 6);
});

// Secondary section: Free / Community activities
const freeActivities = computed(() => {
  return eventsStore.events.filter(e => e.priceType === 'free').slice(0, 3);
});
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <!-- HERO SECTION: Clean, minimal, high-impact -->
    <section class="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-16 text-center relative">
      <!-- Ambient subtle glow behind search -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-[#172B46]/40 via-[#FFC69D]/10 to-[#91E3C7]/10 blur-[100px] pointer-events-none rounded-full"></div>

      <!-- Live subtle pill -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#FFC69D] mb-6 backdrop-blur-md">
        <span class="w-2 h-2 rounded-full bg-[#FFC69D] animate-pulse"></span>
        <span class="font-medium">
          Agenda cultural en vivo · {{ cityStore.selectedCityId === 'all' ? 'Corrientes y Chaco' : cityStore.cities.find(c => c.id === cityStore.selectedCityId)?.name || 'Litoral' }}
        </span>
      </div>

      <!-- Primary Title -->
      <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-['Plus_Jakarta_Sans']">
        ¿Y hoy, <span class="text-[#FFC69D] italic font-medium">qué hacemos?</span>
      </h1>

      <!-- Subtitle -->
      <p class="mt-4 text-base sm:text-lg text-gray-300 max-w-xl mx-auto font-normal leading-relaxed">
        Descubrí eventos, recitales frente al río, ferias y experiencias culturales cerca tuyo.
      </p>

      <!-- PROMINENT UNIFIED MASTER SEARCH BAR -->
      <div class="mt-8 sm:mt-10 max-w-3xl mx-auto w-full">
        <form
          @submit.prevent="handleSearchSubmit"
          class="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl glass-search flex flex-col sm:flex-row items-stretch gap-2 transition-all shadow-2xl"
        >
          <!-- Text Input -->
          <div class="flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 focus-within:border-[#FFC69D]/50 focus-within:bg-white/10 transition-colors">
            <Search class="w-5 h-5 text-gray-400 shrink-0" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscá un recital, una feria, un taller o algo diferente..."
              class="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          <!-- Quick Context: Date selector -->
          <div class="flex items-center gap-2">
            <div class="relative w-full sm:w-auto">
              <select
                v-model="selectedDate"
                class="w-full sm:w-auto appearance-none bg-white/5 border border-white/5 hover:bg-white/10 text-xs sm:text-sm text-gray-200 px-3.5 py-3 rounded-xl sm:rounded-2xl cursor-pointer focus:outline-none pr-8 transition-colors"
              >
                <option value="all" class="bg-[#181B23] text-white">Cualquier día</option>
                <option value="today" class="bg-[#181B23] text-white">Hoy</option>
                <option value="weekend" class="bg-[#181B23] text-white">Este fin de semana</option>
              </select>
              <Calendar class="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <!-- Submit CTA -->
            <button
              type="submit"
              class="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-2xl bg-[#FFC69D] text-[#172B46] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,198,157,0.35)] hover:bg-[#FFDCC4] active:scale-[0.98] transition-all shrink-0 font-['Plus_Jakarta_Sans']"
            >
              <span>Explorar</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Error State if Firestore fails -->
    <div v-if="eventsStore.error" class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mb-8">
      <div class="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <AlertCircle class="w-5 h-5 text-red-400 shrink-0" />
          <p class="text-xs sm:text-sm text-red-200">
            {{ eventsStore.error }}
          </p>
        </div>
        <button
          @click="eventsStore.fetchPublishedEvents"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors shrink-0"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Reintentar</span>
        </button>
      </div>
    </div>

    <!-- SECTION: PLANES PARA DESCUBRIR -->
    <section class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
      <!-- Header with Intuitive Time Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-3 border-b border-white/5">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFC69D]">
            <Sparkles class="w-3.5 h-3.5" />
            <span>Selección del día</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-['Plus_Jakarta_Sans']">
            Planes para descubrir
          </h2>
        </div>

        <!-- Clean, Compact Switcher (Hoy / Fin de semana / Próximamente) -->
        <div class="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
          <button
            @click="activeTab = 'today'"
            class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all"
            :class="activeTab === 'today' ? 'bg-[#FFC69D] text-[#172B46] font-bold shadow-sm' : 'text-gray-400 hover:text-white'"
          >
            Hoy
          </button>
          <button
            @click="activeTab = 'weekend'"
            class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all"
            :class="activeTab === 'weekend' ? 'bg-[#FFC69D] text-[#172B46] font-bold shadow-sm' : 'text-gray-400 hover:text-white'"
          >
            Este fin de semana
          </button>
          <button
            @click="activeTab = 'upcoming'"
            class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all"
            :class="activeTab === 'upcoming' ? 'bg-[#FFC69D] text-[#172B46] font-bold shadow-sm' : 'text-gray-400 hover:text-white'"
          >
            Próximamente
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="eventsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        <div v-for="n in 6" :key="n" class="h-80 rounded-2xl bg-white/5 border border-white/5"></div>
      </div>

      <!-- Discovery Cards Grid -->
      <div v-else-if="discoveryPlans.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        <EventCard
          v-for="(event, idx) in discoveryPlans"
          :key="event.id"
          :event="event"
          :featured="idx === 0"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 px-4 rounded-3xl bg-white/5 border border-white/10">
        <p class="text-base text-gray-300 font-medium">No encontramos eventos para esta fecha específica en este momento.</p>
        <button
          @click="activeTab = 'all'"
          class="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
        >
          Ver todos los planes disponibles
        </button>
      </div>

      <!-- Explore More Action -->
      <div class="mt-8 text-center">
        <router-link
          to="/explorar"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all shadow-md group"
        >
          <span>Ver cartelera completa con filtros</span>
          <ArrowRight class="w-4 h-4 text-[#FFC69D] group-hover:translate-x-1 transition-transform" />
        </router-link>
      </div>
    </section>

    <!-- OPTIONAL SECONDARY SECTION: ACTIVIDADES LIBRES & GRATUITAS -->
    <section v-if="freeActivities.length > 0" class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      <div class="rounded-3xl bg-gradient-to-br from-[#181B23] to-[#141720] border border-white/10 p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#91E3C7] mb-1">
              <Ticket class="w-3.5 h-3.5" />
              <span>Cultura Accesible</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-white font-['Plus_Jakarta_Sans']">
              Actividades 100% Gratuitas
            </h3>
            <p class="text-xs sm:text-sm text-gray-400 mt-1">
              Planes al aire libre, ferias populares y muestras abiertas sin costo de entrada.
            </p>
          </div>

          <router-link
            to="/explorar?price=free"
            class="text-xs sm:text-sm font-semibold text-[#91E3C7] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver todas las actividades gratis</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EventCard
            v-for="event in freeActivities"
            :key="event.id"
            :event="event"
          />
        </div>
      </div>
    </section>
  </div>
</template>
