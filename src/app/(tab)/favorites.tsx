import { useLanguage, LANGUAGE_NAMES } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { fetchAllRecipes, Recipe } from '@/lib/github-data';
import { getRecipeImageUrl } from '@/lib/images';
import { translateObject } from '@/lib/google-translate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

export default function FavoritesScreen() {
  const { colors: theme } = useTheme();
  const { t, language, isLanguageLoading } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [translatedTitles, setTranslatedTitles] = useState<Record<string, string>>({});

  const isTablet = width > 768;
  const numColumns = isTablet ? 3 : 2;
  const cardWidth = (width - 40 - (numColumns - 1) * 14) / numColumns;

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          const favIds = JSON.parse(saved);
          setFavorites(favIds);
          if (favIds.length > 0) {
            const allRecipes = await fetchAllRecipes();
            setRecipes(allRecipes.filter(r => favIds.includes(r.sr_no.toString())));
          } else {
            setRecipes([]);
          }
        }
      } catch (e) {
        console.error('Error loading favorites:', e);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [user]);

  useEffect(() => {
    if (language === 'en' || recipes.length === 0) return;

    const translateTitles = async () => {
      const titlesToTranslate: Record<string, string> = {};
      const newRecipes = recipes.filter(r => !translatedTitles[`${r.sr_no}_${language}`]);
      
      if (newRecipes.length === 0) return;

      for (const recipe of newRecipes) {
        const cacheKey = `${recipe.sr_no}_${language}`;
        const translated = await translateObject(recipe.title, LANGUAGE_NAMES[language] || language);
        titlesToTranslate[cacheKey] = translated;
      }

      setTranslatedTitles(prev => ({ ...prev, ...titlesToTranslate }));
    };

    translateTitles();
  }, [recipes, language]);

  const toggleFavorite = async (sr_no: number) => {
    const id = sr_no.toString();
    const newFavs = favorites.includes(id)
      ? favorites.filter(i => i !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    await AsyncStorage.setItem(key, JSON.stringify(newFavs));
    if (!newFavs.includes(id)) {
      setRecipes(prev => prev.filter(r => r.sr_no !== sr_no));
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const cuisine = item.tags.cuisine?.[0] || 'General';
    const displayTitle = (language !== 'en' && translatedTitles[`${item.sr_no}_${language}`]) || item.title;

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })}
        activeOpacity={0.85}
        style={[styles.recipeCard, { width: cardWidth, backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.cardImage} />
          <TouchableOpacity
            onPress={() => toggleFavorite(item.sr_no)}
            style={[styles.favBadge, { backgroundColor: theme.surface }]}
          >
            <Heart size={14} color={theme.error} fill={theme.error} />
          </TouchableOpacity>
          <View style={styles.cuisinePill}>
            <Text style={styles.cuisinePillText}>{cuisine}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.recipeTitle, { color: theme.text }]} numberOfLines={2}>{displayTitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLanguageLoading) {
    return (
      <View style={[styles.loadingOverlay, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Switching Language...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.blobTop, { backgroundColor: theme.accent + '15' }]} />
      <View style={[styles.blobBottom, { backgroundColor: theme.accentSecondary + '10' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ArrowLeft size={20} color={theme.accent} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>MY COLLECTION</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('favorites')}</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Heart size={14} color={theme.error} fill={theme.error} />
          <Text style={[styles.headerBadgeText, { color: theme.text }]}>{recipes.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 60 }} />
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Heart size={36} color={theme.border} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No favorites yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Recipes you love will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={item => item.sr_no.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blobTop: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -70 },
  blobBottom: { position: 'absolute', width: 220, height: 220, borderRadius: 110, bottom: -60, left: -50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, paddingHorizontal: 14 },
  headerLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  headerBadgeText: { fontSize: 13, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 14 },
  recipeCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  cardImageWrapper: { height: 140, width: '100%' },
  cardImage: { height: '100%', width: '100%' },
  favBadge: { position: 'absolute', top: 8, right: 8, padding: 6, borderRadius: 20 },
  cuisinePill: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  cuisinePillText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  cardContent: { padding: 12 },
  recipeTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 120 },
  emptyIconCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, fontWeight: '500' },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  loadingText: { fontSize: 16, fontWeight: '600' },
});
