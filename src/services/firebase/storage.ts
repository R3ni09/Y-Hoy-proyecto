import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export interface StorageUploadResult {
  downloadURL: string;
  storagePath: string;
}

export interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];

export class FirebaseStorageService {
  /**
   * Validates file size and MIME type before upload
   */
  validateImage(file: File, options?: ImageValidationOptions): void {
    const maxSizeMB = options?.maxSizeMB ?? 5;
    const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Formato no permitido (${file.type}). Por favor usá JPG, PNG o WebP.`);
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`La imagen supera el límite de ${maxSizeMB} MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
    }
  }

  /**
   * Upload an image to Firebase Storage with progress callback
   */
  async uploadFile(
    path: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<StorageUploadResult> {
    if (!isFirebaseConfigured || !storage) {
      throw new Error('Firebase Storage no está configurado. Verificá las credenciales del proyecto.');
    }

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      cacheControl: 'public,max-age=31536000',
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(percent));
          }
        },
        (error) => {
          console.error('[Storage Error]', error);
          reject(new Error(`Error al subir imagen a Storage: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadURL,
              storagePath: path
            });
          } catch (err: any) {
            reject(new Error(`Error al obtener URL de descarga: ${err.message}`));
          }
        }
      );
    });
  }

  /**
   * Uploads an event cover/poster image
   */
  async uploadEventImage(
    file: File,
    eventId: string = `evt_${Date.now()}`,
    onProgress?: (percent: number) => void
  ): Promise<StorageUploadResult> {
    this.validateImage(file, { maxSizeMB: 6 });
    const cleanExt = file.name.split('.').pop() || 'jpg';
    const filename = `cover_${Date.now()}.${cleanExt}`;
    const path = `events/${eventId}/${filename}`;
    return await this.uploadFile(path, file, onProgress);
  }

  /**
   * Uploads an organizer logo or cover
   */
  async uploadOrganizerImage(
    file: File,
    organizerId: string,
    type: 'logo' | 'cover' = 'logo',
    onProgress?: (percent: number) => void
  ): Promise<StorageUploadResult> {
    this.validateImage(file, { maxSizeMB: 4 });
    const cleanExt = file.name.split('.').pop() || 'jpg';
    const path = `organizers/${organizerId}/${type}_${Date.now()}.${cleanExt}`;
    return await this.uploadFile(path, file, onProgress);
  }

  /**
   * Uploads a user avatar
   */
  async uploadUserAvatar(
    file: File,
    userId: string,
    onProgress?: (percent: number) => void
  ): Promise<StorageUploadResult> {
    this.validateImage(file, { maxSizeMB: 2 });
    const cleanExt = file.name.split('.').pop() || 'jpg';
    const path = `users/${userId}/avatar_${Date.now()}.${cleanExt}`;
    return await this.uploadFile(path, file, onProgress);
  }

  /**
   * Deletes a file from Storage by path (safe deletion)
   */
  async deleteFile(path: string): Promise<void> {
    if (!isFirebaseConfigured || !storage || !path) return;
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn('Could not delete storage file:', path, e);
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
