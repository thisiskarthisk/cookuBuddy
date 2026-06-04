import { getRecipeImageUrl } from '@/lib/images';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/hooks/use-language';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { ChefHat, Heart, ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';

interface Recipe {
  id: string;
  sr_no: number;
  title: string;
  cuisine: string;
  image_filename: string | null;
}

export default function FavoritesScreen() {
  const { colors: theme } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const isTablet = width > 768;
  const numColumns = isTablet ? 3 : 2;
  const cardWidth = (width - 32 - (numColumns - 1) * 16) / numColumns;

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    const saved = await AsyncStorage.getItem(key);
    if (saved) {
      const favIds = JSON.parse(saved);
      setFavorites(favIds);
      if (favIds.length > 0) {
        fetchFavoriteRecipes(favIds);
      } else {
        setRecipes([]);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const fetchFavoriteRecipes = async (ids: string[]) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes_with_images')
        .select('sr_no, title, image_filename, tags')
        .in('sr_no', ids);

      if (error) throw error;
      
      const mappedData = (data || []).map(item => {
        let cuisine = 'General';
        try {
          if (item.tags) {
            const parsed = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
            cuisine = parsed.cuisine?.[0] || 'General';
          }
        } catch (e) {}
        
        return {
          id: item.sr_no.toString(),
          sr_no: item.sr_no,
          title: item.title,
          cuisine: cuisine,
          image_filename: item.image_filename
        };
      });
      
      setRecipes(mappedData);
    } catch (e) {
      console.error('Error fetching favorite recipes:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(i => i !== id) 
      : [...favorites, id];
    
    setFavorites(newFavs);
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    await AsyncStorage.setItem(key, JSON.stringify(newFavs));
    
    // Update local recipes list if we removed one
    if (!newFavs.includes(id)) {
      setRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => {
    return (
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })} 
        activeOpacity={0.9} 
        style={[styles.recipeCard, { width: cardWidth, backgroundColor: theme.cardBg, borderColor: theme.border }]}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.cardImage} />
          <TouchableOpacity 
            onPress={() => toggleFavorite(item.id)} 
            style={[styles.favBadge, { backgroundColor: theme.cardBg }]}
          >
            <Heart size={16} color="#EA4335" fill="#EA4335" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.recipeTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.recipeSub, { color: theme.textSecondary }]}>{item.cuisine}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tab)')} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('favorites')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 50 }} />
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={64} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No favorites yet</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImageWrapper: {
    height: 150,
    width: '100%',
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  favBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 20,
  },
  cardContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeSub: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
