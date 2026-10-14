<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useCityStore } from '../stores/cityStore';
import { useEventsStore } from '../stores/eventsStore';
import AuthModal from '../components/auth/AuthModal.vue';
import {
  User,
  MapPin,
  CheckCircle,
  Sparkles,
  AlertCircle
} from 'lucide-vue-next';

const authStore = useAuthStore();
const cityStore = useCityStore();
const eventsStore = useEventsStore();

const isSaving = ref(false);
const savedFeedback = ref(false);
const errorMessage = ref<string | null>(null);
const isAuthModalOpen = ref(false);

const editableDisplayName = ref('');
const editableCityId = ref('corrientes');
const editableCategories = ref<string[]>([]);

onMounted(async () => {
  await Promise.all([
    cityStore.fetchCities(),
    eventsStore.fetchCategories()
  ]);

  if (authStore.user) {
    editableDisplayName.value = authStore.user.displayName || '';
    editableCityId.value = authStore.user.preferredCityId || 'corrientes';
    editableCategories.value = [...(authStore.user.preferredCategoryIds || ['musica'])];
  }
});

function toggleCategory(categoryId: string) {
  const idx = editableCategories.value.indexOf(categoryId);
  if (idx > -1) {
    editableCategories.value.splice(idx, 1);
  } else {
    editableCategories.value.push(categoryId);
  }
}

async function handleSavePreferences() {
  if (!authStore.user?.uid) return;
  isSaving.value = true;
  errorMessage.value = null;

  try {
    await authStore.updateUserProfile({
      displayName: editableDisplayName.value.trim() || authStore.user.displayName,
      preferredCityId: editableCityId.value,
      preferredCategoryIds: editableCategories.value,
    });
    savedFeedback.value = true;
    setTimeout(() => { savedFeedback.value = false; }, 3000);
  } catch (err: any) {
    errorMessage.value = err.message || 'Error al guardar los cambios en Firestore.';
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
        Mi Perfil & Preferencias
      </h1>
      <p class="text-xs sm:text-sm text-gray-400 mt-1">
        Personalizá tu experiencia cultural y administrá tus datos guardados en Cloud Firestore.
      </p>
    </div>

    <!-- Error state -->
    <div
      v-if="errorMessage"
      class="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-xs text-red-200"
    >
      <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <div v-if="authStore.isAuthenticated && authStore.user" class="space-y-6">
      <!-- Profile Info Card -->
      <div class="p-6 rounded-3xl bg-[#181B23] border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <img
          v-if="authStore.user.photoURL"
          :src="authStore.user.photoURL"
          :alt="authStore.user.displayName"
          class="w-16 h-16 rounded-full object-cover border-2 border-[#FFC69D]"
        />
        <div v-else class="w-16 h-16 rounded-full bg-[#172B46] border border-white/20 flex items-center justify-center text-xl font-bold text-white">
          {{ authStore.user.displayName.charAt(0) }}
        </div>

        <div class="flex-1 text-center sm:text-left">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 class="text-lg font-bold text-white">{{ authStore.user.displayName }}</h2>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFC69D]/20 text-[#FFC69D] uppercase self-center sm:self-auto">
              {{ authStore.userRole }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">{{ authStore.user.email }}</p>
          <p class="text-[11px] text-[#91E3C7] mt-1 flex items-center justify-center sm:justify-start gap-1">
            <Sparkles class="w-3.5 h-3.5" />
            <span>Perfil sincronizado en Cloud Firestore</span>
          </p>
        </div>
      </div>

      <!-- Preferred City & Categories -->
      <div class="p-6 rounded-3xl glass-panel space-y-6">
        <h3 class="text-base font-bold text-white font-['Plus_Jakarta_Sans'] border-b border-white/10 pb-3">
          Tus preferencias de descubrimiento
        </h3>

        <!-- Display Name Edit -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Nombre para mostrar en publicaciones</label>
          <input
            v-model="editableDisplayName"
            type="text"
            class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFC69D]/50"
          />
        </div>

        <!-- Preferred City -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-2">Tu ciudad principal de interés</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="city in cityStore.cities"
              :key="city.id"
              type="button"
              @click="editableCityId = city.id"
              class="p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              :class="editableCityId === city.id ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-sm' : 'bg-white/5 border-white/10 text-gray-300'"
            >
              <MapPin class="w-4 h-4" />
              <span>{{ city.name }} ({{ city.province }})</span>
            </button>
          </div>
        </div>

        <!-- Preferred Categories -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-2">Categorías que más disfrutás</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in eventsStore.categories"
              :key="cat.id"
              type="button"
              @click="toggleCategory(cat.id)"
              class="px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all"
              :class="editableCategories.includes(cat.id) ? 'bg-[#91E3C7]/20 border-[#91E3C7] text-[#91E3C7] font-bold' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'"
            >
              {{ cat.emoji }} {{ cat.name }}
            </button>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-between">
          <button
            :disabled="isSaving"
            @click="handleSavePreferences"
            class="px-6 py-2.5 rounded-xl bg-[#FFC69D] text-[#172B46] text-xs font-bold hover:bg-[#FFDCC4] transition-all disabled:opacity-50"
          >
            {{ isSaving ? 'Guardando en Firestore...' : 'Guardar preferencias' }}
          </button>
          <span v-if="savedFeedback" class="text-xs text-[#91E3C7] flex items-center gap-1 animate-in fade-in">
            <CheckCircle class="w-4 h-4" />
            <span>¡Preferencias actualizadas en Firestore!</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Login fallback if not authenticated -->
    <div v-else class="text-center py-20 px-6 rounded-3xl bg-[#181B23] border border-white/10 space-y-4">
      <User class="w-12 h-12 text-[#FFC69D] mx-auto" />
      <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">Iniciá sesión para personalizar tu experiencia</h3>
      <p class="text-xs text-gray-400 max-w-sm mx-auto">
        Accedé con tu cuenta para guardar eventos favoritos y sincronizar tu cartelera personalizada.
      </p>
      <button
        @click="isAuthModalOpen = true"
        class="px-6 py-3 rounded-xl bg-[#FFC69D] text-[#172B46] text-xs font-bold hover:bg-[#FFDCC4] transition-all shadow-md"
      >
        Ingresar a mi cuenta
      </button>
    </div>

    <!-- Auth Modal -->
    <AuthModal
      v-if="isAuthModalOpen"
      @close="isAuthModalOpen = false"
    />
  </div>
</template>
