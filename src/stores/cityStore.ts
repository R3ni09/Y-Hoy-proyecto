import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { City } from '../types';
import { citiesRepository } from '../repositories/cities.repository';

export const useCityStore = defineStore('city', () => {
  const cities = ref<City[]>([]);
  const selectedCityId = ref<string>('all'); // 'all' | 'corrientes' | 'resistencia' | etc.
  const isLoading = ref<boolean>(false);

  async function fetchCities() {
    isLoading.value = true;
    try {
      const data = await citiesRepository.getCities();
      if (data && data.length > 0) {
        cities.value = data;
      }
    } catch (err) {
      console.warn('Could not load cities from Firestore:', err);
    } finally {
      isLoading.value = false;
    }
  }

  function setCity(cityId: string) {
    selectedCityId.value = cityId;
  }

  // Pre-load cities on initialization
  fetchCities();

  return {
    cities,
    selectedCityId,
    isLoading,
    fetchCities,
    setCity
  };
});
