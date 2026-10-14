<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventsStore } from '../stores/eventsStore';
import { useUserStore } from '../stores/userStore';
import {
  ShieldCheck,
  Check,
  X,
  Calendar,
  MapPin,
  Lock,
  KeyRound
} from 'lucide-vue-next';

const eventsStore = useEventsStore();
const userStore = useUserStore();

const rejectionReason = ref('');
const rejectingEventId = ref<string | null>(null);
const isProcessing = ref(false);
const actionMessage = ref<string | null>(null);

// Passcode gate (demo-grade): replaces the old Firebase Auth admin check.
const adminKey = ref('');
const unlockError = ref<string | null>(null);
const isUnlocking = ref(false);

async function handleUnlock() {
  unlockError.value = null;
  isUnlocking.value = true;
  try {
    const ok = userStore.unlockCuration(adminKey.value);
    if (ok) {
      adminKey.value = '';
      await eventsStore.fetchPendingEvents();
    } else {
      unlockError.value = 'Clave incorrecta. Volvé a intentarlo.';
    }
  } catch (err: any) {
    unlockError.value = err.message || 'No se pudo desbloquear el modo curador.';
  } finally {
    isUnlocking.value = false;
  }
}

onMounted(async () => {
  if (userStore.isCurator) {
    await eventsStore.fetchPendingEvents();
  }
});

async function handleApprove(id: string) {
  isProcessing.value = true;
  actionMessage.value = null;
  try {
    await eventsStore.approveEvent(id, userStore.visitorId);
    actionMessage.value = 'Evento aprobado y publicado en cartelera.';
    setTimeout(() => { actionMessage.value = null; }, 3000);
  } catch (err: any) {
    alert(err.message || 'Error al aprobar el evento en Firestore.');
  } finally {
    isProcessing.value = false;
  }
}

async function handleReject(id: string) {
  if (!rejectionReason.value.trim()) return;
  isProcessing.value = true;
  actionMessage.value = null;
  try {
    await eventsStore.rejectEvent(id, rejectionReason.value, userStore.visitorId);
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
        <span class="text-xs text-gray-400">Modo:</span>
        <span
          class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
          :class="userStore.isCurator ? 'bg-[#91E3C7] text-[#00382B]' : 'bg-white/10 text-gray-300'"
        >
          {{ userStore.isCurator ? 'Curador' : 'Visitante' }}
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

    <!-- Passcode gate (replaces the old Firebase Auth admin check) -->
    <div v-if="!userStore.isCurator" class="p-8 sm:p-12 rounded-3xl bg-[#181B23] border border-white/10 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
      <div class="w-14 h-14 rounded-2xl bg-[#006751]/30 border border-[#91E3C7]/40 flex items-center justify-center mx-auto text-[#91E3C7]">
        <Lock class="w-6 h-6" />
      </div>
      <h3 class="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Acceso restringido</h3>
      <p class="text-xs sm:text-sm text-gray-400 leading-relaxed">
        El panel curatorial se desbloquea con la clave de curaduría configurada en el archivo <code class="text-[#91E3C7]">.env</code> (VITE_ADMIN_KEY).
        Sin Firebase Auth, esta clave es solo una barrera de demostración, no seguridad real.
      </p>
      <form @submit.prevent="handleUnlock" class="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
        <div class="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#91E3C7]/50 transition-colors text-left">
          <KeyRound class="w-4 h-4 text-gray-400 shrink-0" />
          <input
            v-model="adminKey"
            type="password"
            required
            placeholder="Clave de curador"
            class="w-full bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          :disabled="isUnlocking"
          class="px-5 py-2.5 rounded-xl bg-[#91E3C7] text-[#00382B] text-xs font-bold hover:bg-[#A9EBD6] transition-all disabled:opacity-50 shrink-0"
        >
          {{ isUnlocking ? 'Verificando...' : 'Desbloquear' }}
        </button>
      </form>
      <p v-if="unlockError" class="text-xs text-red-300">{{ unlockError }}</p>
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
  </div>
</template>
