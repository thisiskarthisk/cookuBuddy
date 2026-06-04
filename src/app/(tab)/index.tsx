import { LanguageCode, useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { fetchAllRecipes, Recipe } from '@/lib/github-data';
import { getRecipeImageUrl } from '@/lib/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  Clock,
  Filter,
  Globe,
  Heart,
  LogIn,
  Search,
  User2Icon,
  Users,
  X
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
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

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (మరాठी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
];

const PAGE_SIZE = 12;

// --- Main Screen ---

export default function RecipesHomeScreen() {
  const { colors: theme, isDark } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  // State
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [displayRecipes, setDisplayRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSimple, setSelectedSimple] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const isTablet = width > 768;
  const numColumns = isTablet ? 3 : 2;
  const cardWidth = (width - 32 - (numColumns - 1) * 16) / numColumns;

  // Load favorites
  useEffect(() => {
    const loadFavs = async () => {
      const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        try { setFavorites(JSON.parse(saved)); } catch (e) { setFavorites([]); }
      }
    };
    loadFavs();
  }, [user]);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchAllRecipes();
      setAllRecipes(data || []);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter Logic (Client-Side)
  const filteredRecipesList = useMemo(() => {
    let result = [...allRecipes];

    if (showFavoritesOnly) {
      result = result.filter(r => favorites.includes(r.sr_no.toString()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        (r.title?.toLowerCase() || '').includes(q) ||
        (r.description?.toLowerCase() || '').includes(q) ||
        r.tags?.type?.some(t => t.toLowerCase().includes(q)) ||
        r.tags?.cuisine?.some(c => c.toLowerCase().includes(q))
      );
    }

    // Defensive check for r.tags using optional chaining
    if (selectedCuisine) result = result.filter(r => r.tags?.cuisine?.includes(selectedCuisine));
    if (selectedMeal) result = result.filter(r => r.tags?.meal?.includes(selectedMeal));
    if (selectedDiet) result = result.filter(r => r.tags?.['special-consideration']?.includes(selectedDiet));
    if (selectedType) result = result.filter(r => r.tags?.type?.includes(selectedType));
    if (selectedSimple) result = result.filter(r => r.tags?.['simple-cooking']?.includes(selectedSimple));
    if (selectedTechnique) result = result.filter(r => r.tags?.technique?.includes(selectedTechnique));
    if (selectedSource) result = result.filter(r => r.tags?.source?.includes(selectedSource));

    return result;
  }, [allRecipes, searchQuery, selectedCuisine, selectedMeal, selectedDiet, selectedType, selectedSimple, selectedTechnique, selectedSource, showFavoritesOnly, favorites]);

  // Pagination Logic
  useEffect(() => {
    const batch = filteredRecipesList.slice(0, PAGE_SIZE);
    setDisplayRecipes(batch);
    setPage(0);
    setHasMore(filteredRecipesList.length > PAGE_SIZE);
  }, [filteredRecipesList]);

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await fetchAllRecipes(true);
    setAllRecipes(data || []);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const end = (nextPage + 1) * PAGE_SIZE;
    setDisplayRecipes(filteredRecipesList.slice(0, end));
    setPage(nextPage);
    setHasMore(filteredRecipesList.length > end);
    setLoadingMore(false);
  };

  const toggleFavorite = async (sr_no: number) => {
    const id = sr_no.toString();
    const newFavs = favorites.includes(id) ? favorites.filter(i => i !== id) : [...favorites, id];
    setFavorites(newFavs);
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    await AsyncStorage.setItem(key, JSON.stringify(newFavs));
  };

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isFav = favorites.includes(item.sr_no.toString());
    const cuisine = item.tags?.cuisine?.[0] || 'General';
    const isVeg = item.tags?.['special-consideration']?.includes('Vegetarian') ?? true;
    
    return (
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })} 
        activeOpacity={0.9} 
        style={[styles.recipeCard, { width: cardWidth, backgroundColor: theme.cardBg, borderColor: theme.border }]}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.cardImage} resizeMode="cover" />
          <TouchableOpacity onPress={() => toggleFavorite(item.sr_no)} style={[styles.favBadgeCircle, { backgroundColor: theme.cardBg }]}>
            <Heart size={16} color={isFav ? '#EA4335' : theme.textSecondary} fill={isFav ? '#EA4335' : 'transparent'} />
          </TouchableOpacity>
          <View style={styles.categoryTag}><Text style={styles.tagText}>{cuisine}</Text></View>
          <View style={styles.foodTypeIndicatorContainer}>
            <View style={[styles.foodTypeIndicator, { borderColor: isVeg ? '#34A853' : '#EA4335' }]}>
              <View style={[styles.foodTypeDot, { backgroundColor: isVeg ? '#34A853' : '#EA4335' }]} />
            </View>
          </View>
        </View>
        <View style={styles.cardInfoContainer}>
          <Text style={[styles.recipeCardTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metaMetricItem}><Users size={12} color={theme.textSecondary} /><Text style={[styles.metricText, { color: theme.textSecondary }]}>{item.servings || '4'}</Text></View>
            <View style={styles.metaMetricItem}><Clock size={12} color={theme.textSecondary} /><Text style={[styles.metricText, { color: theme.textSecondary }]}>{item.cooking_time || '30'}m</Text></View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* FIXED NAVBAR */}
      <View style={[styles.navbar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>{t('welcome')}</Text>
            <Text style={[styles.appTitle, { color: theme.text }]}>{t('find_recipe')}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowFavoritesOnly(!showFavoritesOnly)} style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Heart size={18} color={showFavoritesOnly ? '#EA4335' : theme.text} fill={showFavoritesOnly ? '#EA4335' : 'transparent'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLangModalVisible(true)} style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Globe size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push(user ? '/(tab)/profile' : '/(auth)/login')} 
              style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            >
              {user ? <User2Icon size={18} color={theme.text} /> : <LogIn size={18} color={theme.text} />}
            </TouchableOpacity>
          </View>
        </View>

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
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => setFilterVisible(true)} style={[styles.filterButton, { backgroundColor: theme.accent }]}>
            <Filter size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {(selectedCuisine || selectedMeal || selectedDiet || selectedType || selectedSimple || selectedTechnique || selectedSource || showFavoritesOnly) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
            {showFavoritesOnly && <TouchableOpacity onPress={() => setShowFavoritesOnly(false)} style={[styles.activeFilterChip, { backgroundColor: '#EA433520' }]}><Text style={[styles.activeFilterText, { color: '#EA4335' }]}>{t('favorites')}</Text><X size={14} color='#EA4335' /></TouchableOpacity>}
            {selectedCuisine && <TouchableOpacity onPress={() => setSelectedCuisine(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedCuisine}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
            {selectedMeal && <TouchableOpacity onPress={() => setSelectedMeal(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedMeal}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
            {selectedDiet && <TouchableOpacity onPress={() => setSelectedDiet(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedDiet}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
            {selectedType && <TouchableOpacity onPress={() => setSelectedType(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedType}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
            {selectedSimple && <TouchableOpacity onPress={() => setSelectedSimple(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedSimple}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
            {selectedTechnique && <TouchableOpacity onPress={() => setSelectedTechnique(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedTechnique}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
            {selectedSource && <TouchableOpacity onPress={() => setSelectedSource(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedSource}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View style={styles.centerLoader}><ActivityIndicator size="large" color={theme.accent} /></View>
      ) : (
        <FlatList
          data={displayRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.sr_no.toString()}
          numColumns={numColumns}
          columnWrapperStyle={styles.gridContainer}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('no_results')}</Text></View>}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={theme.accent} style={{ margin: 20 }} /> : null}
        />
      )}

      {/* FILTER MODAL */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.filterModalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.filterHeader}><Text style={[styles.filterTitle, { color: theme.text }]}>Filter Recipes</Text><TouchableOpacity onPress={() => setFilterVisible(false)}><X size={24} color={theme.text} /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterSection label="Cuisine" items={['Italian', 'European', 'American', 'Asian', 'Indian', 'French', 'Mexican']} selected={selectedCuisine} onSelect={setSelectedCuisine} theme={theme} />
              <FilterSection label="Meal Type" items={['Dinner', 'Lunch', 'Side', 'Dessert', 'Breakfast', 'Main Course', 'Starter']} selected={selectedMeal} onSelect={setSelectedMeal} theme={theme} />
              <FilterSection label="Diet" items={['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut Free', 'Dairy-Free', 'Healthy']} selected={selectedDiet} onSelect={setSelectedDiet} theme={theme} />
              <FilterSection label="Type" items={['Pasta', 'Risotto', 'Salad', 'Soup', 'Bread', 'Cake', 'Cookie']} selected={selectedType} onSelect={setSelectedType} theme={theme} />
              <FilterSection label="Simple Cooking" items={['30 Minutes or Less', 'Weeknight Meals', 'Quick & Easy']} selected={selectedSimple} onSelect={setSelectedSimple} theme={theme} />
              <FilterSection label="Technique" items={['Saute', 'Bake', 'Grill', 'Roast', 'Fry', 'Simmer']} selected={selectedTechnique} onSelect={setSelectedTechnique} theme={theme} />
              <FilterSection label="Source" items={['Gourmet', 'Bon Appétit', 'Epicurious', 'Self']} selected={selectedSource} onSelect={setSelectedSource} theme={theme} />
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

const FilterSection = ({ label, items, selected, onSelect, theme }: any) => (
  <View style={styles.filterSection}>
    <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>{label}</Text>
    <View style={styles.filterOptions}>{items.map((item: string) => (<TouchableOpacity key={item} onPress={() => onSelect(selected === item ? null : item)} style={[styles.filterChip, selected === item && { backgroundColor: theme.accent, borderColor: theme.accent }]}><Text style={[styles.filterChipText, { color: theme.textSecondary }, selected === item && { color: '#FFFFFF' }]}>{item}</Text></TouchableOpacity>))}</View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  welcomeText: { fontSize: 14, fontWeight: '600' },
  appTitle: { fontSize: 22, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  searchBarWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 23, paddingHorizontal: 16, borderWidth: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 15 },
  clearIcon: { padding: 4 },
  filterButton: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  activeFiltersScroll: { flexDirection: 'row', marginTop: 8 },
  activeFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, height: 32 },
  activeFilterText: { fontSize: 12, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 100 },
  gridContainer: { justifyContent: 'space-between' },
  recipeCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 16, elevation: 2 },
  cardImageWrapper: { width: '100%', height: 130 },
  cardImage: { width: '100%', height: '100%' },
  favBadgeCircle: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  categoryTag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  foodTypeIndicatorContainer: { position: 'absolute', top: 10, left: 10, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  foodTypeIndicator: { width: 12, height: 12, borderWidth: 1, borderRadius: 2, justifyContent: 'center', alignItems: 'center' },
  foodTypeDot: { width: 4, height: 4, borderRadius: 2 },
  cardInfoContainer: { padding: 12 },
  recipeCardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metaMetricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { fontSize: 11, fontWeight: '500' },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterModalContent: { height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle: { fontSize: 20, fontWeight: '800' },
  filterSection: { marginBottom: 20 },
  filterLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  applyButton: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  applyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  langModalContent: { width: '100%', maxWidth: 320, alignSelf: 'center', borderRadius: 24, padding: 24, top: '30%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  langItem: { paddingVertical: 14, borderRadius: 12, marginBottom: 8, paddingHorizontal: 16 },
  langText: { fontSize: 15, fontWeight: '600' },
  closeBtn: { marginTop: 10, alignItems: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '700' },
});
