// ============================================
// My Kyoto - Pin Detail Screen
// Full-screen view of a memory pin
// ============================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useStore } from '../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PinDetail'>;
type PinDetailRouteProp = RouteProp<RootStackParamList, 'PinDetail'>;

export default function PinDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PinDetailRouteProp>();
  const insets = useSafeAreaInsets();

  const { pinId } = route.params;
  const getPinWithDetails = useStore((state) => state.getPinWithDetails);
  const deletePin = useStore((state) => state.deletePin);

  const pin = useMemo(() => getPinWithDetails(pinId), [pinId, getPinWithDetails]);

  if (!pin) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Memory not found</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePin(pinId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const visitedDate = pin.visitedAt
    ? format(new Date(pin.visitedAt), 'yyyy年M月d日')
    : null;

  const createdDate = format(new Date(pin.createdAt), 'yyyy/MM/dd HH:mm');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.headerButton}>
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Visual */}
        {pin.pinType === 'photo' && pin.photoUri ? (
          <Image
            source={{ uri: pin.photoUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroText}>{pin.textChar}</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Date */}
          {visitedDate && (
            <View style={styles.dateRow}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{visitedDate}</Text>
              </View>
            </View>
          )}

          {/* Categories */}
          {pin.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>カテゴリー</Text>
              <View style={styles.tagsContainer}>
                {pin.categories.map((cat) => (
                  <View key={cat.id} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{cat.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Note */}
          {pin.note && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>メモ</Text>
              <Text style={styles.noteText}>{pin.note}</Text>
            </View>
          )}

          {/* Context Metadata */}
          {pin.contextMeta && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>コンテキスト</Text>
              <View style={styles.tagsContainer}>
                {[
                  pin.contextMeta.slot1,
                  pin.contextMeta.slot2,
                  pin.contextMeta.slot3,
                  pin.contextMeta.slot4,
                ]
                  .filter(Boolean)
                  .map((slot, index) => (
                    <View key={index} style={styles.contextTag}>
                      <Text style={styles.contextTagText}>{slot}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>位置情報</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>
                {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Metadata */}
          <View style={styles.metaSection}>
            <Text style={styles.metaText}>
              Created: {createdDate}
            </Text>
            <Text style={styles.metaText}>
              ID: {pin.id.slice(0, 8)}...
            </Text>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: insets.bottom + SPACING.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    zIndex: 10,
    backgroundColor: 'rgba(15, 15, 20, 0.7)',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  heroTextContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  heroText: {
    fontSize: 120,
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.xl,
  },
  dateRow: {
    marginBottom: SPACING.xl,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  dateBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryTag: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryTagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  contextTag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  contextTagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.accentGold,
  },
  noteText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.fontSize.lg * TYPOGRAPHY.lineHeight.relaxed,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  metaSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  backLink: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
  },
});


