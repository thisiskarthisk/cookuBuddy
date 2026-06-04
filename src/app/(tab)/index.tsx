/*
 * CookuBuddy - Premium Recipes Home Feed Workspace
 * Features: Supabase Infinite Scroll, Global Localization, Dark Mode, Advanced Filters.
 * Stabilized: Search input focus persists during typing.
 */

import { LanguageCode, useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import {
  Clock,
  Filter,
  Globe,
  Heart,
  Search,
  Sparkles,
  Users,
  X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// --- Types ---
interface Recipe {
  id: string;
  srno: number;
  recipe_name: string;
  translated_recipe_name: string;
  cuisine: string;
  course: string;
  diet: string;
  total_time_in_mins: number;
  image_url: string;
  video_url: string | null;
  ingredients: string;
  translated_ingredients: string;
  instructions: string;
  translated_instructions: string;
  prep_time_in_mins: number;
  cook_time_in_mins: number;
  servings: string;
  url: string;
  created_at: string;
}

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (மराठी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
];

const PAGE_SIZE = 10;

// --- Sub-Components (Defined outside to prevent remounting and keyboard drop) ---

/**
 * Stable Header Component
 */
const HomeHeader = React.memo(({ t, theme, onLangPress, onProfilePress, showFavs, onFavToggle }: any) => (
  <View style={styles.headerRow}>
    <View style={styles.headerTextSection}>
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeText, { color: theme.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
          {t('welcome')} 
        </Text>
        <Sparkles size={16} color={theme.accent} style={{ marginLeft: 4 }} />
      </View>
      <Text style={[styles.appTitle, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {t('find_recipe')}
      </Text>
    </View>
    <View style={styles.headerActions}>
      <TouchableOpacity onPress={onFavToggle} style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <Heart size={18} color={showFavs ? '#EA4335' : theme.text} fill={showFavs ? '#EA4335' : 'transparent'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onLangPress} style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <Globe size={18} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onProfilePress} style={[styles.avatarButton, { borderColor: theme.accent }]}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' }} style={styles.avatarImage} />
      </TouchableOpacity>
    </View>
  </View>
));

/**
 * Stable Search Bar Component
 */
const SearchBar = React.memo(({ searchQuery, setSearchQuery, t, theme, onFilterPress }: any) => (
  <View style={styles.searchContainer}>
    <View style={[styles.searchBarWrapper, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('search_placeholder')}
        placeholderTextColor={theme.textSecondary}
        style={[styles.searchInput, { color: theme.text }]}
      />
    </View>
    <TouchableOpacity activeOpacity={0.8} onPress={onFilterPress} style={[styles.filterButton, { backgroundColor: theme.accent }]}>
      <Filter size={20} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
));

/**
 * FIXED: Moved ListHeader layout out of the main render loop into a standalone, pure layout element.
 * This guarantees everything inside it preserves state and prevents keyboard dismissals.
 */
const ListHeaderComponent = React.memo(({ 
  t, theme, setLangModalVisible, router, showFavoritesOnly, setShowFavoritesOnly, 
  searchQuery, setSearchQuery, setFilterVisible, selectedCuisine, setSelectedCuisine, 
  selectedCourse, setSelectedCourse, selectedDiet, setSelectedDiet 
}: any) => (
  <View style={styles.headerContainer}>
    <HomeHeader 
      t={t} theme={theme} 
      onLangPress={() => setLangModalVisible(true)} 
      onProfilePress={() => router.push('/(tab)/profile')} 
      showFavs={showFavoritesOnly} 
      onFavToggle={() => setShowFavoritesOnly(!showFavoritesOnly)} 
    />
    
    <SearchBar 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
      t={t} theme={theme} 
      onFilterPress={() => setFilterVisible(true)} 
    />

    {(selectedCuisine || selectedCourse || selectedDiet || showFavoritesOnly) && (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
        {showFavoritesOnly && (
          <TouchableOpacity onPress={() => setShowFavoritesOnly(false)} style={[styles.activeFilterChip, { backgroundColor: '#EA4335' + '20' }]}>
            <Text style={[styles.activeFilterText, { color: '#EA4335' }]}>Favorites</Text>
            <X size={14} color='#EA4335' />
          </TouchableOpacity>
        )}
        {selectedCuisine && <TouchableOpacity onPress={() => setSelectedCuisine(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedCuisine}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
        {selectedCourse && <TouchableOpacity onPress={() => setSelectedCourse(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedCourse}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
        {selectedDiet && <TouchableOpacity onPress={() => setSelectedDiet(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedDiet}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
      </ScrollView>
    )}
    <View style={styles.metaSection}><Text style={[styles.sectionTitle, { color: theme.text }]}>{t('discover')}</Text></View>
  </View>
));

// --- Main Screen ---

export default function RecipesHomeScreen() {
  const { colors: theme, isDark } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const isTablet = width > 768;
  const numColumns = isTablet ? 3 : 2;
  const cardWidth = (width - 32 - (numColumns - 1) * 16) / numColumns;

  // Data Fetching
  const fetchRecipes = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        pageNum === 0 ? setLoading(true) : setLoadingMore(true);
      }

      let query = supabase.from('recipes').select('*');

      if (selectedCuisine) query = query.eq('cuisine', selectedCuisine);
      if (selectedCourse) query = query.eq('course', selectedCourse);
      if (selectedDiet) query = query.eq('diet', selectedDiet);
      
      if (showFavoritesOnly) {
        if (favorites.length > 0) { query = query.in('id', favorites); }
        else { setRecipes([]); setHasMore(false); setLoading(false); setRefreshing(false); return; }
      }

      if (searchQuery) { query = query.ilike('recipe_name', `%${searchQuery}%`); }

      query = query
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const { data, error } = await query;
      console.log('Fetch attempt (recipes):', { pageNum, dataLength: data?.length, error });

      if (error) throw error;
      if (data) {
        if (isRefresh) { 
          setRecipes(data); 
        } else { 
          setRecipes(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newItems = data.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
          }); 
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (e) { 
      console.error('Fetch error:', e); 
    } finally { 
      setLoading(false); 
      setLoadingMore(false); 
      setRefreshing(false); 
    }
  }, [selectedCuisine, selectedCourse, selectedDiet, searchQuery, showFavoritesOnly, favorites]);

  useEffect(() => {
    setPage(0);
    fetchRecipes(0, true);
  }, [selectedCuisine, selectedCourse, selectedDiet, searchQuery, showFavoritesOnly, fetchRecipes]);

  const onRefresh = () => { setPage(0); fetchRecipes(0, true); };
  const loadMore = () => { if (!loadingMore && hasMore && !refreshing) { const next = page + 1; setPage(next); fetchRecipes(next); } };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- Render Functions ---

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isFav = favorites.includes(item.id);
    const displayName = item.translated_recipe_name || item.recipe_name || 'Unnamed Recipe';

    return (
      <TouchableOpacity onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.id } })} activeOpacity={0.9} style={[styles.recipeCard, { width: cardWidth, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: item.image_url }} style={styles.cardImage} />
          {/* <TouchableOpacity onPress={() => toggleFavorite(item.srno)} activeOpacity={0.8} style={[styles.favBadgeCircle, { backgroundColor: theme.cardBg }]}>
            <Heart size={16} color={isFav ? '#EA4335' : theme.textSecondary} fill={isFav ? '#EA4335' : 'transparent'} />
          </TouchableOpacity> */}
          <View style={styles.categoryTag}>
            <Text style={styles.tagText} numberOfLines={1} adjustsFontSizeToFit>{item.course || item.cuisine}</Text>
          </View>
          <View style={styles.foodTypeIndicatorContainer}>
            <View
              style={[
                styles.foodTypeIndicator,
                {
                  borderColor:
                    item.diet
                      ?.toLowerCase()
                      .includes('non')
                      ? '#E53935'
                      : '#22C55E',

                  backgroundColor:
                    theme.cardBg,
                },
              ]}
            >
              <View
                style={[
                  styles.foodTypeDot,
                  {
                    backgroundColor:
                      item.diet
                        ?.toLowerCase()
                        .includes('non')
                        ? '#E53935'
                        : '#22C55E',
                  },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.cardInfoContainer}>
          <Text style={[styles.recipeCardTitle, { color: theme.text }]} numberOfLines={5} adjustsFontSizeToFit minimumFontScale={0.8}>{displayName}</Text>
          <View style={styles.bottomMetaContainer}>
            <View style={styles.metricsRow}>
              {/* <View style={styles.metaMetricItem}>< size={12} color={theme.textSecondary} /><Text style={[styles.metricText, { color: theme.textSecondary }]}>{item.diet}</Text></View> */}
              <View style={styles.metaMetricItem}><Users size={12} color={theme.textSecondary} /><Text style={[styles.metricText, { color: theme.textSecondary }]}>{item.servings}</Text></View>
              <View style={styles.metaMetricItem}><Clock size={12} color={theme.textSecondary} /><Text style={[styles.metricText, { color: theme.textSecondary }]}>{item.total_time_in_mins}m</Text></View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading && page === 0 ? (
        <View style={styles.centerLoader}><ActivityIndicator size="large" color={theme.accent} /><Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('loading')}</Text></View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item, index) => item?.srno?.toString() || index.toString()}
          numColumns={numColumns}
          columnWrapperStyle={styles.gridContainer}
          ListHeaderComponent={
            <ListHeaderComponent
              t={t}
              theme={theme}
              setLangModalVisible={setLangModalVisible}
              router={router}
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={setShowFavoritesOnly}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setFilterVisible={setFilterVisible}
              selectedCuisine={selectedCuisine}
              setSelectedCuisine={setSelectedCuisine}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              selectedDiet={selectedDiet}
              setSelectedDiet={setSelectedDiet}
            />
          }
          ListFooterComponent={loadingMore ? <View style={styles.footerLoader}><ActivityIndicator size="small" color={theme.accent} /></View> : <View style={{ height: 20 }} />}
          contentContainerStyle={styles.scrollPadding}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('no_results')}</Text></View>}
        />
      )}

      {/* Advanced Filter Modal */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.filterModalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.filterHeader}><Text style={[styles.filterTitle, { color: theme.text }]}>Advanced Filters</Text><TouchableOpacity onPress={() => setFilterVisible(false)}><X size={24} color={theme.text} /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Cuisine</Text>
              <View style={styles.filterOptions}>{['Indian', 'South Indian Recipes', 'North Indian Recipes', 'Mediterranean'].map(c => (<TouchableOpacity key={c} onPress={() => setSelectedCuisine(selectedCuisine === c ? null : c)} style={[styles.filterChip, selectedCuisine === c && { backgroundColor: theme.accent, borderColor: theme.accent }]}><Text style={[styles.filterChipText, { color: theme.textSecondary }, selectedCuisine === c && { color: '#FFFFFF' }]}>{c}</Text></TouchableOpacity>))}</View>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Course</Text>
              <View style={styles.filterOptions}>{['Side Dish', 'Main Course', 'Appetizer', 'Dessert'].map(c => (<TouchableOpacity key={c} onPress={() => setSelectedCourse(selectedCourse === c ? null : c)} style={[styles.filterChip, selectedCourse === c && { backgroundColor: theme.accent, borderColor: theme.accent }]}><Text style={[styles.filterChipText, { color: theme.textSecondary }, selectedCourse === c && { color: '#FFFFFF' }]}>{c}</Text></TouchableOpacity>))}</View>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Diet</Text>
              <View style={styles.filterOptions}>{['Diabetic Friendly', 'Vegetarian', 'Gluten Free', 'High Protein Vegetarian'].map(d => (<TouchableOpacity key={d} onPress={() => setSelectedDiet(selectedDiet === d ? null : d)} style={[styles.filterChip, selectedDiet === d && { backgroundColor: theme.accent, borderColor: theme.accent }]}><Text style={[styles.filterChipText, { color: theme.textSecondary }, selectedDiet === d && { color: '#FFFFFF' }]}>{d}</Text></TouchableOpacity>))}</View>
            </ScrollView>
            <TouchableOpacity onPress={() => setFilterVisible(false)} style={[styles.applyButton, { backgroundColor: theme.accent }]}><Text style={styles.applyButtonText}>Apply Filters</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal visible={langModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.langModalContent, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Language</Text>
            {LANGUAGES.map(item => (
              <TouchableOpacity key={item.code} onPress={async () => { await setLanguage(item.code); setLangModalVisible(false); }} style={[styles.langItem, language === item.code && { backgroundColor: theme.accent + '20' }]}><Text style={[styles.langText, { color: theme.text }, language === item.code && { color: theme.accent, fontWeight: '700' }]}>{item.label}</Text></TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setLangModalVisible(false)} style={styles.closeBtn}><Text style={[styles.closeBtnText, { color: theme.accent }]}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollPadding: { paddingHorizontal: 16, paddingBottom: 40 },
  headerContainer: { paddingTop: 60, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTextSection: { flex: 1, marginRight: 10 },
  welcomeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  welcomeText: { fontSize: 15, fontWeight: '500' },
  appTitle: { fontSize: 24, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  searchBarWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 24, paddingHorizontal: 16, borderWidth: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 15 },
  filterButton: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  activeFiltersScroll: { gap: 10, paddingBottom: 16 },
  activeFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  activeFilterText: { fontSize: 13, fontWeight: '600' },
  metaSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  gridContainer: { justifyContent: 'space-between', marginBottom: 16 },
  recipeCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, elevation: 2 },
  cardImageWrapper: { width: '100%', height: 140, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  favBadgeCircle: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  categoryTag: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  cardInfoContainer: { padding: 14 , flex:1},
  recipeCardTitle: { fontSize: 12, fontWeight: '700', includeFontPadding: false },
  bottomMetaContainer: {marginTop: 'auto'},
  metricsRow: { flexDirection: 'row', marginTop: 12, gap: 15 },
  metaMetricItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metricText: { fontSize: 12, fontWeight: '500' },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 14, fontWeight: '600' },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  filterModalContent: { width: '100%', maxHeight: '80%', borderRadius: 32, padding: 24 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle: { fontSize: 22, fontWeight: '800' },
  filterLabel: { fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  applyButton: { height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  applyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  langModalContent: { width: '100%', maxWidth: 320, borderRadius: 28, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 24, textAlign: 'center' },
  langItem: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 8 },
  langText: { fontSize: 16, fontWeight: '500' },
  closeBtn: { marginTop: 12, paddingVertical: 10, alignItems: 'center' },
  closeBtnText: { fontSize: 15, fontWeight: '700' },

  foodTypeIndicator: {
    width: 18,

    height: 18,

    borderWidth: 1.5,

    borderRadius: 4,

    alignItems: 'center',

    justifyContent: 'center',
  },

  foodTypeDot: {
    width: 8,

    height: 8,

    borderRadius: 4,
  },

  foodTypeIndicatorContainer: {
    position: 'absolute', top: 1, right: 55, width: 30, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' ,marginRight: 100
  },

});