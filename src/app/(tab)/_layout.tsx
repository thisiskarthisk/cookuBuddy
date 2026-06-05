/**
 * Cookubuddy Main Tab Navigator Layout
 * Pure layout presentation layer. Protection is handled by the root gateway.
 */

import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/hooks/use-language';
import { Tabs } from 'expo-router';
import { ChefHat, ShoppingCart, User, Notebook, Heart } from 'lucide-react-native';

export default function TabLayout() {
  const { colors: theme } = useTheme();
  const { t } = useLanguage();

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
          title: t('recipes'),
          tabBarIcon: ({ size, color }) => <ChefHat size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: t('favorites'),
          tabBarIcon: ({ size, color }) => <Heart size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: t('cooking_list'),
          tabBarIcon: ({ size, color }) => <Notebook size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />

      {/* Hide screens that are not tabs */}
      <Tabs.Screen name="recipe-details" options={{ href : null}} />
    </Tabs>
  );
}