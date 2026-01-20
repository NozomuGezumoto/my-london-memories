// ============================================
// My Kyoto - Main Map Component
// Full-screen map centered on Kyoto
// Using react-native-maps with clustering
// ============================================

import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Pressable } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { Ionicons } from '@expo/vector-icons';
import { KYOTO_INITIAL_REGION } from '../../constants/kyoto';
import { COLORS, PIN_SIZE, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { MemoryPin } from '../../types';

// Map style for dark theme (Google Maps)
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

interface KyotoMapProps {
  onPinPress: (pin: MemoryPin) => void;
  onLongPress?: (coordinates: { latitude: number; longitude: number }) => void;
  interactive?: boolean;
}

export default function KyotoMap({
  onPinPress,
  onLongPress,
  interactive = true,
}: KyotoMapProps) {
  const mapRef = useRef<MapView | null>(null);
  
  // Subscribe to state directly to ensure re-render on changes
  const allPins = useStore((state) => state.pins);
  const selectedCategoryId = useStore((state) => state.selectedCategoryId);
  const pinCategories = useStore((state) => state.pinCategories);
  const displayMode = useStore((state) => state.displayMode);

  // Track when filter is cleared to force re-render
  const [resetKey, setResetKey] = useState(0);
  const prevCategoryId = useRef(selectedCategoryId);

  useEffect(() => {
    // Only trigger re-render when filter is cleared (category -> null)
    if (prevCategoryId.current !== null && selectedCategoryId === null) {
      setResetKey((k) => k + 1);
    }
    prevCategoryId.current = selectedCategoryId;
  }, [selectedCategoryId]);

  // Filter pins based on selected category
  const pins = useMemo(() => {
    if (!selectedCategoryId) {
      return allPins;
    }
    const filteredPinIds = pinCategories
      .filter((pc) => pc.categoryId === selectedCategoryId)
      .map((pc) => pc.pinId);
    return allPins.filter((pin) => filteredPinIds.includes(pin.id));
  }, [allPins, selectedCategoryId, pinCategories]);

  // Reset map to Kyoto center
  const handleResetToCenter = useCallback(() => {
    mapRef.current?.animateToRegion(KYOTO_INITIAL_REGION, 500);
  }, []);

  const handleLongPress = useCallback(
    (event: any) => {
      if (!onLongPress || !interactive) return;
      const { coordinate } = event.nativeEvent;
      onLongPress({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
    },
    [onLongPress, interactive]
  );

  const handleMarkerPress = useCallback(
    (pin: MemoryPin) => {
      onPinPress(pin);
      
      // Animate to pin location
      mapRef.current?.animateToRegion({
        latitude: pin.lat,
        longitude: pin.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    },
    [onPinPress]
  );

  // Render custom cluster marker
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;
    
    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
        onPress={onPress}
        tracksViewChanges={false}
      >
        <View style={styles.clusterContainer}>
          <Text style={styles.clusterText}>
            {points > 99 ? '99+' : points}
          </Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      {/* Reset to center button */}
      <Pressable style={styles.resetButton} onPress={handleResetToCenter}>
        <Ionicons name="locate" size={22} color={COLORS.textPrimary} />
      </Pressable>

      <ClusteredMapView
        key={`map-${resetKey}`}
        mapRef={(ref: MapView | null) => { mapRef.current = ref; }}
        style={styles.map}
        initialRegion={KYOTO_INITIAL_REGION}
        customMapStyle={MAP_STYLE}
        onLongPress={handleLongPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        minZoomLevel={10}
        maxZoomLevel={18}
        onRegionChangeComplete={() => {}}
        // Clustering options
        clusterColor={COLORS.cluster}
        clusterTextColor={COLORS.textPrimary}
        clusterFontFamily="System"
        radius={50}
        renderCluster={renderCluster}
        minPoints={2}
      >
        {pins.map((pin) => {
          // Determine what to show based on displayMode
          const showPhoto = 
            displayMode === 'photo' || 
            (displayMode === 'original' && pin.pinType === 'photo');
          
          const hasPhoto = !!pin.photoUri;
          
          // Get rank border color
          const rankBorderColor = pin.rank === 1 
            ? COLORS.rank1 
            : pin.rank === 3 
              ? COLORS.rank3 
              : COLORS.rank2;
          
          return (
            <Marker
              key={pin.id}
              coordinate={{
                latitude: pin.lat,
                longitude: pin.lng,
              }}
              onPress={() => handleMarkerPress(pin)}
              tracksViewChanges={false}
            >
              {showPhoto ? (
                hasPhoto ? (
                  <View style={[styles.photoMarker, { borderColor: rankBorderColor }]}>
                    <Image
                      source={{ uri: pin.photoUri }}
                      style={styles.photoImage}
                    />
                  </View>
                ) : (
                  <View style={[styles.nullMarker, { borderColor: rankBorderColor }]}>
                    <Text style={styles.nullChar}>N</Text>
                  </View>
                )
              ) : (
                <View style={[styles.textMarker, { borderColor: rankBorderColor }]}>
                  <Text style={styles.textChar}>{pin.textChar || '?'}</Text>
                </View>
              )}
            </Marker>
          );
        })}
      </ClusteredMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  resetButton: {
    position: 'absolute',
    top: 100,
    right: SPACING.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.mapOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  photoMarker: {
    width: PIN_SIZE.photo,
    height: PIN_SIZE.photo,
    borderRadius: PIN_SIZE.photo / 2,
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
    backgroundColor: COLORS.photoPin,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  photoImage: {
    width: PIN_SIZE.photo - 6,
    height: PIN_SIZE.photo - 6,
    borderRadius: (PIN_SIZE.photo - 6) / 2,
  },
  textMarker: {
    width: PIN_SIZE.text,
    height: PIN_SIZE.text,
    borderRadius: PIN_SIZE.text / 2,
    borderWidth: 2,
    borderColor: COLORS.textPin,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  textChar: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  nullMarker: {
    width: PIN_SIZE.text,
    height: PIN_SIZE.text,
    borderRadius: PIN_SIZE.text / 2,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nullChar: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  clusterContainer: {
    width: PIN_SIZE.cluster,
    height: PIN_SIZE.cluster,
    borderRadius: PIN_SIZE.cluster / 2,
    backgroundColor: COLORS.cluster,
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  clusterText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
