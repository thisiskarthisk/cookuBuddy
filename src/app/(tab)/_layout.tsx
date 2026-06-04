/**
 * Cookubuddy Main Tab Navigator Layout
 * Pure layout presentation layer. Protection is handled by the root gateway.
 */

import { useTheme } from '@/hooks/use-theme';
import { Tabs } from 'expo-router';
import { ChefHat, User } from 'lucide-react-native';

export default function TabLayout() {
  const { colors: theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.cardBg,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ size, color }) => <ChefHat size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />

      {/* Hide this tab for now */}
      <Tabs.Screen name="recipe-details" options={{ href : null}} />
    </Tabs>
  );
}