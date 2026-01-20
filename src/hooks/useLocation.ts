// ============================================
// My Kyoto - Location Hook
// Handles location permissions and current position
// ============================================

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { isWithinKyoto, KYOTO_CENTER } from '../constants/kyoto';

interface LocationState {
  latitude: number;
  longitude: number;
  isInKyoto: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: KYOTO_CENTER.latitude,
    longitude: KYOTO_CENTER.longitude,
    isInKyoto: true,
    isLoading: false,
    error: null,
  });

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      setHasPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setLocation((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const granted = await requestPermission();
      if (!granted) {
        setLocation((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Location permission denied',
        }));
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;
      const isInKyoto = isWithinKyoto(latitude, longitude);

      setLocation({
        latitude,
        longitude,
        isInKyoto,
        isLoading: false,
        error: isInKyoto ? null : 'Location is outside Kyoto City',
      });

      return { latitude, longitude, isInKyoto };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setLocation((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [requestPermission]);

  return {
    ...location,
    hasPermission,
    requestPermission,
    getCurrentLocation,
  };
}


