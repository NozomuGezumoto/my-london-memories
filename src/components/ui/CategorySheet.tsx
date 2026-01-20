// ============================================
// My Kyoto - Category Bottom Sheet
// Scrollable list of categories with counts
// ============================================

import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { CategoryWithCount } from '../../types';

interface CategorySheetProps {
  onClose?: () => void;
}

const CategorySheet = forwardRef<BottomSheet, CategorySheetProps>(
  ({ onClose }, ref) => {
    // Subscribe directly to state for proper re-rendering
    const categories = useStore((state) => state.categories);
    const pinCategories = useStore((state) => state.pinCategories);
    const selectedCategoryId = useStore((state) => state.selectedCategoryId);
    const setSelectedCategory = useStore((state) => state.setSelectedCategory);

    // Calculate categories with counts
    const categoriesWithCounts: CategoryWithCount[] = useMemo(() => {
      return categories
        .map((cat) => ({
          ...cat,
          pinCount: pinCategories.filter((pc) => pc.categoryId === cat.id).length,
        }))
        .sort((a, b) => b.pinCount - a.pinCount);
    }, [categories, pinCategories]);

    const snapPoints = useMemo(() => ['22%', '45%'], []);

    const handleCategoryPress = useCallback(
      (category: CategoryWithCount) => {
        if (selectedCategoryId === category.id) {
          // Clear filter
          setSelectedCategory(null);
        } else {
          // Apply filter
          setSelectedCategory(category.id);
        }
      },
      [selectedCategoryId, setSelectedCategory]
    );

    const renderCategory = (category: CategoryWithCount) => {
      const isSelected = selectedCategoryId === category.id;
      
      return (
        <Pressable
          key={category.id}
          style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
          onPress={() => handleCategoryPress(category)}
        >
          <Text
            style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
            numberOfLines={1}
          >
            #{category.name}
          </Text>
          <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
            {category.pinCount}
          </Text>
        </Pressable>
      );
    };

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
        <View style={styles.header}>
          <Text style={styles.title}>Categories</Text>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {categoriesWithCounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No categories yet</Text>
              <Text style={styles.emptySubtext}>
                Add memories to create categories
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {categoriesWithCounts.map(renderCategory)}
            </View>
          )}
        </BottomSheetScrollView>

        {selectedCategoryId && (
          <Pressable
            style={styles.clearButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.clearButtonText}>Clear Filter</Text>
          </Pressable>
        )}
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
    width: 32,
    height: 4,
    marginTop: 6,  // ドラッグバーを少し下げる
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 2,   // −4px：タイトル上を締める
    paddingBottom: 4, // −4px：タイトル下を締める
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 2,
    paddingBottom: 32,  // +8px：ホームインジケータ上に呼吸を
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING.xs,
    columnGap: SPACING.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'transparent',
    borderRadius: RADIUS.sm,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  categoryNameSelected: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  countTextSelected: {
    color: COLORS.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  clearButton: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default CategorySheet;
