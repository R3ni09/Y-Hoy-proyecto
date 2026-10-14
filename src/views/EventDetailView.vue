<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventsStore } from '../stores/eventsStore';
import { useAuthStore } from '../stores/authStore';
import type { CulturalEvent } from '../types';
import {
  Calendar,
  MapPin,
  Share2,
  Bookmark,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Building,
  Ticket,
  AlertCircle
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const eventsStore = useEventsStore();
const authStore = useAuthStore();

const event = ref<CulturalEvent | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const copied = ref(false);

const isSaved = computed(() => (event.value ? authStore.isFavorite(event.value.id) : false));

onMounted(async () => {
  const eventId = route.params.id as string;
  try {
    event.value = await eventsStore.getEventById(eventId);
    if (!event.value) {
      errorMessage.value = 'El evento solicitado no existe o fue retirado.';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Error al cargar el detalle del evento desde la base de datos.';
  } finally {
    isLoading.value = false;
  }
});

function handleShare() {
  if (navigator.share && event.value) {
    navigator.share({
      title: event.value.title,
      text: event.value.summary,
      url: window.location.href,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2500);
  }
}

async function handleToggleFavorite() {
  if (!authStore.isAuthenticated) {
    alert('Iniciá sesión para guardar este evento en tus favoritos.');
    return;
  }
  if (!event.value) return;
  try {
    await authStore.toggleFavorite(event.value.id);
  } catch (err) {
    console.error('Error toggling favorite:', err);
  }
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
    <!-- Back button -->
    <button
      @click="router.back()"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors mb-6 border border-white/5"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Volver a la cartelera</span>
    </button>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div class="h-80 rounded-3xl bg-white/5"></div>
      <div class="h-10 w-2/3 rounded-xl bg-white/5"></div>
      <div class="h-24 rounded-2xl bg-white/5"></div>
    </div>

    <!-- Error message if query failed -->
    <div v-else-if="errorMessage && !event" class="text-center py-20 px-6 rounded-3xl bg-[#181B23] border border-white/10 max-w-md mx-auto space-y-4">
      <AlertCircle class="w-12 h-12 text-[#FFC69D] mx-auto" />
      <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">Evento no disponible</h3>
      <p class="text-xs sm:text-sm text-gray-400">
        {{ errorMessage }}
      </p>
      <router-link
        to="/explorar"
        class="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#FFC69D] text-[#172B46] text-xs font-bold hover:bg-[#FFDCC4] transition-all"
      >
        Volver a la cartelera
      </router-link>
    </div>

    <!-- Event Detail Card -->
    <div v-else-if="event" class="flex flex-col gap-8">
      <!-- Hero Banner Image with Overlaid Metadata -->
      <div class="relative w-full h-72 sm:h-[420px] rounded-3xl overflow-hidden bg-[#181B23] border border-white/10 shadow-2xl">
        <img
          :src="event.imageURL"
          :alt="event.title"
          class="w-full h-full object-cover"
          @error="(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop'; }"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#10131B] via-[#10131B]/40 to-transparent"></div>

        <!-- Badges on top -->
        <div class="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-[#10131B]/80 text-[#FFC69D] backdrop-blur-md border border-white/10">
              {{ event.categoryEmoji }} {{ event.categoryName }}
            </span>
            <span
              v-if="event.verificationStatus === 'verified'"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#006751]/80 text-[#91E3C7] backdrop-blur-md"
            >
              <ShieldCheck class="w-3.5 h-3.5" />
              <span>Verificado</span>
            </span>
          </div>

          <!-- Favorite & Share Buttons -->
          <div class="flex items-center gap-2">
            <button
              @click="handleShare"
              class="p-2.5 rounded-full bg-[#10131B]/80 hover:bg-[#10131B] text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
              title="Compartir evento"
            >
              <Share2 class="w-4 h-4" />
            </button>
            <button
              @click="handleToggleFavorite"
              class="p-2.5 rounded-full bg-[#10131B]/80 hover:bg-[#10131B] text-white/80 hover:text-[#FFC69D] backdrop-blur-md border border-white/10 transition-colors"
              :class="isSaved ? 'text-[#FFC69D]' : ''"
              title="Guardar en favoritos"
            >
              <Bookmark class="w-4 h-4" :fill="isSaved ? '#FFC69D' : 'none'" />
            </button>
          </div>
        </div>

        <!-- Copied toast -->
        <div
          v-if="copied"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#91E3C7] text-[#00382B] text-xs font-bold shadow-lg animate-in fade-in"
        >
          ¡Enlace copiado al portapapeles!
        </div>
      </div>

      <!-- Main Layout: 2 Columns on Desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left Column: Details & Narrative (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-6">
          <div>
            <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
              {{ event.title }}
            </h1>
            <p class="text-base sm:text-lg text-gray-300 mt-3 leading-relaxed">
              {{ event.summary }}
            </p>
          </div>

          <!-- Key Quick Info Pill Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#181B23] border border-white/5">
            <!-- Date & Time -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FFC69D] shrink-0">
                <Calendar class="w-5 h-5" />
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fecha y hora</span>
                <span class="text-sm font-bold text-white">{{ event.timeDisplay }}</span>
              </div>
            </div>

            <!-- Venue -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#91E3C7] shrink-0">
                <MapPin class="w-5 h-5" />
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Lugar</span>
                <span class="text-sm font-bold text-white truncate">{{ event.venueName }}</span>
              </div>
            </div>
          </div>

          <!-- Full Narrative Description -->
          <div class="p-6 rounded-3xl bg-[#181B23]/70 border border-white/5 space-y-4">
            <h2 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Acerca de esta actividad
            </h2>
            <p class="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line">
              {{ event.description }}
            </p>

            <!-- Tags -->
            <div v-if="event.tags && event.tags.length > 0" class="pt-4 border-t border-white/5 flex flex-wrap gap-2">
              <span
                v-for="tag in event.tags"
                :key="tag"
                class="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/5 text-gray-300"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column: Tickets & Organizer (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
          <!-- Ticket / Access Card -->
          <div class="p-6 rounded-3xl bg-[#181B23] border border-white/10 shadow-xl flex flex-col gap-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acceso</span>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="event.priceType === 'free' ? 'bg-[#006751]/80 text-[#91E3C7]' : 'bg-[#FFC69D]/20 text-[#FFC69D]'"
              >
                {{ event.priceType === 'free' ? 'Libre y Gratuito' : 'Con Entrada' }}
              </span>
            </div>

            <div>
              <span class="text-xs text-gray-400 block mb-1">Precio</span>
              <span class="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                {{ event.priceDisplay }}
              </span>
            </div>

            <a
              v-if="event.ticketUrl"
              :href="event.ticketUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-3.5 px-4 rounded-2xl bg-[#FFC69D] text-[#172B46] font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-[#FFDCC4] transition-all shadow-[0_0_20px_rgba(255,198,157,0.3)] font-['Plus_Jakarta_Sans']"
            >
              <Ticket class="w-4 h-4" />
              <span>Conseguir entradas</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </a>

            <div v-else class="p-3 rounded-xl bg-white/5 text-xs text-gray-300 text-center">
              No requiere ticket previo. Entrada por orden de llegada.
            </div>
          </div>

          <!-- Venue & Address Card -->
          <div class="p-5 rounded-3xl bg-[#181B23] border border-white/5 flex flex-col gap-3">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dirección & Punto de encuentro</span>
            <div class="flex items-start gap-2.5 text-sm text-gray-200">
              <MapPin class="w-4 h-4 text-[#91E3C7] mt-0.5 shrink-0" />
              <span>{{ event.address }}, {{ event.cityName }}</span>
            </div>
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address + ', ' + event.cityName)}`"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-1 text-xs text-[#FFC69D] hover:underline flex items-center gap-1"
            >
              <span>Abrir en Google Maps</span>
              <ExternalLink class="w-3 h-3" />
            </a>
          </div>

          <!-- Organizer Info -->
          <div class="p-5 rounded-3xl bg-[#181B23] border border-white/5 flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFC69D] shrink-0">
              <Building class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Organizado por</span>
              <span class="text-sm font-bold text-white truncate block">{{ event.organizerName }}</span>
              <span class="text-xs text-[#91E3C7]">Comunidad cultural verificada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
