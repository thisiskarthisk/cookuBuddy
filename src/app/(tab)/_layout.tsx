/**
 * Cookubuddy Main Tab Navigator Layout
 * Pure layout presentation layer. Protection is handled by the root gateway.
 */

import { useTheme } from '@/hooks/use-theme';
import { Tabs } from 'expo-router';
import { ChefHat, ShoppingCart, User, Notebook } from 'lucide-react-native';

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
        name="shopping-list"
        options={{
          title: 'Cooking List',
          tabBarIcon: ({ size, color }) => <Notebook size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />

      {/* Hide screens that are not tabs */}
      <Tabs.Screen name="favorites" options={{ href : null}} />
      <Tabs.Screen name="recipe-details" options={{ href : null}} />
    </Tabs>
  );
}