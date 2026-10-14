<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { CulturalEvent } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { MapPin, Bookmark, Calendar, ArrowUpRight } from 'lucide-vue-next';

const props = defineProps<{
  event: CulturalEvent;
  featured?: boolean;
}>();

const router = useRouter();
const authStore = useAuthStore();

const isSaved = computed(() => authStore.isFavorite(props.event.id));

async function handleToggleFavorite(e: MouseEvent) {
  e.stopPropagation();
  if (!authStore.isAuthenticated) {
    alert('Iniciá sesión para guardar este evento en tus favoritos.');
    return;
  }
  try {
    await authStore.toggleFavorite(props.event.id);
  } catch (err: any) {
    console.warn('Could not toggle favorite:', err.message);
  }
}

function handleCardClick() {
  router.push(`/evento/${props.event.id}`);
}
</script>

<template>
  <article
    @click="handleCardClick"
    class="group cursor-pointer rounded-2xl sm:rounded-3xl bg-[#181B23] border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    :class="featured ? 'lg:col-span-2' : ''"
  >
    <!-- Top Image Container with Scrim and Floating Badges -->
    <div class="relative w-full overflow-hidden bg-[#10131B]" :class="featured ? 'h-56 sm:h-72' : 'h-48 sm:h-52'">
      <img
        :src="event.imageURL"
        :alt="event.imageAlt || event.title"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'; }"
      />
      <!-- Gradient Scrim for high contrast -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#181B23] via-transparent to-black/40"></div>

      <!-- Top Badges -->
      <div class="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span
            v-if="event.priceType === 'free'"
            class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#006751]/90 text-[#91E3C7] shadow-sm backdrop-blur-md"
          >
            Gratis
          </span>
          <span
            v-else
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#10131B]/85 text-[#FFC69D] shadow-sm backdrop-blur-md"
          >
            {{ event.priceDisplay }}
          </span>

          <span
            v-if="event.isOutdoor"
            class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/50 text-[#91E3C7] backdrop-blur-sm"
          >
            🌿 Aire libre
          </span>
        </div>

        <!-- Discrete Favorite Button -->
        <button
          @click="handleToggleFavorite"
          class="pointer-events-auto p-2 rounded-full bg-[#10131B]/80 hover:bg-[#10131B] text-white/80 hover:text-white transition-all backdrop-blur-md shadow-sm"
          :class="isSaved ? 'text-[#FFC69D] bg-[#10131B]' : ''"
          :title="isSaved ? 'Quitar de guardados' : 'Guardar en favoritos'"
        >
          <Bookmark class="w-4 h-4" :fill="isSaved ? '#FFC69D' : 'none'" />
        </button>
      </div>

      <!-- Bottom overlay on photo: Date/Time Badge -->
      <div class="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs font-semibold text-white/95">
        <span class="px-2.5 py-1 rounded-lg bg-[#10131B]/80 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
          <Calendar class="w-3.5 h-3.5 text-[#FFC69D]" />
          <span>{{ event.timeDisplay }}</span>
        </span>
      </div>
    </div>

    <!-- Content Area: Clean, Scannable Typography -->
    <div class="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
      <div>
        <!-- Secondary Metadata: Category & City -->
        <div class="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
          <span>{{ event.categoryEmoji }} {{ event.categoryName }}</span>
          <span class="text-white/20">•</span>
          <span class="text-gray-300 font-medium">{{ event.cityName }}</span>
        </div>

        <!-- Event Title -->
        <h3
          class="text-base sm:text-lg font-bold text-white group-hover:text-[#FFC69D] transition-colors leading-snug line-clamp-2 font-['Plus_Jakarta_Sans']"
          :class="featured ? 'sm:text-xl' : ''"
        >
          {{ event.title }}
        </h3>

        <!-- Short summary -->
        <p class="text-xs sm:text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
          {{ event.summary }}
        </p>
      </div>

      <!-- Footer: Location & Discrete Action -->
      <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <div class="flex items-center gap-1.5 truncate max-w-[80%]">
          <MapPin class="w-3.5 h-3.5 text-[#91E3C7] shrink-0" />
          <span class="truncate text-gray-300">{{ event.venueName }}</span>
        </div>

        <div class="flex items-center gap-0.5 text-[#FFC69D] group-hover:translate-x-0.5 transition-transform font-medium">
          <span>Ver</span>
          <ArrowUpRight class="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  </article>
</template>
