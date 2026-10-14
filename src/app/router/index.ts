import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../../views/HomeView.vue'),
    meta: { title: '¿Y hoy? — Descubrí qué hacer en Corrientes y Chaco' },
  },
  {
    path: '/explorar',
    name: 'explore',
    component: () => import('../../views/ExploreView.vue'),
    meta: { title: 'Explorar actividades y eventos — ¿Y hoy?' },
  },
  {
    path: '/evento/:id',
    name: 'event-detail',
    component: () => import('../../views/EventDetailView.vue'),
    meta: { title: 'Detalle del Evento — ¿Y hoy?' },
  },
  {
    path: '/publicar',
    name: 'publish',
    component: () => import('../../views/PublishEventView.vue'),
    meta: { title: 'Publicar una actividad o evento — ¿Y hoy?' },
  },
  {
    path: '/favoritos',
    name: 'favorites',
    component: () => import('../../views/FavoritesView.vue'),
    meta: { title: 'Mis Planes Guardados — ¿Y hoy?' },
  },
  {
    path: '/moderacion',
    name: 'moderation',
    component: () => import('../../views/ModerationView.vue'),
    meta: { title: 'Curaduría y Moderación — ¿Y hoy?' },
  },
  {
    path: '/perfil',
    name: 'profile',
    component: () => import('../../views/ProfileView.vue'),
    meta: { title: 'Mi Perfil — ¿Y hoy?' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
});
