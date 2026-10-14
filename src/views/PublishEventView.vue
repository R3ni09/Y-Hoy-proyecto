<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventsStore } from '../stores/eventsStore';
import { useCityStore } from '../stores/cityStore';
import { useUserStore } from '../stores/userStore';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Link as LinkIcon
} from 'lucide-vue-next';

const eventsStore = useEventsStore();
const cityStore = useCityStore();
const userStore = useUserStore();

const currentStep = ref(1);
const isSubmitting = ref(false);
const isSuccess = ref(false);
const submitError = ref<string | null>(null);

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop';

// Form model
const form = ref({
  title: '',
  summary: '',
  description: '',
  categoryId: '',
  cityId: 'corrientes',
  venueName: '',
  address: '',
  date: '',
  time: '20:00',
  priceType: 'free' as 'free' | 'paid',
  priceMin: 0,
  ticketUrl: '',
  organizerName: '',
  organizerType: 'artist' as 'artist' | 'venue' | 'collective' | 'institution',
  imageURL: '',
  tags: 'Chamamé, En vivo, Costanera'
});

onMounted(async () => {
  await Promise.all([
    eventsStore.fetchCategories(),
    cityStore.fetchCities()
  ]);

  if (eventsStore.categories.length > 0 && !form.value.categoryId) {
    form.value.categoryId = eventsStore.categories[0].id;
  }
  if (cityStore.cities.length > 0 && !form.value.cityId) {
    form.value.cityId = cityStore.cities[0].id;
  }
  const profileName = userStore.user?.displayName;
  if (profileName && profileName !== 'Visitante Cultural') {
    form.value.organizerName = profileName;
  }
});

async function handleSubmit() {
  isSubmitting.value = true;
  submitError.value = null;

  try {
    const finalImageURL = form.value.imageURL.trim() || DEFAULT_IMAGE_URL;

    const selectedCategory = eventsStore.categories.find(c => c.id === form.value.categoryId);
    const selectedCity = cityStore.cities.find(c => c.id === form.value.cityId);

    const startDateTime = form.value.date
      ? `${form.value.date}T${form.value.time}:00`
      : new Date().toISOString();

    const newEventData = {
      title: form.value.title.trim(),
      slug: form.value.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: form.value.summary.trim() || form.value.title.trim(),
      description: form.value.description.trim() || form.value.summary.trim() || form.value.title.trim(),
      categoryId: form.value.categoryId || 'musica',
      categoryName: selectedCategory?.name || 'Música en Vivo',
      categoryEmoji: selectedCategory?.emoji || '🎵',
      organizerId: userStore.visitorId,
      organizerName: form.value.organizerName.trim() || userStore.user?.displayName || 'Organizador Independiente',
      organizerType: form.value.organizerType,
      cityId: form.value.cityId,
      cityName: selectedCity?.name || 'Corrientes',
      venueName: form.value.venueName.trim() || 'Espacio Cultural',
      address: form.value.address.trim() || 'Corrientes Capital',
      coordinates: selectedCity?.coordinates || { lat: -27.4698, lng: -58.8344 },
      startAt: startDateTime,
      timeDisplay: `${form.value.date || 'Próximamente'} · ${form.value.time} hs`,
      dateBadge: form.value.date ? form.value.date.split('-').slice(1).join('/') : 'Próximamente',
      priceType: form.value.priceType,
      priceMin: form.value.priceType === 'paid' ? Number(form.value.priceMin) : undefined,
      priceDisplay: form.value.priceType === 'free' ? 'Gratis' : `$${form.value.priceMin}`,
      ticketUrl: form.value.ticketUrl.trim() || undefined,
      imageURL: finalImageURL,
      tags: form.value.tags.split(',').map(t => t.trim()).filter(Boolean),
      verificationStatus: 'pending' as const,
      publicationStatus: 'pending_review' as const,
      sourceType: 'community' as const,
      attendeesCount: 0,
      savesCount: 0,
    };

    // Community proposals always enter the moderation queue first. If the curation
    // mode is unlocked, approve immediately (same flow as the moderation panel).
    const created = await eventsStore.submitEvent(newEventData, userStore.visitorId);
    if (userStore.isCurator && created?.id) {
      await eventsStore.approveEvent(created.id, userStore.visitorId);
    }
    isSuccess.value = true;
  } catch (err: any) {
    console.error('Error submitting event to Firestore:', err);
    submitError.value = err.message || 'Error al guardar la propuesta en la base de datos.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <!-- Header -->
    <div class="mb-8 text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#FFC69D] mb-3">
        <Sparkles class="w-3.5 h-3.5" />
        <span>Comunidad de Artistas y Espacios del Litoral</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
        Publicar una actividad o evento
      </h1>
      <p class="text-sm sm:text-base text-gray-400 mt-2">
        Llegá a miles de personas que buscan qué hacer hoy en Corrientes y Chaco. Tu propuesta se almacena en Cloud Firestore y pasa por curaduría antes de publicarse.
      </p>
    </div>

    <!-- Stepper indicator -->
    <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
      <div
        class="p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-1"
        :class="currentStep === 1 ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-md' : 'bg-white/5 border-white/10 text-gray-400'"
      >
        <span class="text-xs uppercase tracking-wider">Paso 1</span>
        <span class="text-xs sm:text-sm truncate">Información básica</span>
      </div>
      <div
        class="p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-1"
        :class="currentStep === 2 ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-md' : 'bg-white/5 border-white/10 text-gray-400'"
      >
        <span class="text-xs uppercase tracking-wider">Paso 2</span>
        <span class="text-xs sm:text-sm truncate">Fecha y lugar</span>
      </div>
      <div
        class="p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-1"
        :class="currentStep === 3 ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-md' : 'bg-white/5 border-white/10 text-gray-400'"
      >
        <span class="text-xs uppercase tracking-wider">Paso 3</span>
        <span class="text-xs sm:text-sm truncate">Entradas & afiche</span>
      </div>
    </div>

    <!-- Error message if submit failed -->
    <div
      v-if="submitError"
      class="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-xs sm:text-sm text-red-200"
    >
      <AlertCircle class="w-5 h-5 text-red-400 shrink-0" />
      <span>{{ submitError }}</span>
    </div>

    <!-- Success State -->
    <div v-if="isSuccess" class="p-8 sm:p-12 rounded-3xl bg-[#181B23] border border-white/10 text-center shadow-2xl space-y-4">
      <div class="w-16 h-16 rounded-full bg-[#006751]/40 border border-[#91E3C7] flex items-center justify-center text-[#91E3C7] mx-auto mb-2">
        <CheckCircle class="w-8 h-8" />
      </div>
      <h2 class="text-2xl font-bold text-white font-['Plus_Jakarta_Sans']">
        {{ userStore.isCurator ? '¡Evento aprobado y publicado en vivo!' : '¡Evento enviado a revisión!' }}
      </h2>
      <p class="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
        {{ userStore.isCurator ? 'Como curador, el evento fue aprobado y sincronizado inmediatamente en Cloud Firestore.' : 'Tu publicación quedó guardada con estado pendiente de revisión en Firestore. El equipo local de curaduría verificará los detalles en breve.' }}
      </p>
      <div class="pt-4 flex items-center justify-center gap-3">
        <router-link
          to="/explorar"
          class="px-6 py-3 rounded-xl bg-[#FFC69D] text-[#172B46] font-bold text-sm hover:bg-[#FFDCC4] transition-all"
        >
          Ir a Explorar
        </router-link>
        <button
          @click="isSuccess = false; currentStep = 1; form.title = ''; form.imageURL = '';"
          class="px-6 py-3 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-all"
        >
          Cargar otro evento
        </button>
      </div>
    </div>

    <!-- Form Container -->
    <form v-else @submit.prevent class="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
      <!-- Step 1: Basic Info -->
      <div v-if="currentStep === 1" class="space-y-5 animate-in fade-in">
        <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] border-b border-white/10 pb-3">
          1. ¿De qué se trata la propuesta?
        </h3>

        <!-- Who publishes -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-2">¿Quién publica el evento?</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              @click="form.organizerType = 'artist'"
              class="p-3 rounded-2xl border text-xs sm:text-sm flex flex-col items-center gap-1.5 transition-all"
              :class="form.organizerType === 'artist' ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-md' : 'bg-white/5 border-white/10 text-gray-300'"
            >
              <span class="text-xl">👤</span>
              <span>Artista / Particular</span>
            </button>
            <button
              type="button"
              @click="form.organizerType = 'venue'"
              class="p-3 rounded-2xl border text-xs sm:text-sm flex flex-col items-center gap-1.5 transition-all"
              :class="form.organizerType === 'venue' ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-md' : 'bg-white/5 border-white/10 text-gray-300'"
            >
              <span class="text-xl">🏛️</span>
              <span>Espacio / Sala</span>
            </button>
            <button
              type="button"
              @click="form.organizerType = 'collective'"
              class="p-3 rounded-2xl border text-xs sm:text-sm flex flex-col items-center gap-1.5 transition-all"
              :class="form.organizerType === 'collective' ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-md' : 'bg-white/5 border-white/10 text-gray-300'"
            >
              <span class="text-xl">🎪</span>
              <span>Colectivo / Feria</span>
            </button>
            <button
              type="button"
              @click="form.organizerType = 'institution'"
              class="p-3 rounded-2xl border text-xs sm:text-sm flex flex-col items-center gap-1.5 transition-all"
              :class="form.organizerType === 'institution' ? 'bg-[#FFC69D] text-[#172B46] border-[#FFC69D] font-bold shadow-md' : 'bg-white/5 border-white/10 text-gray-300'"
            >
              <span class="text-xl">🏢</span>
              <span>Institución / Club</span>
            </button>
          </div>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Nombre o título del evento *</label>
          <input
            v-model="form.title"
            required
            type="text"
            placeholder="Ej: Recital acústico bajo los árboles, Taller abierto de cerámica..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFC69D]/50 text-sm"
          />
        </div>

        <!-- Organizer name -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Nombre del organizador o banda *</label>
          <input
            v-model="form.organizerName"
            required
            type="text"
            placeholder="Ej: Colectivo Río Abierto / Banda Guaraní"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFC69D]/50 text-sm"
          />
        </div>

        <!-- Category & City -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Categoría principal</label>
            <select
              v-model="form.categoryId"
              class="w-full px-4 py-3 rounded-xl bg-[#181B23] border border-white/10 text-white text-sm focus:outline-none"
            >
              <option v-for="c in eventsStore.categories" :key="c.id" :value="c.id">
                {{ c.emoji }} {{ c.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Zona / Ciudad</label>
            <select
              v-model="form.cityId"
              class="w-full px-4 py-3 rounded-xl bg-[#181B23] border border-white/10 text-white text-sm focus:outline-none"
            >
              <option v-for="city in cityStore.cities" :key="city.id" :value="city.id">
                {{ city.name }} ({{ city.province }})
              </option>
            </select>
          </div>
        </div>

        <!-- Summary -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Resumen breve (para la tarjeta de inicio)</label>
          <input
            v-model="form.summary"
            maxlength="140"
            type="text"
            placeholder="Una línea breve describiendo la propuesta..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFC69D]/50 text-sm"
          />
        </div>

        <!-- Full description -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Descripción completa</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Contá más sobre los artistas, cronograma, recomendaciones..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFC69D]/50 text-sm"
          ></textarea>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="button"
            :disabled="!form.title"
            @click="currentStep = 2"
            class="px-6 py-2.5 rounded-xl bg-[#FFC69D] text-[#172B46] font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#FFDCC4] transition-all disabled:opacity-50"
          >
            <span>Continuar a Fecha y Lugar</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 2: Date & Place -->
      <div v-else-if="currentStep === 2" class="space-y-5 animate-in fade-in">
        <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] border-b border-white/10 pb-3">
          2. Fecha, horario y ubicación
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Día del evento *</label>
            <input
              v-model="form.date"
              required
              type="date"
              class="w-full px-4 py-3 rounded-xl bg-[#181B23] border border-white/10 text-white text-sm focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Hora de inicio *</label>
            <input
              v-model="form.time"
              required
              type="time"
              class="w-full px-4 py-3 rounded-xl bg-[#181B23] border border-white/10 text-white text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Nombre del lugar o sala *</label>
          <input
            v-model="form.venueName"
            required
            type="text"
            placeholder="Ej: Parque Cambá Cuá, Espacio Mariño, Playa Arazaty..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFC69D]/50 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Dirección o punto de encuentro *</label>
          <input
            v-model="form.address"
            required
            type="text"
            placeholder="Ej: Carlos Pellegrini y San Luis / Costanera Sur"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFC69D]/50 text-sm"
          />
        </div>

        <div class="flex justify-between pt-2">
          <button
            type="button"
            @click="currentStep = 1"
            class="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs sm:text-sm flex items-center gap-1.5 hover:bg-white/15"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver</span>
          </button>
          <button
            type="button"
            :disabled="!form.venueName || !form.address"
            @click="currentStep = 3"
            class="px-6 py-2.5 rounded-xl bg-[#FFC69D] text-[#172B46] font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#FFDCC4] transition-all disabled:opacity-50"
          >
            <span>Continuar a Modalidad y Foto</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 3: Access & Storage Image Upload -->
      <div v-else-if="currentStep === 3" class="space-y-5 animate-in fade-in">
        <h3 class="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] border-b border-white/10 pb-3">
          3. Modalidad de acceso, afiche y envío
        </h3>

        <!-- Free vs Paid toggle -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-2">Tipo de entrada</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              @click="form.priceType = 'free'"
              class="p-4 rounded-2xl border text-left flex items-start gap-3 transition-all"
              :class="form.priceType === 'free' ? 'bg-[#181B23] border-[#91E3C7] ring-1 ring-[#91E3C7]' : 'bg-white/5 border-white/10 text-gray-400'"
            >
              <span class="text-2xl">🎁</span>
              <div>
                <p class="text-sm font-bold text-white">Entrada Libre / Gratuita</p>
                <p class="text-xs text-gray-400 mt-0.5">Sin ticket previo o a la gorra voluntaria.</p>
              </div>
            </button>

            <button
              type="button"
              @click="form.priceType = 'paid'"
              class="p-4 rounded-2xl border text-left flex items-start gap-3 transition-all"
              :class="form.priceType === 'paid' ? 'bg-[#181B23] border-[#FFC69D] ring-1 ring-[#FFC69D]' : 'bg-white/5 border-white/10 text-gray-400'"
            >
              <span class="text-2xl">🎟️</span>
              <div>
                <p class="text-sm font-bold text-white">Con Entrada / Venta</p>
                <p class="text-xs text-gray-400 mt-0.5">Anticipadas o cobro en puerta.</p>
              </div>
            </button>
          </div>
        </div>

        <div v-if="form.priceType === 'paid'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Valor aproximado ($ ARS)</label>
            <input
              v-model="form.priceMin"
              type="number"
              placeholder="Ej: 3500"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Enlace de venta o reservas</label>
            <input
              v-model="form.ticketUrl"
              type="url"
              placeholder="https://passline.com/..."
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
            />
          </div>
        </div>

        <!-- Event poster: image URL (Firebase Storage was removed; only Hosting + Firestore) -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-2">Afiche o foto de portada (URL de la imagen)</label>

          <div class="flex flex-col sm:flex-row gap-4 items-center">
            <div class="w-full flex-1">
              <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#FFC69D]/50 focus-within:bg-white/10 transition-colors">
                <LinkIcon class="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  v-model="form.imageURL"
                  type="url"
                  placeholder="https://ejemplo.com/mi-afiche.jpg"
                  class="w-full bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <p class="text-[11px] text-gray-400 mt-1.5">
                Pegá el enlace web de tu imagen (Drive, redes sociales, CDN). Si lo dejás vacío, usamos una imagen genérica según la categoría.
              </p>
            </div>

            <!-- Preview -->
            <div
              v-if="form.imageURL"
              class="w-32 h-32 rounded-2xl overflow-hidden bg-black/40 border border-white/15 relative shrink-0"
            >
              <img
                :src="form.imageURL"
                alt="Vista previa del afiche"
                class="w-full h-full object-cover"
              />
              <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-[#91E3C7]">
                Vista previa
              </span>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Etiquetas (separadas por coma)</label>
          <input
            v-model="form.tags"
            type="text"
            placeholder="Chamamé, Rock, Río, Costanera..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none text-sm"
          />
        </div>

        <div class="flex justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            @click="currentStep = 2"
            class="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs sm:text-sm flex items-center gap-1.5 hover:bg-white/15"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver</span>
          </button>

          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit"
            class="px-8 py-3 rounded-xl bg-[#FFC69D] text-[#172B46] font-bold text-sm shadow-[0_0_20px_rgba(255,198,157,0.35)] hover:bg-[#FFDCC4] transition-all active:scale-[0.99] disabled:opacity-50 font-['Plus_Jakarta_Sans']"
          >
            <span v-if="isSubmitting">Guardando en Firestore...</span>
            <span v-else>{{ userStore.isCurator ? 'Aprobar y Publicar en Vivo' : 'Enviar propuesta a revisión' }}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
