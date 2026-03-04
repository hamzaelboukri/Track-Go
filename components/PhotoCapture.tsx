import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { typography } from '@/constants/typography';
import { capturePhoto, validatePhoto, type PhotoResult } from '@/services/imageService';

interface PhotoCaptureProps {
  onPhotoTaken: (photo: PhotoResult) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PhotoCapture({ onPhotoTaken, onCancel, disabled }: PhotoCaptureProps) {
  const { colors, isDark } = useAppTheme();
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (disabled) return;

    try {
      setIsCapturing(true);
      const result = await capturePhoto();

      if (result) {
        // Valider la photo
        const validation = validatePhoto(result);
        
        if (!validation.isValid) {
          Alert.alert(
            'Photo Non Valide',
            validation.errors.join('\n'),
            [{ text: 'Réessayer', onPress: handleCapture }]
          );
          return;
        }

        // Afficher warnings si présents
        if (validation.warnings.length > 0) {
          console.warn('[PhotoCapture] Warnings:', validation.warnings);
        }

        setPhoto(result);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('[PhotoCapture] Error:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible de capturer la photo',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleConfirm = () => {
    if (photo) {
      onPhotoTaken(photo);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Mode prévisualisation
  if (photo) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F6F6F6', borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>PRÉVISUALISATION</Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            {Math.round(photo.fileSize / 1024)} KB • {photo.width}x{photo.height}
          </Text>
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} resizeMode="contain" />
          
          {/* Guide overlay */}
          <View style={styles.guideOverlay}>
            <View style={[styles.guideCorner, styles.topLeft, { borderColor: colors.success }]} />
            <View style={[styles.guideCorner, styles.topRight, { borderColor: colors.success }]} />
            <View style={[styles.guideCorner, styles.bottomLeft, { borderColor: colors.success }]} />
            <View style={[styles.guideCorner, styles.bottomRight, { borderColor: colors.success }]} />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleRetake}
            style={[styles.actionBtn, { backgroundColor: isDark ? '#141414' : '#E5E5E5' }]}
          >
            <Ionicons name="refresh" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>REPRENDRE</Text>
          </Pressable>

          <Pressable
            onPress={handleConfirm}
            style={[styles.actionBtn, styles.confirmBtn, { backgroundColor: colors.success }]}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={[styles.actionText, { color: '#FFF' }]}>VALIDER</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Mode capture
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F6F6F6', borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="camera-outline" size={20} color={colors.text} />
          <Text style={[styles.title, { color: colors.text }]}>PHOTO DE LIVRAISON</Text>
        </View>
        {onCancel && (
          <Pressable onPress={onCancel}>
            <Ionicons name="close" size={24} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Instructions */}
      <View style={[styles.instructionsBox, { backgroundColor: colors.accent + '10' }]}>
        <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.instructionsTitle, { color: colors.accent }]}>
            PHOTO REQUISE
          </Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            Inclure : colis + porte + numéro d&apos;adresse
          </Text>
        </View>
      </View>

      {/* Guide visuel */}
      <View style={styles.guideContainer}>
        <View style={[styles.guideFrame, { borderColor: colors.border }]}>
          <View style={styles.guideContent}>
            <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.guideText, { color: colors.textTertiary }]}>
              CADRER LE COLIS
            </Text>
            <Text style={[styles.guideSubtext, { color: colors.textTertiary }]}>
              Distance : 2-3 mètres
            </Text>
          </View>
          
          {/* Coins de guidage */}
          <View style={[styles.guideCorner, styles.topLeft, { borderColor: colors.accent }]} />
          <View style={[styles.guideCorner, styles.topRight, { borderColor: colors.accent }]} />
          <View style={[styles.guideCorner, styles.bottomLeft, { borderColor: colors.accent }]} />
          <View style={[styles.guideCorner, styles.bottomRight, { borderColor: colors.accent }]} />
        </View>
      </View>

      {/* Bouton capture */}
      <Pressable
        onPress={handleCapture}
        disabled={disabled || isCapturing}
        style={({ pressed }) => [
          styles.captureBtn,
          {
            backgroundColor: disabled ? colors.border : (isDark ? colors.text : '#000'),
            opacity: pressed ? 0.8 : (disabled || isCapturing ? 0.5 : 1),
          }
        ]}
      >
        {isCapturing ? (
          <ActivityIndicator color={isDark ? colors.background : '#FFF'} />
        ) : (
          <>
            <Ionicons name="camera" size={24} color={isDark ? colors.background : '#FFF'} />
            <Text style={[styles.captureText, { color: isDark ? colors.background : '#FFF' }]}>
              PRENDRE LA PHOTO
            </Text>
          </>
        )}
      </Pressable>

      {/* Note web */}
      {Platform.OS === 'web' && (
        <Text style={[styles.webNote, { color: colors.textTertiary }]}>
          Fonctionnalité optimale sur appareil mobile
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 16,
  },
  guideContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  guideFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderWidth: 2,
    borderStyle: 'dashed',
    position: 'relative',
  },
  guideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  guideText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  guideSubtext: {
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
  },
  guideCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#000',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtn: {
    flex: 1.5,
  },
  actionText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  captureBtn: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  captureText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  webNote: {
    fontSize: 9,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
