<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { X, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, CheckCircle } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();

const mode = ref<'login' | 'register' | 'reset'>('login');
const email = ref('');
const password = ref('');
const displayName = ref('');
const localError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isSubmitting = ref(false);

async function handleGoogleLogin() {
  localError.value = null;
  isSubmitting.value = true;
  try {
    await authStore.loginWithGoogle();
    emit('close');
  } catch (err: any) {
    localError.value = err.message || 'Error al conectar con Google.';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleSubmit() {
  localError.value = null;
  successMessage.value = null;
  isSubmitting.value = true;

  try {
    if (mode.value === 'login') {
      await authStore.loginWithEmail(email.value, password.value);
      emit('close');
    } else if (mode.value === 'register') {
      if (!displayName.value.trim()) {
        throw new Error('Por favor ingresá tu nombre completo.');
      }
      if (password.value.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }
      await authStore.registerWithEmail(email.value, password.value, displayName.value);
      emit('close');
    } else if (mode.value === 'reset') {
      if (!email.value.trim()) {
        throw new Error('Ingresá tu correo electrónico para restablecer la contraseña.');
      }
      await authStore.resetPassword(email.value);
      successMessage.value = '¡Te enviamos un enlace para restablecer tu contraseña! Revisá tu casilla de correo.';
    }
  } catch (err: any) {
    // Translate common Firebase Auth errors
    const msg = err.message || '';
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      localError.value = 'Correo electrónico o contraseña incorrectos.';
    } else if (msg.includes('auth/email-already-in-use')) {
      localError.value = 'Este correo electrónico ya está registrado.';
    } else if (msg.includes('auth/weak-password')) {
      localError.value = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (msg.includes('auth/invalid-email')) {
      localError.value = 'El formato del correo electrónico no es válido.';
    } else {
      localError.value = msg || 'Ocurrió un error inesperado al procesar la solicitud.';
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
    <div
      class="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-modal border border-white/15 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left"
    >
      <!-- Close button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Title -->
      <div class="mb-6">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#FFC69D] mb-2">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Comunidad Cultural ¿Y hoy?</span>
        </div>
        <h2 class="text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
          {{ mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña' }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-400 mt-1">
          {{ mode === 'login' ? 'Accedé para guardar tus eventos favoritos y publicar propuestas.' : mode === 'register' ? 'Unite a la comunidad cultural de Corrientes y Chaco.' : 'Ingresá tu correo para recibir las instrucciones de recuperación.' }}
        </p>
      </div>

      <!-- Error feedback -->
      <div
        v-if="localError"
        class="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in"
      >
        <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <span>{{ localError }}</span>
      </div>

      <!-- Success feedback -->
      <div
        v-if="successMessage"
        class="mb-4 p-3 rounded-xl bg-[#006751]/30 border border-[#91E3C7]/40 flex items-start gap-2.5 text-xs text-[#91E3C7] animate-in fade-in"
      >
        <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Google Sign In Button -->
      <div v-if="mode !== 'reset'" class="mb-5">
        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="isSubmitting"
          class="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 border border-white/15 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div class="relative flex items-center justify-center my-4">
          <div class="border-t border-white/10 w-full"></div>
          <span class="bg-[#141720] px-3 text-[11px] text-gray-400 uppercase tracking-wider">o con correo</span>
        </div>
      </div>

      <!-- Email / Password Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Display Name (Register only) -->
        <div v-if="mode === 'register'">
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Nombre y Apellido</label>
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#FFC69D]/50 focus-within:bg-white/10 transition-colors">
            <UserIcon class="w-4 h-4 text-gray-400" />
            <input
              v-model="displayName"
              type="text"
              required
              placeholder="Tu nombre público"
              class="w-full bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Correo electrónico</label>
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#FFC69D]/50 focus-within:bg-white/10 transition-colors">
            <Mail class="w-4 h-4 text-gray-400" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="nombre@ejemplo.com"
              class="w-full bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <!-- Password (Login & Register) -->
        <div v-if="mode !== 'reset'">
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-gray-300">Contraseña</label>
            <button
              v-if="mode === 'login'"
              type="button"
              @click="mode = 'reset'; localError = null;"
              class="text-[11px] text-[#FFC69D] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#FFC69D]/50 focus-within:bg-white/10 transition-colors">
            <Lock class="w-4 h-4 text-gray-400" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-3 px-4 rounded-xl bg-[#FFC69D] hover:bg-[#FFDCC4] text-[#172B46] font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,198,157,0.3)] active:scale-[0.99] disabled:opacity-50 mt-2 font-['Plus_Jakarta_Sans']"
        >
          <span v-if="isSubmitting">Cargando...</span>
          <span v-else-if="mode === 'login'">Ingresar</span>
          <span v-else-if="mode === 'register'">Crear cuenta gratis</span>
          <span v-else>Enviar instrucciones</span>
        </button>
      </form>

      <!-- Toggle modes -->
      <div class="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
        <template v-if="mode === 'login'">
          <span>¿No tenés una cuenta? </span>
          <button
            type="button"
            @click="mode = 'register'; localError = null;"
            class="text-[#FFC69D] font-bold hover:underline"
          >
            Registrate gratis
          </button>
        </template>
        <template v-else-if="mode === 'register'">
          <span>¿Ya tenés una cuenta? </span>
          <button
            type="button"
            @click="mode = 'login'; localError = null;"
            class="text-[#FFC69D] font-bold hover:underline"
          >
            Iniciá sesión
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            @click="mode = 'login'; localError = null; successMessage = null;"
            class="text-[#FFC69D] font-bold hover:underline"
          >
            ← Volver a Iniciar Sesión
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
