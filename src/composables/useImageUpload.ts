import { ref } from 'vue';
import { firebaseStorageService } from '../services/firebase/storage';

export function useImageUpload() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref<string | null>(null);

  async function uploadEventPoster(file: File, eventId?: string): Promise<string> {
    isUploading.value = true;
    uploadProgress.value = 0;
    uploadError.value = null;

    try {
      const result = await firebaseStorageService.uploadEventImage(file, eventId, (pct) => {
        uploadProgress.value = pct;
      });
      return result.downloadURL;
    } catch (err: any) {
      uploadError.value = err.message || 'Error al subir la imagen a Storage';
      throw err;
    } finally {
      isUploading.value = false;
    }
  }

  async function uploadOrganizerLogo(file: File, organizerId: string): Promise<string> {
    isUploading.value = true;
    uploadProgress.value = 0;
    uploadError.value = null;

    try {
      const result = await firebaseStorageService.uploadOrganizerImage(file, organizerId, 'logo', (pct) => {
        uploadProgress.value = pct;
      });
      return result.downloadURL;
    } catch (err: any) {
      uploadError.value = err.message || 'Error al subir el logo';
      throw err;
    } finally {
      isUploading.value = false;
    }
  }

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadEventPoster,
    uploadOrganizerLogo,
  };
}
