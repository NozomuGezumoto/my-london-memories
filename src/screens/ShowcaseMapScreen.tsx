// ============================================
// My Kyoto - Showcase Map Screen
// Main screen - full-screen map with memories
// ============================================

import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../constants/theme';
import { RootStackParamList, MemoryPin } from '../types';
import KyotoMap from '../components/map/KyotoMap';
import MapOverlay from '../components/ui/MapOverlay';
import CategorySheet from '../components/ui/CategorySheet';
import PinDetailSheet from '../components/ui/PinDetailSheet';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function ShowcaseMapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const categorySheetRef = useRef<BottomSheet>(null);
  const pinDetailSheetRef = useRef<BottomSheet>(null);
  
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const handlePinPress = useCallback((pin: MemoryPin) => {
    setSelectedPinId(pin.id);
    categorySheetRef.current?.close();
    pinDetailSheetRef.current?.snapToIndex(0);
  }, []);

  const handleLongPress = useCallback(
    (coordinates: { latitude: number; longitude: number }) => {
      navigation.navigate('AddMemory', {
        initialLat: coordinates.latitude,
        initialLng: coordinates.longitude,
      });
    },
    [navigation]
  );

  const handleCategoryPress = useCallback(() => {
    pinDetailSheetRef.current?.close();
    categorySheetRef.current?.snapToIndex(0);
  }, []);

  const handleAddPress = useCallback(() => {
    navigation.navigate('AddMemory');
  }, [navigation]);

  const handlePinDetailClose = useCallback(() => {
    setSelectedPinId(null);
  }, []);

  const handleOpenFullDetail = useCallback(() => {
    if (selectedPinId) {
      navigation.navigate('PinDetail', { pinId: selectedPinId });
    }
  }, [navigation, selectedPinId]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Full-screen map */}
        <KyotoMap
          onPinPress={handlePinPress}
          onLongPress={handleLongPress}
        />

        {/* Minimal overlay UI */}
        <MapOverlay
          onCategoryPress={handleCategoryPress}
          onAddPress={handleAddPress}
        />

        {/* Category selection sheet */}
        <CategorySheet
          ref={categorySheetRef}
        />

        {/* Pin detail sheet */}
        <PinDetailSheet
          ref={pinDetailSheetRef}
          pinId={selectedPinId}
          onClose={handlePinDetailClose}
          onOpenFull={handleOpenFullDetail}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});


