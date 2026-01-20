// ============================================
// My Kyoto - Pin Detail Bottom Sheet
// Shows full details of selected memory pin
// ============================================

import React, { useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useStore } from '../../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 200;

interface PinDetailSheetProps {
  pinId: string | null;
  onClose?: () => void;
  onOpenFull?: () => void;
}

const PinDetailSheet = forwardRef<BottomSheet, PinDetailSheetProps>(
  ({ pinId, onClose, onOpenFull }, ref) => {
    const getPinWithDetails = useStore((state) => state.getPinWithDetails);
    
    const pin = useMemo(() => {
      if (!pinId) return null;
      return getPinWithDetails(pinId);
    }, [pinId, getPinWithDetails]);

    const snapPoints = useMemo(() => ['40%', '70%'], []);

    const visitedDate = pin?.visitedAt
      ? format(new Date(pin.visitedAt), 'yyyy年M月d日')
      : null;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onClose={onClose}
      >
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {pin ? (
            <>
              {/* Photo or Text Character Display */}
              {pin.pinType === 'photo' && pin.photoUri ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: pin.photoUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={styles.textCharContainer}>
                  <Text style={styles.textChar}>{pin.textChar}</Text>
                </View>
              )}

              {/* Date */}
              {visitedDate && (
                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>訪問日</Text>
                  <Text style={styles.dateValue}>{visitedDate}</Text>
                </View>
              )}

              {/* Categories */}
              {pin.categories.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>カテゴリー</Text>
                  <View style={styles.categoriesContainer}>
                    {pin.categories.map((cat) => (
                      <View key={cat.id} style={styles.categoryChip}>
                        <Text style={styles.categoryChipText}>{cat.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Note */}
              {pin.note && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>メモ</Text>
                  <Text style={styles.noteText}>{pin.note}</Text>
                </View>
              )}

              {/* Context Metadata */}
              {pin.contextMeta && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>コンテキスト</Text>
                  <View style={styles.metaContainer}>
                    {[
                      pin.contextMeta.slot1,
                      pin.contextMeta.slot2,
                      pin.contextMeta.slot3,
                      pin.contextMeta.slot4,
                    ]
                      .filter(Boolean)
                      .map((slot, index) => (
                        <View key={index} style={styles.metaChip}>
                          <Text style={styles.metaChipText}>{slot}</Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {/* Open Full Detail Button */}
              {onOpenFull && (
                <Pressable style={styles.openButton} onPress={onOpenFull}>
                  <Text style={styles.openButtonText}>詳細を開く</Text>
                </Pressable>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Select a pin to view details</Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.backgroundElevated,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  handleIndicator: {
    backgroundColor: COLORS.textMuted,
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textCharContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  textChar: {
    fontSize: 72,
    color: COLORS.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  noteText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.relaxed,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  metaChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.accentGold,
  },
  openButton: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  openButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  emptyState: {
    padding: SPACING.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});

export default PinDetailSheet;
