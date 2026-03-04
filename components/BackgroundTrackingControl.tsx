import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBackgroundTracking } from '@/hooks/useBackgroundTracking';
import { typography } from '@/constants/typography';

export function BackgroundTrackingControl() {
  const { colors, isDark } = useAppTheme();
  const {
    isTracking,
    hasPermissions,
    pendingCount,
    error,
    requestPermissions,
    startTracking,
    stopTracking,
    syncPending,
  } = useBackgroundTracking();

  // Ne pas afficher sur web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F6F6F6', borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textTertiary }]}>
            SUIVI ARRIÈRE-PLAN
          </Text>
        </View>
        <Text style={[styles.webMessage, { color: colors.textSecondary }]}>
          Fonctionnalité disponible uniquement sur iOS et Android
        </Text>
      </View>
    );
  }

  const handleToggle = async () => {
    if (!hasPermissions) {
      Alert.alert(
        'Permissions Requises',
        'KoliGo a besoin de suivre votre position en arrière-plan pour maintenir une visibilité en temps réel pendant votre tournée.',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Autoriser', 
            onPress: async () => {
              const granted = await requestPermissions();
              if (granted) {
                await startTracking();
              }
            }
          },
        ]
      );
      return;
    }

    if (isTracking) {
      Alert.alert(
        'Arrêter le Suivi',
        'Voulez-vous arrêter le suivi en arrière-plan ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Arrêter', onPress: stopTracking, style: 'destructive' },
        ]
      );
    } else {
      await startTracking();
    }
  };

  const handleSync = async () => {
    const synced = await syncPending();
    Alert.alert('Synchronisation', `${synced} position(s) synchronisée(s)`);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F6F6F6', borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={isTracking ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color={isTracking ? colors.success : colors.textTertiary} 
          />
          <Text style={[styles.title, { color: colors.text }]}>
            SUIVI ARRIÈRE-PLAN
          </Text>
        </View>
        <Text style={[styles.status, { color: isTracking ? colors.success : colors.textTertiary }]}>
          {isTracking ? 'ACTIF' : 'INACTIF'}
        </Text>
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.danger + '10' }]}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error.toUpperCase()}
          </Text>
        </View>
      )}

      {pendingCount > 0 && (
        <Pressable onPress={handleSync} style={[styles.pendingBox, { backgroundColor: colors.warning + '10' }]}>
          <Ionicons name="cloud-upload-outline" size={16} color={colors.warning} />
          <Text style={[styles.pendingText, { color: colors.warning }]}>
            {pendingCount} POSITION(S) EN ATTENTE
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={handleToggle}
        style={[
          styles.button,
          {
            backgroundColor: isTracking ? colors.danger : colors.accent,
          },
        ]}
      >
        <Ionicons 
          name={isTracking ? 'stop' : 'play'} 
          size={20} 
          color="#FFF" 
        />
        <Text style={styles.buttonText}>
          {isTracking ? 'ARRÊTER' : 'DÉMARRER'}
        </Text>
      </Pressable>
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
  status: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    flex: 1,
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  pendingText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
  },
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
    color: '#FFF',
  },
});
