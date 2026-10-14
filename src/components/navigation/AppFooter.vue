<script setup lang="ts">
import { isFirebaseConfigured } from '../../services/firebase/config';
</script>

<template>
  <footer class="w-full mt-20 border-t border-white/10 bg-[#0B0E15]/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/5">
        <!-- Brand & Mission -->
        <div class="md:col-span-2 flex flex-col gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#172B46] to-[#374A66] border border-white/20 flex items-center justify-center">
              <span class="text-sm">✨</span>
            </div>
            <span class="font-bold text-xl text-white font-['Plus_Jakarta_Sans']">¿Y hoy?</span>
          </div>
          <p class="text-sm text-gray-400 max-w-sm leading-relaxed">
            Plataforma de descubrimiento cultural y comunitario en el litoral argentino. Diseñada para responder la pregunta de todos los días de forma simple y bella: ¿qué hacemos hoy?
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-[#91E3C7]">
              Corrientes
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-[#B6E3F5]">
              Resistencia, Chaco
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-gray-400">
              Costa del Paraná
            </span>
          </div>
        </div>

        <!-- Links -->
        <div class="flex flex-col gap-2.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-[#FFC69D]">Descubrimiento</span>
          <router-link to="/explorar" class="text-sm text-gray-400 hover:text-white transition-colors">Cartelera Completa</router-link>
          <router-link to="/explorar?price=free" class="text-sm text-gray-400 hover:text-white transition-colors">Actividades Gratuitas</router-link>
          <router-link to="/explorar?date=weekend" class="text-sm text-gray-400 hover:text-white transition-colors">Este Fin de Semana</router-link>
          <router-link to="/favoritos" class="text-sm text-gray-400 hover:text-white transition-colors">Mis Guardados</router-link>
        </div>

        <!-- Community & Legal -->
        <div class="flex flex-col gap-2.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-[#91E3C7]">Comunidad</span>
          <router-link to="/publicar" class="text-sm text-gray-400 hover:text-white transition-colors">Subir una actividad</router-link>
          <span class="text-sm text-gray-400">Criterio curatorial</span>
          <span class="text-sm text-gray-400">Verificación de fuentes</span>
          <span class="text-sm text-gray-400">Contacto & Sugerencias</span>
        </div>
      </div>

      <!-- Bottom status strip -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div>
          © 2026 ¿Y hoy? — Cartelera cultural y comunitaria de Corrientes y Chaco.
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="isFirebaseConfigured ? 'bg-[#91E3C7]' : 'bg-amber-400 animate-pulse'"></span>
          <span>
            {{ isFirebaseConfigured ? 'Firebase Firestore configurado' : 'Firebase pendiente de credenciales (.env)' }}
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
