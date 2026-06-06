import { LanguageCode, useLanguage, LANGUAGE_NAMES } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { fetchAllRecipes, Recipe } from '@/lib/github-data';
import { getRecipeImageUrl } from '@/lib/images';
import { translateObject } from '@/lib/google-translate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  Clock,
  Filter,
  Globe,
  Heart,
  LogIn,
  LogOut,
  Search,
  Users,
  X,
  ChefHat
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
  View,
  Platform,
  Alert,
} from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

const PAGE_SIZE = 12;

export default function RecipesHomeScreen() {
  const { colors: theme, isDark } = useTheme();
  const { t, language, setLanguage, isLanguageLoading } = useLanguage();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();

  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [displayRecipes, setDisplayRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

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
  const [showFavs, setShowFavs] = useState(false);

  const [translatedTitles, setTranslatedTitles] = useState<Record<string, string>>({});
  const [translatedTags, setTranslatedTags] = useState<Record<string, string>>({});

  const isTablet = width > 768;
  const numCols = isTablet ? 3 : 2;
  const cardWidth = (width - 40 - (numCols - 1) * 12) / numCols;

  const activeFilterCount = [selectedCuisine, selectedMeal, selectedDiet, selectedType, selectedSimple, selectedTechnique, selectedSource, showFavs ? 'favs' : null].filter(Boolean).length;

  useEffect(() => {
    const loadFavs = async () => {
      const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        try { setFavorites(JSON.parse(saved)); } catch { setFavorites([]); }
      }
    };
    loadFavs();
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAllRecipes();
      setAllRecipes(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => signOut() }
      ]
    );
  };

  const filtered = useMemo(() => {
    let r = [...allRecipes];
    if (showFavs) r = r.filter(x => favorites.includes(x.sr_no.toString()));
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(x =>
        (x.title?.toLowerCase() || '').includes(q) ||
        (x.description?.toLowerCase() || '').includes(q) ||
        x.tags?.type?.some(t => t.toLowerCase().includes(q)) ||
        x.tags?.cuisine?.some(c => c.toLowerCase().includes(q))
      );
    }
    
    if (selectedCuisine) r = r.filter(x => x.tags?.cuisine?.includes(selectedCuisine));
    if (selectedMeal) r = r.filter(x => x.tags?.meal?.includes(selectedMeal));
    if (selectedDiet) r = r.filter(x => x.tags?.['special-consideration']?.includes(selectedDiet));
    if (selectedType) r = r.filter(x => x.tags?.type?.includes(selectedType));
    if (selectedSimple) r = r.filter(x => x.tags?.['simple-cooking']?.includes(selectedSimple));
    if (selectedTechnique) r = r.filter(x => x.tags?.technique?.includes(selectedTechnique));
    if (selectedSource) r = r.filter(x => x.tags?.source?.includes(selectedSource));
    return r;
  }, [allRecipes, searchQuery, selectedCuisine, selectedMeal, selectedDiet, selectedType, selectedSimple, selectedTechnique, selectedSource, showFavs, favorites]);

  useEffect(() => {
    setDisplayRecipes(filtered.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(filtered.length > PAGE_SIZE);
  }, [filtered]);

  useEffect(() => {
    if (language === 'en') return;

    const translateMetadata = async () => {
      const titlesToTranslate: Record<string, string> = {};
      const tagsToTranslate: Record<string, string> = {};
      const targetLang = LANGUAGE_NAMES[language] || language;

      for (const recipe of displayRecipes) {
        const titleKey = `${recipe.sr_no}_${language}`;
        if (!translatedTitles[titleKey]) {
          titlesToTranslate[titleKey] = await translateObject(recipe.title, targetLang);
        }
        const cuisine = recipe.tags?.cuisine?.[0];
        if (cuisine && !translatedTags[`${cuisine}_${language}`]) {
          tagsToTranslate[`${cuisine}_${language}`] = await translateObject(cuisine, targetLang);
        }
      }

      if (Object.keys(titlesToTranslate).length > 0) {
        setTranslatedTitles(prev => ({ ...prev, ...titlesToTranslate }));
      }
      if (Object.keys(tagsToTranslate).length > 0) {
        setTranslatedTags(prev => ({ ...prev, ...tagsToTranslate }));
      }
    };

    translateMetadata();
  }, [displayRecipes, language]);

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await fetchAllRecipes(true);
    setAllRecipes(data || []);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    const end = (next + 1) * PAGE_SIZE;
    setDisplayRecipes(filtered.slice(0, end));
    setPage(next);
    setHasMore(filtered.length > end);
    setLoadingMore(false);
  };

  const toggleFav = async (sr_no: number) => {
    const id = sr_no.toString();
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    const newFavs = favorites.includes(id) ? favorites.filter(i => i !== id) : [...favorites, id];
    setFavorites(newFavs);
    await AsyncStorage.setItem(key, JSON.stringify(newFavs));
  };

  const renderCard = ({ item }: { item: Recipe }) => {
    const isFav = favorites.includes(item.sr_no.toString());
    const rawCuisine = item.tags?.cuisine?.[0] || 'General';
    const isVeg = item.tags?.['special-consideration']?.includes('Vegetarian') ?? true;
    
    const displayTitle = (language !== 'en' && translatedTitles[`${item.sr_no}_${language}`]) || item.title;
    const displayCuisine = (language !== 'en' && translatedTags[`${rawCuisine}_${language}`]) || rawCuisine;

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })}
        activeOpacity={0.9}
        style={[styles.card, { width: cardWidth, backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={styles.cardImgWrap}>
          <Image
            source={{ uri: getRecipeImageUrl(item.image_filename) }}
            style={styles.cardImg}
            resizeMode="cover"
          />
          <View style={[styles.vegDot, { borderColor: isVeg ? theme.success : theme.error }]}>
            <View style={[styles.vegDotInner, { backgroundColor: isVeg ? theme.success : theme.error }]} />
          </View>
          <TouchableOpacity
            onPress={() => toggleFav(item.sr_no)}
            style={[styles.favBtn, { backgroundColor: theme.surface }]}
          >
            <Heart
              size={14}
              color={isFav ? theme.error : theme.textSecondary}
              fill={isFav ? theme.error : 'transparent'}
            />
          </TouchableOpacity>
          <View style={styles.cuisineTag}>
            <Text style={styles.cuisineTagText}>{displayCuisine}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{displayTitle}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.metaPill, { backgroundColor: theme.backgroundElement }]}>
              <Clock size={11} color={theme.accent} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.cooking_time || '30'}m</Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: theme.backgroundElement }]}>
              <Users size={11} color={theme.accent} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.servings || '4'}</Text>
            </View>
          </View>
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
      <View style={[styles.navbar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.navTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeLabel, { color: theme.textSecondary }]}>{t('welcome')} 👋</Text>
            <Text style={[styles.navTitle, { color: theme.text }]}>{t('find_recipe')}</Text>
          </View>
          <View style={styles.navActions}>
            <TouchableOpacity
              onPress={() => setShowFavs(!showFavs)}
              style={[styles.navBtn, { backgroundColor: theme.surface, borderColor: theme.border }, showFavs && { borderColor: theme.error, backgroundColor: theme.error + '10' }]}
            >
              <Heart size={18} color={showFavs ? theme.error : theme.text} fill={showFavs ? theme.error : 'transparent'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLangModalVisible(true)} style={[styles.navBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Globe size={18} color={theme.text} />
            </TouchableOpacity>
            {user ? (
              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.navBtn, { backgroundColor: theme.error + '15', borderColor: theme.error + '30' }]}
              >
                <LogOut size={18} color={theme.error} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                style={[styles.navBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <LogIn size={18} color={theme.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('search_placeholder')}
              placeholderTextColor={theme.textSecondary + '80'}
              style={[styles.searchInput, { color: theme.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={[styles.filterBtn, { backgroundColor: theme.accent }]}
          >
            <Filter size={18} color="#FFFFFF" />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {showFavs && (
              <TouchableOpacity onPress={() => setShowFavs(false)} style={[styles.chip, { backgroundColor: theme.error + '15', borderColor: theme.error + '30' }]}>
                <Text style={[styles.chipText, { color: theme.error }]}>Favorites</Text>
                <X size={12} color={theme.error} />
              </TouchableOpacity>
            )}
            {[
              [selectedCuisine, setSelectedCuisine],
              [selectedMeal, setSelectedMeal],
              [selectedDiet, setSelectedDiet],
              [selectedType, setSelectedType],
              [selectedSimple, setSelectedSimple],
            ].map(([val, setter]: any) => val ? (
              <TouchableOpacity key={val} onPress={() => setter(null)} style={[styles.chip, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }]}>
                <Text style={[styles.chipText, { color: theme.accent }]}>
                  {(language !== 'en' && translatedTags[`${val}_${language}`]) || val}
                </Text>
                <X size={12} color={theme.accent} />
              </TouchableOpacity>
            ) : null)}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Preparing your recipes...</Text>
        </View>
      ) : (
        <FlatList
          data={displayRecipes}
          renderItem={renderCard}
          keyExtractor={item => item.sr_no.toString()}
          numColumns={numCols}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No recipes found</Text>
              <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Try adjusting your search or filters</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator size="small" color={theme.accent} style={{ margin: 20 }} />
          ) : null}
        />
      )}

      {/* FILTER MODAL */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.filterSheet}>
            <View style={[styles.filterHandle, { backgroundColor: theme.border }]} />
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: theme.text }]}>Filter Recipes</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <X size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterSection label="🌍 Cuisine" items={['Italian', 'European', 'American', 'Asian', 'Indian', 'French', 'Mexican']} selected={selectedCuisine} onSelect={setSelectedCuisine} theme={theme} language={language} translatedTags={translatedTags} />
              <FilterSection label="🍽️ Meal Type" items={['Dinner', 'Lunch', 'Side', 'Dessert', 'Breakfast', 'Main Course', 'Starter']} selected={selectedMeal} onSelect={setSelectedMeal} theme={theme} language={language} translatedTags={translatedTags} />
              <FilterSection label="🥗 Diet" items={['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut Free', 'Dairy-Free', 'Healthy']} selected={selectedDiet} onSelect={setSelectedDiet} theme={theme} language={language} translatedTags={translatedTags} />
              <FilterSection label="📦 Type" items={['Pasta', 'Risotto', 'Salad', 'Soup', 'Bread', 'Cake', 'Cookie']} selected={selectedType} onSelect={setSelectedType} theme={theme} language={language} translatedTags={translatedTags} />
              <FilterSection label="⚡ Quick Cooking" items={['30 Minutes or Less', 'Weeknight Meals', 'Quick & Easy']} selected={selectedSimple} onSelect={setSelectedSimple} theme={theme} language={language} translatedTags={translatedTags} />
              <FilterSection label="🔥 Technique" items={['Saute', 'Bake', 'Grill', 'Roast', 'Fry', 'Simmer']} selected={selectedTechnique} onSelect={setSelectedTechnique} theme={theme} language={language} translatedTags={translatedTags} />
              <FilterSection label="📖 Source" items={['Gourmet', 'Bon Appétit', 'Epicurious', 'Self']} selected={selectedSource} onSelect={setSelectedSource} theme={theme} language={language} translatedTags={translatedTags} />
            </ScrollView>
            <View style={styles.filterFooter}>
              <Button
                variant="outline"
                title="Clear All"
                onPress={() => {
                  setSelectedCuisine(null); setSelectedMeal(null); setSelectedDiet(null);
                  setSelectedType(null); setSelectedSimple(null); setSelectedTechnique(null);
                  setSelectedSource(null);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Apply Filters"
                onPress={() => setFilterVisible(false)}
                style={{ flex: 2 }}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal visible={langModalVisible} transparent animationType="fade">
        <View style={styles.centeredOverlay}>
          <Card style={styles.langModal}>
            <Text style={[styles.langModalTitle, { color: theme.text }]}>Choose Language</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(Object.keys(LANGUAGE_NAMES) as LanguageCode[]).map(code => (
                <TouchableOpacity
                  key={code}
                  onPress={async () => { await setLanguage(code); setLangModalVisible(false); }}
                  style={[styles.langItem, language === code && { backgroundColor: theme.accent + '15' }]}
                >
                  <Text style={[styles.langText, { color: theme.text }, language === code && { color: theme.accent, fontWeight: '800' }]}>
                    {LANGUAGE_NAMES[code]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setLangModalVisible(false)} style={styles.cancelBtn}>
              <Text style={[styles.cancelBtnText, { color: theme.accent }]}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const FilterSection = ({ label, items, selected, onSelect, theme, language, translatedTags }: any) => (
  <View style={filterStyles.section}>
    <Text style={[filterStyles.label, { color: theme.textSecondary }]}>{label}</Text>
    <View style={filterStyles.options}>
      {items.map((item: string) => {
        const displayItem = (language !== 'en' && translatedTags[`${item}_${language}`]) || item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(selected === item ? null : item)}
            style={[
              filterStyles.chip, 
              { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              selected === item && { backgroundColor: theme.accent, borderColor: theme.accent }
            ]}
          >
            <Text style={[filterStyles.chipText, { color: theme.textSecondary }, selected === item && { color: '#FFFFFF' }]}>
              {displayItem}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const filterStyles = StyleSheet.create({
  section: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 12, fontWeight: '600' },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  navbar: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  navTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  welcomeLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  navTitle: { fontSize: 22, fontWeight: '700' },
  navActions: { flexDirection: 'row', gap: 8 },
  navBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 23, paddingHorizontal: 14, borderWidth: 1.5, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  filterBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  filterBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  chipsScroll: { flexDirection: 'row', marginTop: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  listContent: { padding: 20, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  card: { borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  cardImgWrap: { width: '100%', height: 130, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  vegDot: { position: 'absolute', top: 8, left: 8, width: 16, height: 16, borderRadius: 2, borderWidth: 1.5, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  vegDotInner: { width: 6, height: 6, borderRadius: 3 },
  favBtn: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cuisineTag: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  cuisineTagText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', gap: 8 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  metaText: { fontSize: 10, fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { fontSize: 14, fontStyle: 'italic' },
  empty: { flex: 1, alignItems: 'center', marginTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyBody: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  filterSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '88%', width: '100%' },
  filterHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle: { fontSize: 20, fontWeight: '700' },
  filterFooter: { flexDirection: 'row', gap: 12, marginTop: 12 },
  centeredOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  langModal: { width: '100%', maxWidth: 320, padding: 24 },
  langModalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  langItem: { paddingVertical: 13, borderRadius: 12, marginBottom: 6, paddingHorizontal: 16 },
  langText: { fontSize: 15, fontWeight: '600' },
  cancelBtn: { marginTop: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700' },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  loadingText: { fontSize: 16, fontWeight: '600' },
});
