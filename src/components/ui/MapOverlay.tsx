// ============================================
// My Kyoto - Map Overlay UI
// Minimal UI elements floating over the map
// ============================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useStore } from '../../store/useStore';

interface MapOverlayProps {
  onCategoryPress: () => void;
  onAddPress: () => void;
}

export default function MapOverlay({ onCategoryPress, onAddPress }: MapOverlayProps) {
  const insets = useSafeAreaInsets();
  const pins = useStore((state) => state.pins);
  const selectedCategoryId = useStore((state) => state.selectedCategoryId);
  const pinCategories = useStore((state) => state.pinCategories);
  const displayMode = useStore((state) => state.displayMode);
  const setDisplayMode = useStore((state) => state.setDisplayMode);

  // Calculate filtered pins count directly (ensures re-render on state change)
  const filteredPinsCount = selectedCategoryId
    ? pins.filter((pin) => 
        pinCategories.some((pc) => pc.pinId === pin.id && pc.categoryId === selectedCategoryId)
      ).length
    : pins.length;

  return (
    <>
      {/* Top overlay - Pin count */}
      <View style={[styles.topContainer, { top: insets.top + SPACING.md }]}>
        <View style={styles.countBadge}>
          <Text style={styles.countNumber}>{filteredPinsCount}</Text>
          <Text style={styles.countLabel}>memories</Text>
        </View>
      </View>

      {/* Bottom overlay - Action buttons */}
      <View style={[styles.bottomContainer, { bottom: insets.bottom + SPACING.xl }]}>
        {/* Left side buttons */}
        <View style={styles.leftButtons}>
          {/* Display mode toggle - single button */}
          <Pressable
            style={styles.displayModeToggle}
            onPress={() => {
              // photo ↔ text
              setDisplayMode(displayMode === 'photo' ? 'text' : 'photo');
            }}
          >
            {displayMode === 'photo' ? (
              <Ionicons name="image" size={20} color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.displayModeToggleText}>文</Text>
            )}
          </Pressable>

          {/* Category button */}
          <Pressable
            style={[styles.actionButton, styles.categoryButton]}
            onPress={onCategoryPress}
          >
            <Ionicons name="layers-outline" size={22} color={COLORS.textPrimary} />
            <Text style={styles.actionButtonText}>Categories</Text>
          </Pressable>
        </View>

        {/* Add memory button */}
        <Pressable
          style={[styles.actionButton, styles.addButton]}
          onPress={onAddPress}
        >
          <Ionicons name="add" size={28} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* App title - subtle branding */}
      <View style={[styles.brandContainer, { top: insets.top + SPACING.md }]}>
        <Text style={styles.brandText}>京</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  countBadge: {
    backgroundColor: COLORS.mapOverlay,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  countNumber: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  countLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftButtons: {
    gap: SPACING.sm,
  },
  displayModeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.mapOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  displayModeToggleText: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  categoryButton: {
    backgroundColor: COLORS.mapOverlay,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  brandContainer: {
    position: 'absolute',
    right: SPACING.lg,
  },
  brandText: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: '300',
    color: COLORS.textPrimary,
    opacity: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});


