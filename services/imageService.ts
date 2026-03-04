import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_FILE_SIZE = 500000; // 500 KB
const MAX_DIMENSION = 1920;
const TARGET_QUALITY = 0.7;
const MIN_QUALITY = 0.3;

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  timestamp: string;
}

export interface PhotoValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Demander les permissions caméra
 */
export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Capturer une photo avec la caméra
 */
export async function capturePhoto(): Promise<PhotoResult | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Permission caméra refusée');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      exif: true,
    });

    if (result.canceled) {
      return null;
    }

    const photo = result.assets[0];
    
    // Compresser et optimiser
    const optimized = await optimizePhoto(photo.uri, photo.width, photo.height);
    
    return {
      ...optimized,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[ImageService] Capture error:', error);
    throw error;
  }
}

/**
 * Optimiser une photo (compression + redimensionnement)
 */
async function optimizePhoto(
  uri: string,
  width: number,
  height: number
): Promise<Omit<PhotoResult, 'timestamp'>> {
  try {
    // 1. Redimensionner si trop grande
    const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;
    let processedUri = uri;
    let newWidth = width;
    let newHeight = height;

    if (needsResize) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      newWidth = Math.round(width * ratio);
      newHeight = Math.round(height * ratio);

      const resized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: newWidth, height: newHeight } }],
        { compress: TARGET_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
      );

      processedUri = resized.uri;
    }

    // 2. Compression progressive jusqu'à atteindre la taille cible
    let quality = TARGET_QUALITY;
    let compressed = await ImageManipulator.manipulateAsync(
      processedUri,
      [],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    const fileInfo = await FileSystem.getInfoAsync(compressed.uri);
    let fileSize = (fileInfo as any).size || 0;

    while (fileSize > MAX_FILE_SIZE && quality > MIN_QUALITY) {
      quality -= 0.1;
      compressed = await ImageManipulator.manipulateAsync(
        processedUri,
        [],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      const newFileInfo = await FileSystem.getInfoAsync(compressed.uri);
      fileSize = (newFileInfo as any).size || 0;
    }

    console.log('[ImageService] Optimized:', {
      originalSize: `${width}x${height}`,
      newSize: `${newWidth}x${newHeight}`,
      fileSize: `${Math.round(fileSize / 1024)} KB`,
      quality: quality.toFixed(1),
    });

    return {
      uri: compressed.uri,
      width: newWidth,
      height: newHeight,
      fileSize,
    };
  } catch (error) {
    console.error('[ImageService] Optimization error:', error);
    // Fallback : retourner l'image originale
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return {
      uri,
      width,
      height,
      fileSize: (fileInfo as any).size || 0,
    };
  }
}

/**
 * Valider la qualité d'une photo
 */
export function validatePhoto(photo: PhotoResult): PhotoValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifier la taille du fichier
  if (photo.fileSize > 1000000) {
    errors.push('Photo trop volumineuse (> 1 MB)');
  } else if (photo.fileSize > MAX_FILE_SIZE) {
    warnings.push('Photo volumineuse, compression recommandée');
  }

  // Vérifier la résolution
  if (photo.width < 1280 || photo.height < 960) {
    warnings.push('Résolution faible, photo peut être floue');
  }

  // Vérifier le format
  if (!photo.uri.toLowerCase().includes('.jpg') && !photo.uri.toLowerCase().includes('.jpeg')) {
    warnings.push('Format non optimal (JPEG recommandé)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sauvegarder une photo localement pour upload ultérieur
 */
export async function savePhotoLocally(
  photo: PhotoResult,
  parcelId: string
): Promise<string> {
  try {
    const key = `pending_photo_${parcelId}_${Date.now()}`;
    await AsyncStorage.setItem(key, JSON.stringify(photo));
    console.log('[ImageService] Photo saved locally:', key);
    return key;
  } catch (error) {
    console.error('[ImageService] Save error:', error);
    throw error;
  }
}

/**
 * Récupérer les photos en attente d'upload
 */
export async function getPendingPhotos(): Promise<{ key: string; photo: PhotoResult; parcelId: string }[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pendingKeys = keys.filter(k => k.startsWith('pending_photo_'));
    
    const photos = await Promise.all(
      pendingKeys.map(async (key) => {
        const data = await AsyncStorage.getItem(key);
        if (!data) return null;
        
        const photo = JSON.parse(data) as PhotoResult;
        const parcelId = key.split('_')[2]; // Extract parcelId from key
        
        return { key, photo, parcelId };
      })
    );

    return photos.filter(Boolean) as { key: string; photo: PhotoResult; parcelId: string }[];
  } catch (error) {
    console.error('[ImageService] Get pending error:', error);
    return [];
  }
}

/**
 * Supprimer une photo locale après upload réussi
 */
export async function deletePendingPhoto(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    console.log('[ImageService] Photo deleted:', key);
  } catch (error) {
    console.error('[ImageService] Delete error:', error);
  }
}

/**
 * Uploader une photo vers le serveur
 */
export async function uploadPhoto(
  photo: PhotoResult,
  parcelId: string,
  driverId: string,
  token?: string
): Promise<string> {
  try {
    const formData = new FormData();
    
    // Ajouter la photo
    formData.append('photo', {
      uri: photo.uri,
      type: 'image/jpeg',
      name: `delivery_${parcelId}_${Date.now()}.jpg`,
    } as any);

    // Ajouter les métadonnées
    formData.append('parcelId', parcelId);
    formData.append('driverId', driverId);
    formData.append('timestamp', photo.timestamp);
    formData.append('width', photo.width.toString());
    formData.append('height', photo.height.toString());
    formData.append('fileSize', photo.fileSize.toString());

    const apiUrl = process.env.EXPO_PUBLIC_DOMAIN || 'http://localhost:5080';
    const response = await fetch(`${apiUrl}/api/upload/delivery-photo`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('[ImageService] Upload success:', result.photoUrl);
    
    return result.photoUrl;
  } catch (error) {
    console.error('[ImageService] Upload error:', error);
    throw error;
  }
}

/**
 * Synchroniser les photos en attente
 */
export async function syncPendingPhotos(
  driverId: string,
  token?: string
): Promise<number> {
  try {
    const pending = await getPendingPhotos();
    let synced = 0;

    for (const { key, photo, parcelId } of pending) {
      try {
        await uploadPhoto(photo, parcelId, driverId, token);
        await deletePendingPhoto(key);
        synced++;
      } catch {
        console.error('[ImageService] Sync failed for:', key);
        // Garder pour plus tard
      }
    }

    console.log(`[ImageService] Synced ${synced}/${pending.length} photos`);
    return synced;
  } catch (error) {
    console.error('[ImageService] Sync error:', error);
    return 0;
  }
}
