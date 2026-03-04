import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { typography } from '@/constants/typography';
import type { GPSQuality } from '@/services/location';

interface GPSStatusCardProps {
  isLoading: boolean;
  latitude?: number;
  longitude?: number;
  quality?: GPSQuality;
  error?: string | null;
  onRetry?: () => void;
}

export function GPSStatusCard({
  isLoading,
  latitude,
  longitude,
  quality,
  error,
  onRetry,
}: GPSStatusCardProps) {
  const { colors } = useAppTheme();

  const getStatusColor = () => {
    if (error) return colors.danger;
    if (!quality) return colors.textSecondary;
    
    switch (quality.level) {
      case 'excellent': return colors.success;
      case 'good': return colors.success;
      case 'fair': return colors.warning;
      case 'poor': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    if (error) return 'alert-circle-outline';
    if (isLoading) return 'sync-outline';
    if (!quality) return 'location-outline';
    
    switch (quality.level) {
      case 'excellent': return 'radio-button-on';
      case 'good': return 'radio-button-on';
      case 'fair': return 'radio-button-off';
      case 'poor': return 'alert-circle-outline';
      default: return 'location-outline';
    }
  };

  const statusColor = getStatusColor();
  const backgroundColor = statusColor + '08';
  const borderColor = statusColor;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.iconContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={statusColor} />
        ) : (
          <Ionicons name={getStatusIcon()} size={24} color={statusColor} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: statusColor }]}>
          {isLoading
            ? 'ACQUISITION_SATELLITE...'
            : error
            ? 'ERREUR_GPS'
            : quality?.message.toUpperCase() || 'GPS_READY'}
        </Text>

        {latitude && longitude && (
          <View style={styles.coordsRow}>
            <Text style={[styles.coordsLabel, { color: colors.textTertiary }]}>
              LAT:
            </Text>
            <Text style={[styles.coordsValue, { color: colors.text }]}>
              {latitude.toFixed(6)}
            </Text>
            <Text style={[styles.coordsLabel, { color: colors.textTertiary }]}>
              LON:
            </Text>
            <Text style={[styles.coordsValue, { color: colors.text }]}>
              {longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {quality && (
          <View style={styles.accuracyRow}>
            <View style={[styles.accuracyDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.accuracyText, { color: colors.textTertiary }]}>
              PRÉCISION: ±{quality.accuracy.toFixed(1)}m
            </Text>
          </View>
        )}

        {error && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error.toUpperCase()}
          </Text>
        )}
      </View>

      {!isLoading && (error || (quality && !quality.isGood)) && onRetry && (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Ionicons name="refresh" size={20} color={statusColor} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  coordsLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  coordsValue: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    marginRight: 8,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accuracyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  accuracyText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    marginTop: 2,
  },
  retryButton: {
    padding: 8,
  },
});
