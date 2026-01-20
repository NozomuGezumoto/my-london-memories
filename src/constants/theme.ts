// ============================================
// My Kyoto - Design System
// Japanese-inspired aesthetic with modern touches
// ============================================

export const COLORS = {
  // Primary palette - inspired by traditional Japanese colors
  primary: '#C41E3A',        // 紅 (kurenai) - deep crimson
  primaryLight: '#E85D75',   // Lighter crimson
  primaryDark: '#8B0000',    // Darker crimson
  
  // Accent colors - wabi-sabi earth tones
  accent: '#D4A574',         // 肌色 (hadairo) - warm beige
  accentGold: '#C9A227',     // 金茶 (kincha) - golden tea
  accentSage: '#7D8471',     // 利休鼠 (rikyu-nezumi) - sage gray
  
  // Backgrounds - deep, atmospheric
  background: '#0F0F14',     // Near black with blue undertone
  backgroundElevated: '#1A1A24', // Slightly lifted surface
  backgroundCard: '#232333', // Card surfaces
  
  // Surface variations
  surface: '#2A2A3A',
  surfaceLight: '#3A3A4A',
  
  // Text colors
  textPrimary: '#F5F5F0',    // Warm white
  textSecondary: '#A8A8B0',  // Muted
  textMuted: '#6B6B78',      // Very subtle
  
  // Semantic colors
  success: '#4A7C59',        // 若竹色 (wakatake-iro)
  warning: '#D4A574',
  error: '#C41E3A',
  
  // Map overlay colors
  mapOverlay: 'rgba(15, 15, 20, 0.85)',
  mapOverlayLight: 'rgba(15, 15, 20, 0.6)',
  
  // Pin colors
  photoPin: '#C41E3A',
  textPin: '#C9A227',
  cluster: '#4A7C59',
  
  // Rank colors
  rank1: '#6B6B78',         // Gray
  rank2: '#4A90D9',         // Blue
  rank3: '#FFD700',         // Gold
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
};

export const TYPOGRAPHY = {
  // Font families - using system fonts with Japanese support
  // In production, consider: Noto Serif JP, Shippori Mincho
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    display: 32,
    hero: 48,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Pin marker sizes
export const PIN_SIZE = {
  photo: 48,
  text: 40,
  cluster: 44,
};

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Map provider (using Google Maps via react-native-maps)
// Dark style is configured directly in KyotoMap component


