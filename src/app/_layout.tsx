/**
 * Cookubuddy Root Layout Configuration
 * Handles global session initializations and coordinate route views.
 */

import { LanguageProvider } from '@/hooks/use-language';
import { ThemeProvider as AppThemeProvider } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <LanguageProvider>
        <AppThemeProvider>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootLayoutNav />
          </NavigationThemeProvider>
        </AppThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { session, loading, isAdmin } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAdminGroup = segments[0] === '(admin)';
    const inAuthGroup = segments[0] === '(auth)';
    const inTabGroup = segments[0] === '(tab)';

    if (session) {
      if (isAdmin) {
        // Redirect Admin to admin panel if they land anywhere else
        if (!inAdminGroup) {
          router.replace('/(admin)');
        }
      } else {
        // Redirect regular user to home if they are in auth or admin screens
        if (inAuthGroup || inAdminGroup) {
          router.replace('/(tab)');
        }
      }
    } else {
      // Guest User Flow
      // If a guest accidentally ends up in admin panel, send them home
      if (inAdminGroup) {
        router.replace('/(tab)');
      }
    }

    // Hide Splash screen once loading is complete
    SplashScreen.hideAsync().catch(() => {
      // Silently handle if splash screen is already hidden or not registered
    });
  }, [session, loading, segments, isAdmin]);

  if (loading) {
    return null;
  }

  return <Slot />;
}
