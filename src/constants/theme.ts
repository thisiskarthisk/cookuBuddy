/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof LightColors & keyof typeof DarkColors;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// export const Spacing = {
//   half: 2,
//   one: 4,
//   two: 8,
//   three: 16,
//   four: 24,
//   five: 32,
//   six: 64,
// } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;



export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
};

export const LightColors = {
  dark: false,
  background: '#F8F9FA',
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E2E8F0',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#718096',
  border: '#E2E8F0',
  accent: '#FFAE3D', // Premium warm orange
  accentHover: '#E59B30',
  cardBg: '#FFFFFF',
};

export const DarkColors = {
  dark: true,
  background: '#121212',
  backgroundElement: '#212225',
  backgroundSelected: '#2D3748',
  surface: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#A0AEC0',
  border: '#2D3748',
  accent: '#FFAE3D',
  accentHover: '#FBA834',
  cardBg: '#1A1A1A',
};

export type ThemeColors = typeof LightColors;