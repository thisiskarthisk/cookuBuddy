import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Themes, ThemeColors, ThemeName } from '../constants/theme';
import { useAuth } from './useAuth';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const THEME_STORAGE_KEY_PREFIX = 'app_theme_pref_';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [themeName, setThemeName] = useState<ThemeName>('minimal');

  const getStorageKey = () => {
    return user ? `${THEME_STORAGE_KEY_PREFIX}${user.id}` : `${THEME_STORAGE_KEY_PREFIX}guest`;
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const key = getStorageKey();
        const savedTheme = await AsyncStorage.getItem(key);
        if (savedTheme && Object.keys(Themes).includes(savedTheme as ThemeName)) {
          setThemeName(savedTheme as ThemeName);
        } else {
          // If no user preference, fallback to minimal
          setThemeName('minimal');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, [user?.id]); // Re-run when user changes

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    try {
      await AsyncStorage.setItem(getStorageKey(), name);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const colors = Themes[themeName];
  const isDark = colors.dark;

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
