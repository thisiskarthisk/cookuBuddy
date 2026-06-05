// import { useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { fetchAllRecipes, Recipe } from '@/lib/github-data';
// import { getRecipeImageUrl } from '@/lib/images';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { ArrowLeft, Heart } from 'lucide-react-native';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View,
// } from 'react-native';

// export default function FavoritesScreen() {
//   const { colors: theme } = useTheme();
//   const { t } = useLanguage();
//   const { user } = useAuth();
//   const router = useRouter();
//   const { width } = useWindowDimensions();

//   const [recipes, setRecipes] = useState<Recipe[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [favorites, setFavorites] = useState<string[]>([]);

//   const isTablet = width > 768;
//   const numColumns = isTablet ? 3 : 2;
//   const cardWidth = (width - 32 - (numColumns - 1) * 16) / numColumns;

//   useEffect(() => {
//     loadFavorites();
//   }, [user]);

//   const loadFavorites = async () => {
//     try {
//       setLoading(true);
//       const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//       const saved = await AsyncStorage.getItem(key);
//       if (saved) {
//         const favIds = JSON.parse(saved);
//         setFavorites(favIds);
//         if (favIds.length > 0) {
//           const allRecipes = await fetchAllRecipes();
//           const favoriteRecipes = allRecipes.filter(r => favIds.includes(r.sr_no.toString()));
//           setRecipes(favoriteRecipes);
//         } else {
//           setRecipes([]);
//         }
//       }
//     } catch (e) {
//       console.error('Error loading favorites:', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleFavorite = async (sr_no: number) => {
//     const id = sr_no.toString();
//     const newFavs = favorites.includes(id) 
//       ? favorites.filter(i => i !== id) 
//       : [...favorites, id];
    
//     setFavorites(newFavs);
//     const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//     await AsyncStorage.setItem(key, JSON.stringify(newFavs));
    
//     // Update local recipes list if we removed one
//     if (!newFavs.includes(id)) {
//       setRecipes(prev => prev.filter(r => r.sr_no !== sr_no));
//     }
//   };

//   const renderRecipe = ({ item }: { item: Recipe }) => {
//     const cuisine = item.tags.cuisine?.[0] || 'General';
//     return (
//       <TouchableOpacity 
//         onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })} 
//         activeOpacity={0.9} 
//         style={[styles.recipeCard, { width: cardWidth, backgroundColor: theme.cardBg, borderColor: theme.border }]}
//       >
//         <View style={styles.cardImageWrapper}>
//           <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.cardImage} />
//           <TouchableOpacity 
//             onPress={() => toggleFavorite(item.sr_no)} 
//             style={[styles.favBadge, { backgroundColor: theme.cardBg }]}
//           >
//             <Heart size={16} color="#EA4335" fill="#EA4335" />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.cardContent}>
//           <Text style={[styles.recipeTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
//           <Text style={[styles.recipeSub, { color: theme.textSecondary }]}>{cuisine}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.replace('/(tab)')} style={styles.backButton}>
//           <ArrowLeft size={24} color={theme.text} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: theme.text }]}>{t('favorites')}</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 50 }} />
//       ) : recipes.length === 0 ? (
//         <View style={styles.emptyState}>
//           <Heart size={64} color={theme.border} />
//           <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No favorites yet</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={recipes}
//           renderItem={renderRecipe}
//           keyExtractor={item => item.sr_no.toString()}
//           numColumns={numColumns}
//           contentContainerStyle={styles.listContent}
//           columnWrapperStyle={styles.columnWrapper}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 50,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     marginBottom: 20,
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   listContent: {
//     padding: 16,
//   },
//   columnWrapper: {
//     justifyContent: 'space-between',
//   },
//   recipeCard: {
//     borderRadius: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     overflow: 'hidden',
//   },
//   cardImageWrapper: {
//     height: 150,
//     width: '100%',
//   },
//   cardImage: {
//     height: '100%',
//     width: '100%',
//   },
//   favBadge: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     padding: 6,
//     borderRadius: 20,
//   },
//   cardContent: {
//     padding: 12,
//   },
//   recipeTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   recipeSub: {
//     fontSize: 12,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 100,
//   },
//   emptyText: {
//     marginTop: 16,
//     fontSize: 16,
//   },
// });



import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { fetchAllRecipes, Recipe } from '@/lib/github-data';
import { getRecipeImageUrl } from '@/lib/images';
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

// ─── Design Tokens (matches ProfileScreen) ────────────────────────
const C = {
  cream:      '#FDF6ED',
  parchment:  '#F5EBD8',
  terra:      '#C1440E',
  terraLight: '#E8622A',
  saffron:    '#E8A020',
  sage:       '#6B7C5C',
  ink:        '#2C1A0E',
  inkLight:   '#7A5C46',
  white:      '#FFFFFF',
  border:     '#E2CEB0',
  cardBg:     '#FFFAF4',
  errorRed:   '#D94040',
};

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [recipes, setRecipes]   = useState<Recipe[]>([]);
  const [loading, setLoading]   = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const isTablet   = width > 768;
  const numColumns = isTablet ? 3 : 2;
  const cardWidth  = (width - 40 - (numColumns - 1) * 14) / numColumns;

  useEffect(() => { loadFavorites(); }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const key  = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
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

  const toggleFavorite = async (sr_no: number) => {
    const id     = sr_no.toString();
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
    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })}
        activeOpacity={0.85}
        style={[styles.recipeCard, { width: cardWidth }]}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.cardImage} />
          {/* Fav heart badge */}
          <TouchableOpacity
            onPress={() => toggleFavorite(item.sr_no)}
            style={styles.favBadge}
          >
            <Heart size={14} color={C.errorRed} fill={C.errorRed} />
          </TouchableOpacity>
          {/* Cuisine pill */}
          <View style={styles.cuisinePill}>
            <Text style={styles.cuisinePillText}>{cuisine}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Decorative blobs (same as profile) */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tab)')} style={styles.backBtn}>
          <ArrowLeft size={20} color={C.terra} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>MY COLLECTION</Text>
          <Text style={styles.headerTitle}>{t('favorites')}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Heart size={14} color={C.errorRed} fill={C.errorRed} />
          <Text style={styles.headerBadgeText}>{recipes.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.terra} style={{ marginTop: 60 }} />
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Heart size={36} color={C.border} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>Recipes you love will appear here</Text>
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
  root: { flex: 1, backgroundColor: C.cream },

  blobTop: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: C.saffron + '18', top: -80, right: -70,
  },
  blobBottom: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: C.terra + '12', bottom: -60, left: -50,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  headerCenter: { flex: 1, paddingHorizontal: 14 },
  headerLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    color: C.inkLight, marginBottom: 2,
  },
  headerTitle: {
    fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: C.ink,
  },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  headerBadgeText: { fontSize: 13, fontWeight: '700', color: C.ink },

  // Recipe Cards
  listContent: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 14 },

  recipeCard: {
    backgroundColor: C.white, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  cardImageWrapper: { height: 140, width: '100%' },
  cardImage: { height: '100%', width: '100%' },
  favBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: C.white, padding: 6, borderRadius: 20,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  cuisinePill: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: C.ink + 'CC', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  cuisinePillText: { fontSize: 10, fontWeight: '700', color: C.white },

  cardContent: { padding: 12 },
  recipeTitle: {
    fontSize: 13, fontWeight: '700', color: C.ink, lineHeight: 18,
  },

  // Empty state
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 120,
  },
  emptyIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.parchment, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.ink, marginBottom: 6,
  },
  emptySubtitle: { fontSize: 13, color: C.inkLight, fontWeight: '500' },
});