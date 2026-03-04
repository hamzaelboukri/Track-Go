import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Platform } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { typography } from '@/constants/typography';
import { validateSignature, type SignatureResult } from '@/services/signatureService';

interface SignatureCaptureProps {
  onSignatureCaptured: (signature: SignatureResult) => void;
  onCancel?: () => void;
  disabled?: boolean;
  recipientName?: string;
}

export function SignatureCapture({
  onSignatureCaptured,
  onCancel,
  disabled,
  recipientName,
}: SignatureCaptureProps) {
  const { colors, isDark } = useAppTheme();
  const signatureRef = useRef<any>(null);
  const [signerName, setSignerName] = useState(recipientName || '');
  const [hasSignature, setHasSignature] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ne pas afficher sur web (WebView non supporté)
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F6F6F6', borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textTertiary }]}>
            SIGNATURE CLIENT
          </Text>
        </View>
        <Text style={[styles.webMessage, { color: colors.textSecondary }]}>
          Fonctionnalité disponible uniquement sur iOS et Android
        </Text>
      </View>
    );
  }

  const handleBegin = () => {
    setHasSignature(false);
  };

  const handleEnd = () => {
    setHasSignature(true);
    signatureRef.current?.readSignature();
  };

  const handleClear = () => {
    setHasSignature(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEmpty = () => {
    Alert.alert('Signature Vide', 'Veuillez signer avant de valider');
  };

  const handleOK = async (base64Signature: string) => {
    if (disabled) return;

    try {
      setIsProcessing(true);

      // Valider la signature
      const validation = validateSignature(base64Signature);
      
      if (!validation.isValid) {
        Alert.alert(
          'Signature Non Valide',
          validation.errors.join('\n'),
          [{ text: 'Réessayer' }]
        );
        return;
      }

      // Afficher warnings si présents
      if (validation.warnings.length > 0) {
        console.warn('[SignatureCapture] Warnings:', validation.warnings);
      }

      // Vérifier nom du signataire
      if (!signerName.trim()) {
        Alert.alert(
          'Nom Requis',
          'Veuillez saisir le nom du signataire',
          [{ text: 'OK' }]
        );
        return;
      }

      const result: SignatureResult = {
        base64: base64Signature,
        timestamp: new Date().toISOString(),
        signerName: signerName.trim(),
      };

      onSignatureCaptured(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[SignatureCapture] Error:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible de capturer la signature'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearPress = () => {
    signatureRef.current?.clearSignature();
  };

  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: 2px solid ${colors.border};
      border-radius: 0;
      margin: 0;
    }
    .m-signature-pad--body {
      border: none;
      background-color: ${isDark ? '#0A0A0A' : '#FFFFFF'};
    }
    .m-signature-pad--footer {
      display: none;
    }
    body {
      background-color: ${isDark ? '#0A0A0A' : '#F6F6F6'};
    }
  `;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F6F6F6', borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="create-outline" size={20} color={colors.text} />
          <Text style={[styles.title, { color: colors.text }]}>
            SIGNATURE CLIENT
          </Text>
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
            SIGNATURE REQUISE
          </Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            Demandez au client de signer avec son doigt
          </Text>
        </View>
      </View>

      {/* Nom du signataire */}
      <View style={styles.nameSection}>
        <Text style={[styles.label, { color: colors.textTertiary }]}>
          NOM DU SIGNATAIRE *
        </Text>
        <TextInput
          style={[
            styles.nameInput,
            {
              backgroundColor: isDark ? '#141414' : '#FFF',
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={signerName}
          onChangeText={setSignerName}
          placeholder="Nom et prénom"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
          editable={!disabled}
        />
      </View>

      {/* Canvas de signature */}
      <View style={styles.canvasContainer}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleOK}
          onEmpty={handleEmpty}
          onClear={handleClear}
          onBegin={handleBegin}
          onEnd={handleEnd}
          autoClear={false}
          descriptionText=""
          webStyle={webStyle}
          imageType="image/png"
          dataURL=""
          penColor={isDark ? '#FFFFFF' : '#000000'}
          minWidth={2}
          maxWidth={4}
          backgroundColor={isDark ? '#0A0A0A' : '#FFFFFF'}
        />
        
        {/* Guide overlay */}
        {!hasSignature && (
          <View style={styles.guideOverlay} pointerEvents="none">
            <Text style={[styles.guideText, { color: colors.textTertiary }]}>
              ✍️ Signez ici
            </Text>
          </View>
        )}
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        <Pressable
          onPress={handleClearPress}
          disabled={!hasSignature || disabled}
          style={[
            styles.controlBtn,
            {
              backgroundColor: isDark ? '#141414' : '#E5E5E5',
              opacity: (!hasSignature || disabled) ? 0.5 : 1,
            },
          ]}
        >
          <Ionicons name="refresh" size={20} color={colors.text} />
          <Text style={[styles.controlText, { color: colors.text }]}>
            EFFACER
          </Text>
        </Pressable>

        <Pressable
          onPress={() => signatureRef.current?.readSignature()}
          disabled={!hasSignature || !signerName.trim() || disabled || isProcessing}
          style={[
            styles.controlBtn,
            styles.validateBtn,
            {
              backgroundColor: (hasSignature && signerName.trim() && !disabled) ? colors.success : colors.border,
              opacity: isProcessing ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="checkmark" size={20} color="#FFF" />
          <Text style={[styles.controlText, { color: '#FFF' }]}>
            VALIDER
          </Text>
        </Pressable>
      </View>

      {/* Note légale */}
      <Text style={[styles.legalNote, { color: colors.textTertiary }]}>
        En signant, le client confirme la réception du colis
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
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
  nameSection: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  nameInput: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
  },
  canvasContainer: {
    height: 200,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#000',
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  guideText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.regular,
    opacity: 0.3,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlBtn: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validateBtn: {
    flex: 1.5,
  },
  controlText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  legalNote: {
    fontSize: 9,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  webMessage: {
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    padding: 20,
  },
});
