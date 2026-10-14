import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CulturalEvent, FilterState, Category } from '../types';
import { eventsRepository } from '../repositories/events.repository';
import { categoriesRepository } from '../repositories/categories.repository';
import { moderationRepository } from '../repositories/moderation.repository';

export const useEventsStore = defineStore('events', () => {
  const events = ref<CulturalEvent[]>([]);
  const pendingEvents = ref<CulturalEvent[]>([]);
  const categories = ref<Category[]>([]);
  const isLoading = ref<boolean>(false);
  const isCategoriesLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const filters = ref<FilterState>({
    searchQuery: '',
    cityId: 'all',
    dateFilter: 'all',
    categoryId: 'all',
    priceFilter: 'all',
    tags: []
  });

  const activeEventsCount = computed(() => events.value.length);

  async function fetchCategories() {
    isCategoriesLoading.value = true;
    try {
      const cats = await categoriesRepository.getCategories();
      if (cats && cats.length > 0) {
        categories.value = cats;
      }
    } catch (err: any) {
      console.warn('Could not load categories from Firestore:', err);
    } finally {
      isCategoriesLoading.value = false;
    }
  }

  async function fetchPublishedEvents() {
    isLoading.value = true;
    error.value = null;
    try {
      events.value = await eventsRepository.getPublishedEvents(filters.value);
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los eventos desde Firestore.';
      events.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPendingEvents() {
    try {
      pendingEvents.value = await moderationRepository.getPendingReviewEvents();
    } catch (err: any) {
      console.error('Error fetching pending events from Firestore:', err);
      pendingEvents.value = [];
    }
  }

  async function getEventById(id: string): Promise<CulturalEvent | null> {
    return await eventsRepository.getEventById(id);
  }

  async function submitEvent(data: Omit<CulturalEvent, 'id' | 'createdAt' | 'updatedAt'>, authorUid?: string) {
    const created = await eventsRepository.createEvent(data, authorUid);
    await fetchPublishedEvents();
    await fetchPendingEvents();
    return created;
  }

  async function approveEvent(id: string, reviewerUid: string) {
    await moderationRepository.approveEvent(id, reviewerUid);
    await fetchPublishedEvents();
    await fetchPendingEvents();
  }

  async function rejectEvent(id: string, reason: string, reviewerUid: string) {
    await moderationRepository.rejectEvent(id, reason, reviewerUid);
    await fetchPublishedEvents();
    await fetchPendingEvents();
  }

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    filters.value[key] = value;
    fetchPublishedEvents();
  }

  function resetFilters() {
    filters.value = {
      searchQuery: '',
      cityId: 'all',
      dateFilter: 'all',
      categoryId: 'all',
      priceFilter: 'all',
      tags: []
    };
    fetchPublishedEvents();
  }

  // Pre-load categories on startup
  fetchCategories();

  return {
    events,
    pendingEvents,
    categories,
    isLoading,
    isCategoriesLoading,
    error,
    filters,
    activeEventsCount,
    fetchCategories,
    fetchPublishedEvents,
    fetchPendingEvents,
    getEventById,
    submitEvent,
    approveEvent,
    rejectEvent,
    setFilter,
    resetFilters
  };
});
