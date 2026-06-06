/**
 * Cookubuddy Root Layout Configuration
 * Handles global session initializations and coordinate route views.
 */

import { LanguageProvider } from '@/hooks/use-language';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppThemeProvider>
          <RootLayoutNav />
        </AppThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { session, loading, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAdminGroup = segments[0] === '(admin)';
    const inAuthGroup = segments[0] === '(auth)';
    // const inTabGroup = segments[0] === '(tab)';

    if (session) {
      if (isAdmin) {
        if (!inAdminGroup) {
          router.replace('/(admin)');
        }
      } else {
        if (inAuthGroup || inAdminGroup) {
          router.replace('/(tab)');
        }
      }
    } else {
      if (inAdminGroup) {
        router.replace('/(tab)');
      }
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [session, loading, segments, isAdmin]);

  if (loading) {
    return null;
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </NavigationThemeProvider>
  );
}
