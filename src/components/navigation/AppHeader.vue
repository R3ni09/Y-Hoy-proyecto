<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { useCityStore } from '../../stores/cityStore';
import { useEventsStore } from '../../stores/eventsStore';
import {
  Compass,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Lock,
  MapPin,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const cityStore = useCityStore();
const eventsStore = useEventsStore();

const isUserMenuOpen = ref(false);
const isCityMenuOpen = ref(false);

function handleSelectCity(cityId: string) {
  cityStore.setCity(cityId);
  eventsStore.setFilter('cityId', cityId);
  isCityMenuOpen.value = false;
}

function handleLockCuration() {
  userStore.lockCuration();
  isUserMenuOpen.value = false;
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-10 pt-3">
    <div class="max-w-7xl mx-auto h-16 sm:h-20 rounded-2xl glass-nav px-4 sm:px-6 flex items-center justify-between transition-all">
      <!-- Left: Logo & Region Pill -->
      <div class="flex items-center gap-3 sm:gap-6">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#172B46] to-[#374A66] border border-white/20 flex items-center justify-center shadow-md">
            <span class="text-xl">✨</span>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-xl sm:text-2xl text-white tracking-tight group-hover:text-[#FFC69D] transition-colors font-['Plus_Jakarta_Sans']">
              ¿Y hoy?
            </span>
          </div>
        </router-link>

        <!-- Dynamic City Context Dropdown -->
        <div class="relative">
          <button
            @click="isCityMenuOpen = !isCityMenuOpen"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-[#E0E2ED] transition-colors"
          >
            <MapPin class="w-3.5 h-3.5 text-[#91E3C7]" />
            <span class="font-medium">
              {{ cityStore.selectedCityId === 'all' ? 'Corrientes & Chaco' : cityStore.cities.find(c => c.id === cityStore.selectedCityId)?.name || 'Región' }}
            </span>
            <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="isCityMenuOpen"
            class="absolute top-full left-0 mt-2 w-56 py-1.5 rounded-2xl glass-modal z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div class="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Seleccionar Región
            </div>
            <button
              @click="handleSelectCity('all')"
              class="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors"
              :class="cityStore.selectedCityId === 'all' ? 'text-[#FFC69D] font-semibold' : 'text-gray-200'"
            >
              <span>Toda la región litoral</span>
              <span v-if="cityStore.selectedCityId === 'all'">✓</span>
            </button>
            <button
              v-for="city in cityStore.cities"
              :key="city.id"
              @click="handleSelectCity(city.id)"
              class="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors"
              :class="cityStore.selectedCityId === city.id ? 'text-[#FFC69D] font-semibold' : 'text-gray-200'"
            >
              <span>{{ city.name }} ({{ city.province }})</span>
              <span v-if="cityStore.selectedCityId === city.id">✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Center: Clean Navigation Links -->
      <nav class="hidden md:flex items-center gap-1.5">
        <router-link
          to="/explorar"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path === '/explorar' ? 'bg-white/10 text-white font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/5'"
        >
          <Compass class="w-4 h-4 text-[#B6E3F5]" />
          <span>Explorar</span>
        </router-link>

        <router-link
          to="/favoritos"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors relative"
          :class="route.path === '/favoritos' ? 'bg-white/10 text-white font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/5'"
        >
          <Bookmark class="w-4 h-4 text-[#FFC69D]" />
          <span>Favoritos</span>
          <span
            v-if="userStore.favorites.length > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FFC69D] text-[#172B46]"
          >
            {{ userStore.favorites.length }}
          </span>
        </router-link>

        <!-- Moderation view for unlocked curators -->
        <router-link
          v-if="userStore.isCurator"
          to="/moderacion"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path === '/moderacion' ? 'bg-white/10 text-[#91E3C7] font-semibold' : 'text-gray-300 hover:text-[#91E3C7] hover:bg-white/5'"
        >
          <ShieldCheck class="w-4 h-4 text-[#91E3C7]" />
          <span>Moderación</span>
        </router-link>
      </nav>

      <!-- Right: Actions & User State -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Publicar Evento CTA -->
        <router-link
          to="/publicar"
          class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium border border-white/15 transition-all shadow-sm"
        >
          <PlusCircle class="w-4 h-4 text-[#FFC69D]" />
          <span>Subir evento</span>
        </router-link>

        <!-- Visitor Profile Menu -->
        <div class="relative">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center gap-2 p-1 pl-2 pr-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <div class="w-7 h-7 rounded-full bg-[#172B46] border border-white/20 flex items-center justify-center text-xs font-bold text-white">
              {{ userStore.displayName?.charAt(0) || 'V' }}
            </div>
            <span class="text-xs text-gray-200 hidden lg:inline max-w-[110px] truncate">
              {{ userStore.displayName }}
            </span>
          </button>

          <!-- User dropdown menu -->
          <div
            v-if="isUserMenuOpen"
            class="absolute top-full right-0 mt-2 w-64 p-2 rounded-2xl glass-modal z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div class="px-3 py-2 border-b border-white/10">
              <p class="text-sm font-bold text-white">{{ userStore.displayName }}</p>
              <p class="text-xs text-gray-400 truncate">Visitante local · sin cuenta</p>
              <div
                v-if="userStore.isCurator"
                class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#91E3C7]/20 text-[#91E3C7]"
              >
                <ShieldCheck class="w-3 h-3" />
                <span>Modo curador activo</span>
              </div>
            </div>

            <div class="py-1">
              <router-link
                to="/perfil"
                @click="isUserMenuOpen = false"
                class="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <UserIcon class="w-4 h-4 text-gray-400" />
                <span>Mi perfil & preferencias</span>
              </router-link>
              <router-link
                to="/publicar"
                @click="isUserMenuOpen = false"
                class="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <PlusCircle class="w-4 h-4 text-[#FFC69D]" />
                <span>Publicar una actividad</span>
              </router-link>
              <router-link
                v-if="userStore.isCurator"
                to="/moderacion"
                @click="isUserMenuOpen = false"
                class="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <ShieldCheck class="w-4 h-4 text-[#91E3C7]" />
                <span>Panel de moderación</span>
              </router-link>
            </div>

            <div v-if="userStore.isCurator" class="pt-1 border-t border-white/10">
              <button
                @click="handleLockCuration"
                class="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-xl transition-colors"
              >
                <Lock class="w-4 h-4" />
                <span>Bloquear modo curador</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Nav Bar (Bottom Navigation for mobile screens) -->
    <div class="md:hidden fixed bottom-3 inset-x-4 z-50 glass-nav h-14 rounded-2xl flex items-center justify-around px-2 shadow-2xl">
      <router-link
        to="/"
        class="flex flex-col items-center justify-center p-1.5 text-[11px]"
        :class="route.path === '/' ? 'text-[#FFC69D] font-bold' : 'text-gray-400'"
      >
        <Sparkles class="w-5 h-5" />
        <span>Inicio</span>
      </router-link>
      <router-link
        to="/explorar"
        class="flex flex-col items-center justify-center p-1.5 text-[11px]"
        :class="route.path === '/explorar' ? 'text-[#FFC69D] font-bold' : 'text-gray-400'"
      >
        <Compass class="w-5 h-5" />
        <span>Explorar</span>
      </router-link>
      <router-link
        to="/favoritos"
        class="flex flex-col items-center justify-center p-1.5 text-[11px] relative"
        :class="route.path === '/favoritos' ? 'text-[#FFC69D] font-bold' : 'text-gray-400'"
      >
        <Bookmark class="w-5 h-5" />
        <span>Guardados</span>
        <span
          v-if="userStore.favorites.length > 0"
          class="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#FFC69D]"
        ></span>
      </router-link>
      <router-link
        to="/publicar"
        class="flex flex-col items-center justify-center p-1.5 text-[11px]"
        :class="route.path === '/publicar' ? 'text-[#FFC69D] font-bold' : 'text-gray-400'"
      >
        <PlusCircle class="w-5 h-5" />
        <span>Publicar</span>
      </router-link>
    </div>
  </header>
</template>
