# My City 🌍

A beautiful memory pin map app for your favorite cities. Drop pins on the map to save your memories from around the world.

## Supported Cities

| City | Emoji | Country |
|------|-------|---------|
| 京都 (Kyoto) | ⛩️ | Japan |
| シドニー (Sydney) | ⛵ | Australia |
| パリ (Paris) | 🗼 | France |
| ロンドン (London) | 🎡 | United Kingdom |
| ローマ (Rome) | 🏛️ | Italy |
| バンコク (Bangkok) | 🛕 | Thailand |
| クアンタン (Kuantan) | 🏖️ | Malaysia |
| 東京 (Tokyo) | 🗼 | Japan |
| 台北 (Taipei) | 🏯 | Taiwan |
| バルセロナ (Barcelona) | 🏗️ | Spain |
| ベルリン (Berlin) | 🐻 | Germany |
| リオ (Rio de Janeiro) | 🎭 | Brazil |
| マラケシュ (Marrakech) | 🕌 | Morocco |

## Features

- 📍 Interactive map centered on your chosen city
- 📸 Photo pins with image preview
- 🔤 Text pins with custom emoji/character
- 🏷️ Category-based organization
- ⭐ Pin ranking system (1-3 stars)
- 🔍 Filter by categories
- 🎨 City-specific themes and color palettes

## Tech Stack

- [Expo](https://expo.dev) with Expo Router
- React Native Maps with clustering
- Zustand for state management
- Bottom Sheet for modal interactions
- TypeScript

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app for a specific city

```bash
# Start for Kyoto (default)
npm run start:kyoto

# Start for other cities
npm run start:sydney
npm run start:paris
npm run start:london
npm run start:rome
npm run start:bangkok
npm run start:kuantan
npm run start:tokyo
npm run start:taipei
npm run start:barcelona
npm run start:berlin
npm run start:rio
npm run start:marrakech
```

### 3. Run on your device

Use one of the following:
- [Expo Go](https://expo.dev/go)
- [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

## Building for Production

### EAS Build Profiles

Each city has its own EAS build profile configured in `eas.json`. This allows each city app to be built and submitted separately to App Store Connect and Google Play Console.

**Current EAS Projects:**
- **My Kyoto**: Project ID `be8cf4b8-2805-49b0-bf67-c791a8dfcf52` (already in review)
- **My Paris**: Project ID `01360b68-1eb7-40be-b344-40a2e69a8522` (separate project)
- **My London**: See [docs/LONDON_RELEASE.md](docs/LONDON_RELEASE.md) — run `CITY=london eas init` then set Project ID in `app.config.js`

### Build for a specific city

```bash
# Build using EAS profiles (recommended)
npm run build:kyoto   # Builds My Kyoto app
npm run build:paris   # Builds My Paris app
npm run build:london  # Builds My London app (set EAS project ID first; see docs/LONDON_RELEASE.md)

# Or use EAS CLI directly
eas build --profile kyoto -p ios
eas build --profile paris -p ios
eas build --profile london -p ios
```

Each city builds as a separate app with unique bundle identifiers:
- My Kyoto: `com.mycity.mykyoto`
- My Paris: `com.mycity.myparis`
- My London: `com.mycity.mylondon`

### App Store Connect / Google Play Console

Each city version is configured as a separate app:
- Different bundle IDs / package names
- Separate EAS project IDs
- Independent versioning and submissions

**To submit to App Store Connect:**
```bash
eas submit --profile paris -p ios
eas submit --profile london -p ios   # My London
```

**To submit to Google Play Console:**
```bash
eas submit --profile paris -p android
eas submit --profile london -p android   # My London
```

**London リリース**: 詳細は [docs/LONDON_RELEASE.md](docs/LONDON_RELEASE.md) を参照。

### Manual build with custom city (development only)

```bash
# On macOS/Linux
CITY=kyoto npx expo start

# On Windows (PowerShell)
$env:CITY="kyoto"; npx expo start

# Cross-platform (requires cross-env)
npx cross-env CITY=kyoto expo start
```

## Project Structure

```
src/
├── config/
│   ├── types.ts                # City config type definitions
│   ├── index.ts                # Main config entry point
│   └── cities/                 # City-specific configurations
│       ├── kyoto.ts
│       ├── sydney.ts
│       ├── paris.ts
│       └── ...
├── components/
│   ├── map/
│   │   └── CityMap.tsx         # Main map component
│   └── ui/
│       ├── MapOverlay.tsx      # Floating UI controls
│       ├── CategorySheet.tsx   # Category filter sheet
│       └── PinDetailSheet.tsx  # Pin preview sheet
├── constants/
│   └── city-theme.ts           # Design system exports
├── screens/
│   ├── ShowcaseMapScreen.tsx   # Main screen
│   ├── AddMemoryScreen.tsx     # Pin creation
│   └── PinDetailScreen.tsx     # Full pin details
├── store/
│   └── useStore.ts             # Zustand store
└── types/
    └── index.ts                # TypeScript types
```

## Documentation

- **[London リリース手順](docs/LONDON_RELEASE.md)** — My London のビルド・ストア申請手順、ストア用テキスト、チェックリスト

## Adding a New City

1. Create a new config file in `src/config/cities/`:

```typescript
// src/config/cities/newcity.ts
import { CityConfig } from '../types';

export const newcityConfig: CityConfig = {
  id: 'newcity',
  name: 'New City',
  nameJa: 'ニューシティ',
  // ... add all required config
};
```

2. Export from `src/config/cities/index.ts`:

```typescript
export { newcityConfig } from './newcity';
// Add to CITIES map
```

3. Add app config in `app.config.js`:

```javascript
const CITY_APP_CONFIG = {
  // ... existing cities
  newcity: {
    name: 'My New City',
    // ...
  },
};
```

4. Add scripts to `package.json`:

```json
{
  "scripts": {
    "start:newcity": "cross-env CITY=newcity expo start",
    "build:newcity": "eas build --profile newcity"
  }
}
```

5. Add EAS build profile to `eas.json`:

```json
{
  "build": {
    "newcity": {
      "extends": "production",
      "env": {
        "CITY": "newcity"
      }
    }
  }
}
```

6. Get EAS project ID and add to `app.config.js`:

```bash
CITY=newcity eas init
# Then add the project ID to CITY_EAS_PROJECT_IDS in app.config.js
```

## Design Philosophy

- **Map as the main UI** - The map is always the hero
- **Personal memories** - No social features, reviews, or ratings
- **Minimal UI** - Screenshot-friendly, clean aesthetic
- **City-specific themes** - Each city has its unique color palette

## License

MIT
