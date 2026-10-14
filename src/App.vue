<script setup lang="ts">
import AppHeader from './components/navigation/AppHeader.vue';
import AppFooter from './components/navigation/AppFooter.vue';
</script>

<template>
  <div class="min-h-screen bg-[#10131B] text-[#E0E2ED] flex flex-col relative overflow-x-hidden">
    <!-- Atmospheric Ambient Glows (Gentle, low opacity backdrop) -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#172B46]/25 blur-[140px]"></div>
      <div class="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-[#91E3C7]/10 blur-[150px]"></div>
      <div class="absolute top-2/3 left-1/4 w-[450px] h-[450px] rounded-full bg-[#FFC69D]/8 blur-[160px]"></div>
    </div>

    <!-- Global App Header -->
    <AppHeader />

    <!-- Main Content View -->
    <main class="flex-1 relative z-10">
      <router-view />
    </main>

    <!-- Global App Footer -->
    <AppFooter />
  </div>
</template>
