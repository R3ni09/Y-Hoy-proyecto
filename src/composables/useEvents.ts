import { computed } from 'vue';
import { useEventsStore } from '../stores/eventsStore';

export function useEvents() {
  const eventsStore = useEventsStore();

  const events = computed(() => eventsStore.events);
  const categories = computed(() => eventsStore.categories);
  const isLoading = computed(() => eventsStore.isLoading);
  const error = computed(() => eventsStore.error);
  const filters = computed(() => eventsStore.filters);

  return {
    events,
    categories,
    isLoading,
    error,
    filters,
    fetchPublishedEvents: eventsStore.fetchPublishedEvents,
    fetchCategories: eventsStore.fetchCategories,
    getEventById: eventsStore.getEventById,
    submitEvent: eventsStore.submitEvent,
    setFilter: eventsStore.setFilter,
    resetFilters: eventsStore.resetFilters,
  };
}
