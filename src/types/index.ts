// ============================================
// My Kyoto - Type Definitions
// ============================================

export type PinType = 'photo' | 'text';

export type PinRank = 1 | 2 | 3;

export interface MemoryPin {
  id: string;
  lat: number;
  lng: number;
  pinType: PinType;
  photoUri?: string;      // For photo pins / main photo
  textChar?: string;      // For text pins (1 character)
  backgroundUri?: string; // Background image for detail screen
  rank?: PinRank;         // 1=gray, 2=blue, 3=gold
  note?: string;
  visitedAt: string;      // ISO date string
  createdAt: string;      // ISO date string
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface PinCategory {
  pinId: string;
  categoryId: string;
}

export interface ContextMeta {
  pinId: string;
  slot1?: string;
  slot2?: string;
  slot3?: string;
  slot4?: string;
}

// Derived type for display purposes
export interface MemoryPinWithDetails extends MemoryPin {
  categories: Category[];
  contextMeta?: ContextMeta;
}

export interface CategoryWithCount extends Category {
  pinCount: number;
}

// For map clustering
export interface ClusterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    pinType: PinType;
    photoUri?: string;
    textChar?: string;
    cluster?: boolean;
    point_count?: number;
  };
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  AddMemory: {
    initialLat?: number;
    initialLng?: number;
  } | undefined;
  PinDetail: {
    pinId: string;
  };
};

export type MainTabParamList = {
  Showcase: undefined;
};


