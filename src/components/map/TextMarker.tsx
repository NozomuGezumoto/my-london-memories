// ============================================
// My Kyoto - Text Pin Marker
// Single character in styled circle
// ============================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, PIN_SIZE, SHADOWS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface TextMarkerProps {
  textChar: string;
  onPress?: () => void;
  size?: number;
}

export default function TextMarker({
  textChar,
  onPress,
  size = PIN_SIZE.text,
}: TextMarkerProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.marker, { width: size, height: size }, SHADOWS.md]}>
        <Text style={styles.text}>{textChar}</Text>
      </View>
      <View style={styles.pointer} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marker: {
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.textPin,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.textPin,
    marginTop: -2,
  },
});


