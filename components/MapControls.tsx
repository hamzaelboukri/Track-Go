import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface MapControlsProps {
  followDriver: boolean;
  onToggleFollow: () => void;
  onRecenter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isTracking: boolean;
}

export function MapControls({
  followDriver,
  onToggleFollow,
  onRecenter,
  onZoomIn,
  onZoomOut,
  isTracking,
}: MapControlsProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Bouton de suivi */}
      <Pressable
        onPress={onToggleFollow}
        style={[
          styles.controlButton,
          {
            backgroundColor: followDriver
              ? colors.accent
              : isDark
              ? 'rgba(10,10,10,0.95)'
              : 'rgba(255,255,255,0.95)',
            borderColor: followDriver ? colors.accent : colors.border,
          },
        ]}
      >
        <Ionicons
          name={followDriver ? 'navigate' : 'navigate-outline'}
          size={24}
          color={followDriver ? '#FFF' : colors.text}
        />
        {isTracking && (
          <View style={[styles.trackingDot, { backgroundColor: colors.success }]} />
        )}
      </Pressable>

      {/* Bouton de recentrage */}
      <Pressable
        onPress={onRecenter}
        style={[
          styles.controlButton,
          {
            backgroundColor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="locate" size={24} color={colors.text} />
      </Pressable>

      {/* Boutons de zoom */}
      <View style={[styles.zoomContainer, { borderColor: colors.border }]}>
        <Pressable
          onPress={onZoomIn}
          style={[
            styles.zoomButton,
            styles.zoomButtonTop,
            {
              backgroundColor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)',
            },
          ]}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </Pressable>
        
        <View style={[styles.zoomDivider, { backgroundColor: colors.border }]} />
        
        <Pressable
          onPress={onZoomOut}
          style={[
            styles.zoomButton,
            styles.zoomButtonBottom,
            {
              backgroundColor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)',
            },
          ]}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    gap: 12,
    alignItems: 'flex-end',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  trackingDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoomContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomButton: {
    width: 56,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonTop: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  zoomButtonBottom: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  zoomDivider: {
    height: 1,
  },
});
