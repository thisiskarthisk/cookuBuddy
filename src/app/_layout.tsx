/**
 * Cookubuddy Root Layout Configuration
 * Handles global session initializations and coordinate route views.
 */

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider as AppThemeProvider } from '@/hooks/use-theme';
import { LanguageProvider } from '@/hooks/use-language';
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
    <LanguageProvider>
      <AuthProvider>
        <AppThemeProvider>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootLayoutNav />
          </NavigationThemeProvider>
        </AppThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

function RootLayoutNav() {
  const { session, loading, isAdmin } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!session && !inAuthGroup) {
      // If user logs out or has no session, redirect them to the login screen
      router.replace('/(auth)/login');
    } else if (session) {
      if (isAdmin) {
        // Admin redirection
        if (inAuthGroup || segments.length === 0 || segments[0] === '' || segments[0] === '(tab)') {
          router.replace('/(admin)');
        }
      } else {
        // Regular user redirection
        if (inAuthGroup || segments.length === 0 || segments[0] === '' || segments[0] === '(admin)') {
          router.replace('/(tab)');
        }
      }
    }

    if (!loading) {
      SplashScreen.hideAsync().catch(() => {
        // Silently handle if splash screen is already hidden or not registered
      });
    }
  }, [session, loading, segments, isAdmin]);

  if (loading) {
    return null;
  }

  return <Slot />;
}
