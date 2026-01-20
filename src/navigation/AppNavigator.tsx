// ============================================
// My Kyoto - Navigation Configuration
// ============================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants/theme';

// Screens
import ShowcaseMapScreen from '../screens/ShowcaseMapScreen';
import AddMemoryScreen from '../screens/AddMemoryScreen';
import PinDetailScreen from '../screens/PinDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={ShowcaseMapScreen}
        />
        <Stack.Screen
          name="AddMemory"
          component={AddMemoryScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="PinDetail"
          component={PinDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


