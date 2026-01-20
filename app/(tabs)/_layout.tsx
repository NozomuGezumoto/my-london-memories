// ============================================
// My Kyoto - Tab Layout (Single tab - Map only)
// ============================================

import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
