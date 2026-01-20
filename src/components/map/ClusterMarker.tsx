// ============================================
// My Kyoto - Cluster Marker
// Displays count of grouped pins
// ============================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, PIN_SIZE, SHADOWS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface ClusterMarkerProps {
  count: number;
  onPress?: () => void;
}

export default function ClusterMarker({ count, onPress }: ClusterMarkerProps) {
  // Dynamic size based on count
  const getSize = () => {
    if (count < 10) return PIN_SIZE.cluster;
    if (count < 50) return PIN_SIZE.cluster + 8;
    return PIN_SIZE.cluster + 16;
  };

  const size = getSize();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.marker, { width: size, height: size }, SHADOWS.md]}>
        <Text style={styles.count}>{count > 99 ? '99+' : count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
    backgroundColor: COLORS.cluster,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.95,
  },
  count: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});


