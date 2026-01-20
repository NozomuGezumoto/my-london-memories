// ============================================
// My Kyoto - Add/Edit Memory Screen
// Registration and editing screen for memories
// ============================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../src/constants/theme';
import { KYOTO_CENTER, isWithinKyoto } from '../src/constants/kyoto';
import { PinType, PinRank } from '../src/types';
import { useStore } from '../src/store/useStore';

// Sound files
const SOUND_START = require('../assets/sounds/start.mp3');
const SOUND_COMPLETE = require('../assets/sounds/complete.mp3');

// Common emoji suggestions for text pins (no human figures)
const EMOJI_SUGGESTIONS = [
  // 初期（和風・京都）
  '🍵', '⛩️', '🌸', '🍡', '🎋', '🏯', '🎎', '⚔️', '🦊', '🍶',
  // 食べ物
  '🍙', '🍜', '🍣', '🍱', '🍛',
  // 自然
  '🌙', '🌊', '🍁', '🌿', '⭐',
  // 動物
  '🦋', '🐦', '🐟', '🐢', '🐝',
  // 趣味
  '🎨', '🎭', '🎹', '📷', '📚',
];

const KANJI_SUGGESTIONS = [
  // 初期
  '寺', '神', '茶', '桜', '竹', '雅', '侍', '京', '和', '縁',
  // 自然
  '山', '川', '海', '森', '空',
  // 感情・美
  '心', '愛', '夢', '静', '美',
  // 時・場所
  '朝', '宵', '里', '都', '橋',
  // 文化
  '舞', '歌', '詩', '画', '香',
];

export default function AddMemoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string; pinId?: string }>();
  const insets = useSafeAreaInsets();

  const isEditMode = !!params.pinId;
  const soundRef = useRef<Audio.Sound | null>(null);

  // Play sound function
  const playSound = useCallback(async (soundFile: any) => {
    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(soundFile);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play start sound when screen opens (only for new registration)
  useEffect(() => {
    if (!isEditMode) {
      playSound(SOUND_START);
    }
  }, [isEditMode, playSound]);

  const { 
    addPin, 
    updatePin,
    categories, 
    addCategory, 
    setPinCategories, 
    setContextMeta,
    getPinWithDetails,
    getCategoriesForPin,
    getContextMeta,
  } = useStore();

  // Load existing pin data for edit mode
  const existingPin = isEditMode ? getPinWithDetails(params.pinId!) : null;
  const existingCategories = isEditMode ? getCategoriesForPin(params.pinId!) : [];
  const existingContextMeta = isEditMode ? getContextMeta(params.pinId!) : null;

  // Form state
  const [pinType, setPinType] = useState<PinType>(existingPin?.pinType || 'photo');
  const [photoUri, setPhotoUri] = useState<string | null>(existingPin?.photoUri || null);
  const [backgroundUri, setBackgroundUri] = useState<string | null>(existingPin?.backgroundUri || null);
  const [textChar, setTextChar] = useState(existingPin?.textChar || '');
  const [rank, setRank] = useState<PinRank>(existingPin?.rank || 2);
  const [note, setNote] = useState(existingPin?.note || '');
  const [visitedAt, setVisitedAt] = useState(
    existingPin?.visitedAt ? new Date(existingPin.visitedAt) : new Date()
  );

  // Location state
  const [latitude, setLatitude] = useState(
    existingPin?.lat || (params.lat ? parseFloat(params.lat) : KYOTO_CENTER.latitude)
  );
  const [longitude, setLongitude] = useState(
    existingPin?.lng || (params.lng ? parseFloat(params.lng) : KYOTO_CENTER.longitude)
  );
  const [locationLabel, setLocationLabel] = useState(
    isEditMode ? 'Saved Location' : (params.lat ? 'Selected Location' : '')
  );

  // Categories state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    existingCategories.map(c => c.id)
  );
  const [newCategoryName, setNewCategoryName] = useState('');

  // Context metadata
  const [slot1, setSlot1] = useState(existingContextMeta?.slot1 || '');
  const [slot2, setSlot2] = useState(existingContextMeta?.slot2 || '');
  const [slot3, setSlot3] = useState(existingContextMeta?.slot3 || '');
  const [slot4, setSlot4] = useState(existingContextMeta?.slot4 || '');

  // Get current location on mount if no initial location (only for new pins)
  useEffect(() => {
    if (!isEditMode && !params.lat) {
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

  const pickBackgroundImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0]) {
      setBackgroundUri(result.assets[0].uri);
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

  const handleSave = async () => {
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
    if (selectedCategoryIds.length === 0) {
      Alert.alert('Category Required', 'Please select at least one category.');
      return;
    }

    let pinId: string;

    if (isEditMode) {
      // Update existing pin
      pinId = params.pinId!;
      updatePin(pinId, {
        lat: latitude,
        lng: longitude,
        pinType,
        photoUri: photoUri || undefined,
        backgroundUri: backgroundUri || undefined,
        textChar: pinType === 'text' ? textChar : undefined,
        rank,
        note: note.trim() || undefined,
        visitedAt: visitedAt.toISOString(),
      });
    } else {
      // Create new pin
      pinId = addPin({
        lat: latitude,
        lng: longitude,
        pinType,
        photoUri: photoUri || undefined,
        rank,
        backgroundUri: backgroundUri || undefined,
        textChar: pinType === 'text' ? textChar : undefined,
        note: note.trim() || undefined,
        visitedAt: visitedAt.toISOString(),
      });
    }

    // Set categories
    setPinCategories(pinId, selectedCategoryIds);

    // Set context metadata
    setContextMeta(pinId, {
      slot1: slot1.trim() || undefined,
      slot2: slot2.trim() || undefined,
      slot3: slot3.trim() || undefined,
      slot4: slot4.trim() || undefined,
    });

    // Play completion sound
    await playSound(SOUND_COMPLETE);

    // Small delay to let the sound start playing before navigating
    setTimeout(() => {
      if (isEditMode) {
        // After editing, go back to map screen (skip detail screen)
        router.replace('/');
      } else {
        // After new registration, just go back
        router.back();
      }
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Memory' : 'New Memory'}</Text>
        <Pressable onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>{isEditMode ? 'Update' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Pin Display Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pin Appearance</Text>
          <Text style={styles.helperText}>Choose how it appears on the map</Text>
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
                Photo
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
                Text
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Text Character Input - only for text type */}
        {pinType === 'text' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display Character</Text>
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
            <Text style={styles.helperText}>Kanji, Hiragana, Emoji, etc.</Text>

            {/* Quick suggestions */}
            <View style={styles.suggestionsRow}>
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setTextChar(emoji);
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
                  }}
                >
                  <Text style={styles.suggestionText}>{kanji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Photo Selection - always available */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Photo{pinType === 'photo' ? ' (Required)' : ' (Optional)'}
          </Text>
          <Pressable style={styles.photoSelector} onPress={pickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.photoPlaceholderText}>Select Photo</Text>
              </View>
            )}
          </Pressable>
          {photoUri && (
            <Pressable 
              style={styles.removePhotoButton} 
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.removePhotoText}>Remove Photo</Text>
            </Pressable>
          )}
        </View>

        {/* Background Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background (Optional)</Text>
          <Text style={styles.helperText}>Shown on the detail screen</Text>
          <Pressable style={styles.backgroundSelector} onPress={pickBackgroundImage}>
            {backgroundUri ? (
              <Image source={{ uri: backgroundUri }} style={styles.backgroundPreview} />
            ) : (
              <View style={styles.backgroundPlaceholder}>
                <Ionicons name="layers-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.photoPlaceholderText}>Select Background</Text>
              </View>
            )}
          </Pressable>
          {backgroundUri && (
            <Pressable 
              style={styles.removePhotoButton} 
              onPress={() => setBackgroundUri(null)}
            >
              <Text style={styles.removePhotoText}>Remove Background</Text>
            </Pressable>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationDisplay}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {locationLabel || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
            </Text>
          </View>
          <Pressable style={styles.locationButton} onPress={getCurrentLocation}>
            <Ionicons name="navigate" size={18} color={COLORS.textSecondary} />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </Pressable>
        </View>

        {/* Date Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Date</Text>
          <View style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>
              {visitedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Rank Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rank</Text>
          <View style={styles.rankContainer}>
            {([1, 2, 3] as PinRank[]).map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.rankButton,
                  { borderColor: r === 1 ? COLORS.rank1 : r === 2 ? COLORS.rank2 : COLORS.rank3 },
                  rank === r && styles.rankButtonActive,
                  rank === r && { backgroundColor: r === 1 ? COLORS.rank1 : r === 2 ? COLORS.rank2 : COLORS.rank3 },
                ]}
                onPress={() => setRank(r)}
              >
                <Text style={[
                  styles.rankButtonText,
                  rank === r && styles.rankButtonTextActive,
                ]}>
                  {r === 1 ? '★' : r === 2 ? '★★' : '★★★'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="About this memory..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
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
              placeholder="New Category"
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
          <Text style={styles.sectionTitle}>Context (Optional)</Text>
          <Text style={styles.helperText}>Free tags to help you remember</Text>
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
  removePhotoButton: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  removePhotoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error || '#ff6b6b',
  },
  backgroundSelector: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  backgroundPreview: {
    width: '100%',
    height: '100%',
  },
  backgroundPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
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
  rankContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rankButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankButtonActive: {
    borderWidth: 2,
  },
  rankButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  rankButtonTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
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

