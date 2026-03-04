import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SignatureResult {
  base64: string;
  timestamp: string;
  signerName?: string;
}

export interface SignatureValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valider une signature Base64
 */
export function validateSignature(base64: string): SignatureValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifier non vide
  if (!base64 || base64.length < 100) {
    errors.push('Signature trop courte ou vide');
    return { isValid: false, errors, warnings };
  }

  // Vérifier format Base64
  const base64Regex = /^data:image\/(png|jpeg);base64,/;
  if (!base64Regex.test(base64)) {
    errors.push('Format de signature invalide');
    return { isValid: false, errors, warnings };
  }

  // Vérifier taille (< 100 KB)
  const sizeInBytes = (base64.length * 3) / 4;
  if (sizeInBytes > 100000) {
    warnings.push('Signature volumineuse (> 100 KB)');
  }

  // Vérifier longueur minimale (signature pas juste un point)
  const dataLength = base64.split(',')[1]?.length || 0;
  if (dataLength < 500) {
    warnings.push('Signature très courte, vérifier lisibilité');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Convertir Base64 en fichier PNG local
 * Note: Pour simplifier, on retourne directement le Base64
 * En production, utiliser FileSystem pour créer un fichier temporaire
 */
export async function convertBase64ToPNG(
  base64: string,
  filename: string
): Promise<string> {
  try {
    // Pour l'instant, retourner le Base64 directement
    // En production, créer un fichier temporaire avec FileSystem
    console.log('[SignatureService] Using Base64 directly for:', filename);
    return base64;
  } catch (error) {
    console.error('[SignatureService] Conversion error:', error);
    throw error;
  }
}

/**
 * Sauvegarder une signature localement pour upload ultérieur
 */
export async function saveSignatureLocally(
  signature: SignatureResult,
  parcelId: string
): Promise<string> {
  try {
    const key = `pending_signature_${parcelId}_${Date.now()}`;
    await AsyncStorage.setItem(key, JSON.stringify(signature));
    console.log('[SignatureService] Signature saved locally:', key);
    return key;
  } catch (error) {
    console.error('[SignatureService] Save error:', error);
    throw error;
  }
}

/**
 * Récupérer les signatures en attente d'upload
 */
export async function getPendingSignatures(): Promise<{ key: string; signature: SignatureResult; parcelId: string }[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pendingKeys = keys.filter(k => k.startsWith('pending_signature_'));
    
    const signatures = await Promise.all(
      pendingKeys.map(async (key) => {
        const data = await AsyncStorage.getItem(key);
        if (!data) return null;
        
        const signature = JSON.parse(data) as SignatureResult;
        const parcelId = key.split('_')[2]; // Extract parcelId from key
        
        return { key, signature, parcelId };
      })
    );

    return signatures.filter(Boolean) as { key: string; signature: SignatureResult; parcelId: string }[];
  } catch (error) {
    console.error('[SignatureService] Get pending error:', error);
    return [];
  }
}

/**
 * Supprimer une signature locale après upload réussi
 */
export async function deletePendingSignature(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    console.log('[SignatureService] Signature deleted:', key);
  } catch (error) {
    console.error('[SignatureService] Delete error:', error);
  }
}

/**
 * Uploader une signature vers le serveur
 */
export async function uploadSignature(
  signature: SignatureResult,
  parcelId: string,
  driverId: string,
  token?: string
): Promise<string> {
  try {
    // Pour simplifier, envoyer directement le Base64
    // En production, convertir en fichier et utiliser FormData
    
    const payload = {
      signature: signature.base64,
      parcelId,
      driverId,
      timestamp: signature.timestamp,
      signerName: signature.signerName,
    };

    const apiUrl = process.env.EXPO_PUBLIC_DOMAIN || 'http://localhost:5080';
    const response = await fetch(`${apiUrl}/api/upload/signature`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('[SignatureService] Upload success:', result.signatureUrl);
    
    return result.signatureUrl;
  } catch (error) {
    console.error('[SignatureService] Upload error:', error);
    throw error;
  }
}

/**
 * Synchroniser les signatures en attente
 */
export async function syncPendingSignatures(
  driverId: string,
  token?: string
): Promise<number> {
  try {
    const pending = await getPendingSignatures();
    let synced = 0;

    for (const { key, signature, parcelId } of pending) {
      try {
        await uploadSignature(signature, parcelId, driverId, token);
        await deletePendingSignature(key);
        synced++;
      } catch {
        console.error('[SignatureService] Sync failed for:', key);
        // Garder pour plus tard
      }
    }

    console.log(`[SignatureService] Synced ${synced}/${pending.length} signatures`);
    return synced;
  } catch (error) {
    console.error('[SignatureService] Sync error:', error);
    return 0;
  }
}

/**
 * Calculer un hash de la signature pour audit trail
 */
export async function calculateSignatureHash(base64: string): Promise<string> {
  try {
    const base64Data = base64.split(',')[1] || base64;
    // Simple hash pour demo (en production, utiliser crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < base64Data.length; i++) {
      const char = base64Data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.error('[SignatureService] Hash error:', error);
    return '';
  }
}
