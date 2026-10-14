<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventsStore } from '../stores/eventsStore';
import { useAuthStore } from '../stores/authStore';
import AuthModal from '../components/auth/AuthModal.vue';
import {
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Calendar,
  MapPin,
  RefreshCw,
  Lock
} from 'lucide-vue-next';

const eventsStore = useEventsStore();
const authStore = useAuthStore();

const rejectionReason = ref('');
const rejectingEventId = ref<string | null>(null);
const isProcessing = ref(false);
const actionMessage = ref<string | null>(null);
const isAuthModalOpen = ref(false);

onMounted(async () => {
  if (authStore.isAdmin) {
    await eventsStore.fetchPendingEvents();
  }
});

async function handleApprove(id: string) {
  if (!authStore.user?.uid) return;
  isProcessing.value = true;
  actionMessage.value = null;
  try {
    await eventsStore.approveEvent(id, authStore.user.uid);
    actionMessage.value = 'Evento aprobado y publicado en cartelera.';
    setTimeout(() => { actionMessage.value = null; }, 3000);
  } catch (err: any) {
    alert(err.message || 'Error al aprobar el evento en Firestore.');
  } finally {
    isProcessing.value = false;
  }
}

async function handleReject(id: string) {
  if (!rejectionReason.value.trim() || !authStore.user?.uid) return;
  isProcessing.value = true;
  actionMessage.value = null;
  try {
    await eventsStore.rejectEvent(id, rejectionReason.value, authStore.user.uid);
    rejectingEventId.value = null;
    rejectionReason.value = '';
    actionMessage.value = 'Evento rechazado correctamente.';
    setTimeout(() => { actionMessage.value = null; }, 3000);
  } catch (err: any) {
    alert(err.message || 'Error al rechazar el evento en Firestore.');
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006751]/40 border border-[#91E3C7]/40 text-xs text-[#91E3C7] mb-2">
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>Panel Curatorial & Moderación</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
          Revisión de actividades comunitarias
        </h1>
        <p class="text-xs sm:text-sm text-gray-400 mt-1">
          Validación de direcciones, horarios y veracidad antes de la publicación oficial en cartelera.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400">Rol activo:</span>
        <span
          class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
          :class="authStore.isAdmin ? 'bg-[#91E3C7] text-[#00382B]' : 'bg-white/10 text-gray-300'"
        >
          {{ authStore.userRole }}
        </span>
      </div>
    </div>

    <!-- Feedback banner -->
    <div
      v-if="actionMessage"
      class="mb-6 p-4 rounded-2xl bg-[#006751]/30 border border-[#91E3C7]/40 text-xs text-[#91E3C7] flex items-center justify-between animate-in fade-in"
    >
      <span>{{ actionMessage }}</span>
      <button @click="actionMessage = null" class="text-white hover:underline">Cerrar</button>
    </div>

    <!-- Permission Warning if not Admin -->
    <div v-if="!authStore.isAdmin" class="p-8 sm:p-12 rounded-3xl bg-[#181B23] border border-white/10 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
      <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
        <Lock class="w-6 h-6" />
      </div>
      <h3 class="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Acceso restringido</h3>
      <p class="text-xs sm:text-sm text-gray-400 leading-relaxed">
        El panel curatorial está reservado para moderadores y administradores autorizados. Para gestionar publicaciones, iniciá sesión con una cuenta con permisos administrativos en Firebase.
      </p>
      <div class="pt-2">
        <button
          v-if="!authStore.isAuthenticated"
          @click="isAuthModalOpen = true"
          class="px-6 py-2.5 rounded-xl bg-[#FFC69D] text-[#172B46] text-xs font-bold hover:bg-[#FFDCC4] transition-all"
        >
          Iniciar sesión
        </button>
        <span v-else class="text-xs text-gray-400 block">
          Tu cuenta actual ({{ authStore.user?.email }}) no tiene permisos administrativos.
        </span>
      </div>
    </div>

    <!-- Moderation List from Firestore -->
    <div v-else-if="eventsStore.pendingEvents.length > 0" class="space-y-6">
      <div
        v-for="item in eventsStore.pendingEvents"
        :key="item.id"
        class="p-6 rounded-3xl bg-[#181B23] border border-white/10 shadow-xl flex flex-col md:flex-row gap-6 justify-between items-start"
      >
        <!-- Info Column -->
        <div class="flex-1 space-y-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              Pendiente de revisión
            </span>
            <span class="text-xs text-gray-400">• {{ item.cityName }}</span>
          </div>

          <h3 class="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
            {{ item.title }}
          </h3>

          <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {{ item.summary || item.description }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400 pt-2 border-t border-white/5">
            <div class="flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-[#FFC69D]" />
              <span>{{ item.timeDisplay }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-[#91E3C7]" />
              <span class="truncate">{{ item.venueName }} ({{ item.address }})</span>
            </div>
          </div>

          <div class="text-xs text-gray-400">
            <strong>Organizador:</strong> {{ item.organizerName }} ({{ item.organizerType }}) | <strong>Precio:</strong> {{ item.priceDisplay }}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
          <button
            :disabled="isProcessing"
            @click="handleApprove(item.id)"
            class="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#006751] hover:bg-[#008065] text-[#91E3C7] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50"
          >
            <Check class="w-4 h-4" />
            <span>Aprobar y publicar</span>
          </button>

          <button
            :disabled="isProcessing"
            @click="rejectingEventId = item.id"
            class="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <X class="w-4 h-4" />
            <span>Rechazar</span>
          </button>
        </div>

        <!-- Reject Reason Prompt -->
        <div v-if="rejectingEventId === item.id" class="w-full mt-4 p-4 rounded-2xl bg-black/40 border border-red-500/40 space-y-2">
          <label class="block text-xs font-semibold text-red-300">Motivo del rechazo (se informará al creador):</label>
          <input
            v-model="rejectionReason"
            type="text"
            placeholder="Ej: Dirección incompleta o evento duplicado"
            class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
          />
          <div class="flex justify-end gap-2 pt-2">
            <button
              @click="rejectingEventId = null"
              class="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              :disabled="!rejectionReason.trim() || isProcessing"
              @click="handleReject(item.id)"
              class="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold disabled:opacity-50"
            >
              Confirmar rechazo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Pending List -->
    <div v-else class="text-center py-20 px-6 rounded-3xl bg-[#181B23] border border-white/10">
      <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#91E3C7]">
        <Check class="w-7 h-7" />
      </div>
      <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">¡Bandeja de moderación al día!</h3>
      <p class="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
        No hay propuestas pendientes de revisión en Cloud Firestore. Todos los eventos subidos por la comunidad han sido procesados.
      </p>
    </div>

    <!-- Auth Modal -->
    <AuthModal
      v-if="isAuthModalOpen"
      @close="isAuthModalOpen = false"
    />
  </div>
</template>
