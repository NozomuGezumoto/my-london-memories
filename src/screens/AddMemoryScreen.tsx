// ============================================
// My Kyoto - Add Memory Screen
// Registration screen for new memories
// ============================================

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KYOTO_CENTER, isWithinKyoto } from '../constants/kyoto';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useStore } from '../store/useStore';
import { PinType, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMemory'>;
type AddMemoryRouteProp = RouteProp<RootStackParamList, 'AddMemory'>;

// Common emoji suggestions for text pins
const EMOJI_SUGGESTIONS = [
  '🍵', '⛩️', '🌸', '🍡', '🎋', '🏯', '🎎', '⚔️', '🦊', '🍶',

  // 追加 20
  '🌙', '🏮', '🎐', '🍁', '🌊', '🧧', '🎭', '🪭', '🪷', '🧿',
  '🍙', '🍜', '🥢', '🛕', '🕯️', '🌾', '🐦', '🦋', '🔥', '🎇',
];
const KANJI_SUGGESTIONS = [
  '寺', '神', '茶', '桜', '竹', '雅', '侍', '京', '和', '縁',

  // 追加 20
  '祭', '夜', '灯', '道', '旅', '夏', '月', '風', '庭', '影',
  '静', '里', '川', '山', '彩', '情', '心', '時', '景', '宵',
];
export default function AddMemoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddMemoryRouteProp>();
  const insets = useSafeAreaInsets();

  const { addPin, categories, addCategory, setPinCategories, setContextMeta } = useStore();

  // Form state
  const [pinType, setPinType] = useState<PinType>('photo');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [textChar, setTextChar] = useState('');
  const [note, setNote] = useState('');
  const [visitedAt, setVisitedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Location state
  const [latitude, setLatitude] = useState(route.params?.initialLat ?? KYOTO_CENTER.latitude);
  const [longitude, setLongitude] = useState(route.params?.initialLng ?? KYOTO_CENTER.longitude);
  const [locationLabel, setLocationLabel] = useState('');

  // Categories state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Context metadata
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [slot4, setSlot4] = useState('');

  // Get current location on mount if no initial location
  useEffect(() => {
    if (!route.params?.initialLat) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Please enable location to add memories at your current position.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = location.coords;

      if (isWithinKyoto(lat, lng)) {
        setLatitude(lat);
        setLongitude(lng);
        setLocationLabel('Current Location');
      } else {
        Alert.alert(
          '京都市外',
          'You are outside Kyoto City. Memories can only be added within Kyoto.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPinType('photo');
    }
  };

  const handleTextCharChange = (text: string) => {
    // Only allow 1 character
    if (text.length <= 2) { // Allow for emoji which can be 2 code units
      setTextChar(text.slice(-1) || text); // Take last char if multiple entered
      if (text) setPinType('text');
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newId = addCategory(newCategoryName.trim());
      setSelectedCategoryIds((prev) => [...prev, newId]);
      setNewCategoryName('');
    }
  };

  const handleSave = () => {
    // Validation
    if (pinType === 'photo' && !photoUri) {
      Alert.alert('Photo Required', 'Please select a photo for this memory.');
      return;
    }
    if (pinType === 'text' && !textChar) {
      Alert.alert('Character Required', 'Please enter a character for this memory.');
      return;
    }
    if (!isWithinKyoto(latitude, longitude)) {
      Alert.alert('Location Error', 'Memory location must be within Kyoto City.');
      return;
    }

    // Create pin
    const pinId = addPin({
      lat: latitude,
      lng: longitude,
      pinType,
      photoUri: pinType === 'photo' ? photoUri! : undefined,
      textChar: pinType === 'text' ? textChar : undefined,
      note: note.trim() || undefined,
      visitedAt: visitedAt.toISOString(),
    });

    // Set categories
    if (selectedCategoryIds.length > 0) {
      setPinCategories(pinId, selectedCategoryIds);
    }

    // Set context metadata
    if (slot1 || slot2 || slot3 || slot4) {
      setContextMeta(pinId, {
        slot1: slot1.trim() || undefined,
        slot2: slot2.trim() || undefined,
        slot3: slot3.trim() || undefined,
        slot4: slot4.trim() || undefined,
      });
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>新しい記憶</Text>
        <Pressable onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>保存</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Pin Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>記憶のタイプ</Text>
          <View style={styles.pinTypeContainer}>
            <Pressable
              style={[styles.pinTypeButton, pinType === 'photo' && styles.pinTypeButtonActive]}
              onPress={() => setPinType('photo')}
            >
              <Ionicons
                name="camera"
                size={24}
                color={pinType === 'photo' ? COLORS.textPrimary : COLORS.textMuted}
              />
              <Text
                style={[styles.pinTypeText, pinType === 'photo' && styles.pinTypeTextActive]}
              >
                写真
              </Text>
            </Pressable>
            <Pressable
              style={[styles.pinTypeButton, pinType === 'text' && styles.pinTypeButtonActive]}
              onPress={() => setPinType('text')}
            >
              <Text
                style={[
                  styles.pinTypeIcon,
                  pinType === 'text' && styles.pinTypeIconActive,
                ]}
              >
                文
              </Text>
              <Text
                style={[styles.pinTypeText, pinType === 'text' && styles.pinTypeTextActive]}
              >
                文字
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Photo Selection */}
        {pinType === 'photo' && (
          <View style={styles.section}>
            <Pressable style={styles.photoSelector} onPress={pickImage}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.photoPlaceholderText}>写真を選択</Text>
                </View>
              )}
            </Pressable>
          </View>
        )}

        {/* Text Character Input */}
        {pinType === 'text' && (
          <View style={styles.section}>
            <View style={styles.textCharContainer}>
              <TextInput
                style={styles.textCharInput}
                value={textChar}
                onChangeText={handleTextCharChange}
                placeholder="文"
                placeholderTextColor={COLORS.textMuted}
                maxLength={2}
                textAlign="center"
              />
            </View>
            <Text style={styles.helperText}>漢字、ひらがな、絵文字など1文字</Text>

            {/* Quick suggestions */}
            <View style={styles.suggestionsRow}>
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setTextChar(emoji);
                    setPinType('text');
                  }}
                >
                  <Text style={styles.suggestionText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.suggestionsRow}>
              {KANJI_SUGGESTIONS.map((kanji) => (
                <Pressable
                  key={kanji}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setTextChar(kanji);
                    setPinType('text');
                  }}
                >
                  <Text style={styles.suggestionText}>{kanji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>場所</Text>
          <View style={styles.locationDisplay}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {locationLabel || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
            </Text>
          </View>
          <Pressable style={styles.locationButton} onPress={getCurrentLocation}>
            <Ionicons name="navigate" size={18} color={COLORS.textSecondary} />
            <Text style={styles.locationButtonText}>現在地を使用</Text>
          </Pressable>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>訪問日</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>
              {visitedAt.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={visitedAt}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setVisitedAt(date);
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メモ（任意）</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="この記憶について..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カテゴリー</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategoryIds.includes(cat.id) && styles.categoryChipSelected,
                ]}
                onPress={() => handleCategoryToggle(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategoryIds.includes(cat.id) && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.newCategoryRow}>
            <TextInput
              style={styles.newCategoryInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="新しいカテゴリー"
              placeholderTextColor={COLORS.textMuted}
              onSubmitEditing={handleAddCategory}
            />
            <Pressable
              style={[
                styles.addCategoryButton,
                !newCategoryName.trim() && styles.addCategoryButtonDisabled,
              ]}
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              <Ionicons name="add" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Context Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>コンテキスト（任意）</Text>
          <Text style={styles.helperText}>後で思い出すための自由なタグ</Text>
          <View style={styles.slotsContainer}>
            <TextInput
              style={styles.slotInput}
              value={slot1}
              onChangeText={setSlot1}
              placeholder="スロット 1"
              placeholderTextColor={COLORS.textMuted}
            />
            <TextInput
              style={styles.slotInput}
              value={slot2}
              onChangeText={setSlot2}
              placeholder="スロット 2"
              placeholderTextColor={COLORS.textMuted}
            />
            <TextInput
              style={styles.slotInput}
              value={slot3}
              onChangeText={setSlot3}
              placeholder="スロット 3"
              placeholderTextColor={COLORS.textMuted}
            />
            <TextInput
              style={styles.slotInput}
              value={slot4}
              onChangeText={setSlot4}
              placeholder="スロット 4"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: insets.bottom + SPACING.xxxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  helperText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pinTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pinTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  pinTypeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundCard,
  },
  pinTypeIcon: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textMuted,
  },
  pinTypeIconActive: {
    color: COLORS.textPrimary,
  },
  pinTypeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  pinTypeTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  photoSelector: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  photoPlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  textCharContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  textCharInput: {
    fontSize: 72,
    color: COLORS.textPrimary,
    width: 100,
    height: 100,
    textAlign: 'center',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  suggestionChip: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
  },
  locationButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  noteInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  newCategoryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  newCategoryInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  addCategoryButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  addCategoryButtonDisabled: {
    backgroundColor: COLORS.surface,
  },
  slotsContainer: {
    gap: SPACING.sm,
  },
  slotInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});


