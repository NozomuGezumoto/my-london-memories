// ============================================
// My London - Fixed config (no env / no dynamic city)
// ============================================

export default {
  expo: {
    name: 'My London',
    slug: 'my-london',
    version: '1.0.2',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mylondon',
    userInterfaceStyle: 'light',
    newArchEnabled: true,

    extra: {
      city: 'london',
      cityName: 'My London',
      cityNameJa: 'My ロンドン',
      eas: {
        projectId: '5e1150db-09db-4fdd-9a63-97b3e7f6919e',
      },
    },

    owner: 'nozomusp',

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mycity.mylondon',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'My London Memories uses your location only when you add or edit a memory. For example, when you tap "Use Current Location", your position is used to place the memory pin on the map. Location data is stored only on this device and is not shared.',
      },
    },

    android: {
      package: 'com.mycity.mylondon',
      adaptiveIcon: {
        backgroundColor: '#f5f5f0',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
    },

    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-font',
      '@react-native-community/datetimepicker',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'My London Memories uses your location only when you add or edit a memory. For example, when you tap "Use Current Location", your position is used to place the memory pin on the map. Location data is stored only on this device and is not shared.',
        },
      ],
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#f5f5f0',
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
