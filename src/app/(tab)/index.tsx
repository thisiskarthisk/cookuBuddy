// import { LanguageCode, useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { fetchAllRecipes, Recipe } from '@/lib/github-data';
// import { getRecipeImageUrl } from '@/lib/images';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import {
//   Clock,
//   Filter,
//   Globe,
//   Heart,
//   LogIn,
//   LogOut,
//   Search,
//   Users,
//   X
// } from 'lucide-react-native';
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from 'react-native';

// const LANGUAGES: { code: LanguageCode; label: string }[] = [
//   { code: 'en', label: 'English' },
//   { code: 'ta', label: 'Tamil (தமிழ்)' },
//   { code: 'hi', label: 'Hindi (हिन्दी)' },
//   { code: 'te', label: 'Telugu (తెలుగు)' },
//   { code: 'mr', label: 'Marathi (మరాठी)' },
//   { code: 'bn', label: 'Bengali (বাংলা)' },
// ];

// const PAGE_SIZE = 12;

// // --- Main Screen ---

// export default function RecipesHomeScreen() {
//   const { colors: theme, isDark } = useTheme();
//   const { t, language, setLanguage } = useLanguage();
//   const router = useRouter();
//   const { width } = useWindowDimensions();
//   const { user , signOut} = useAuth();

//   // State
//   const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
//   const [displayRecipes, setDisplayRecipes] = useState<Recipe[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
  
//   // Filters
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterVisible, setFilterVisible] = useState(false);
//   const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
//   const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
//   const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
//   const [selectedType, setSelectedType] = useState<string | null>(null);
//   const [selectedSimple, setSelectedSimple] = useState<string | null>(null);
//   const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
//   const [selectedSource, setSelectedSource] = useState<string | null>(null);

//   const [langModalVisible, setLangModalVisible] = useState(false);
//   const [favorites, setFavorites] = useState<string[]>([]);
//   const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

//   const isTablet = width > 768;
//   const numColumns = isTablet ? 3 : 2;
//   const cardWidth = (width - 32 - (numColumns - 1) * 16) / numColumns;

//   // Load favorites
//   useEffect(() => {
//     const loadFavs = async () => {
//       const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//       const saved = await AsyncStorage.getItem(key);
//       if (saved) {
//         try { setFavorites(JSON.parse(saved)); } catch (e) { setFavorites([]); }
//       }
//     };
//     loadFavs();
//   }, [user]);

//   // Initial Data Load
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       const data = await fetchAllRecipes();
//       setAllRecipes(data || []);
//       setLoading(false);
//     };
//     loadData();
//   }, []);

//   // Filter Logic (Client-Side)
//   const filteredRecipesList = useMemo(() => {
//     let result = [...allRecipes];

//     if (showFavoritesOnly) {
//       result = result.filter(r => favorites.includes(r.sr_no.toString()));
//     }

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase().trim();
//       result = result.filter(r => 
//         (r.title?.toLowerCase() || '').includes(q) ||
//         (r.description?.toLowerCase() || '').includes(q) ||
//         r.tags?.type?.some(t => t.toLowerCase().includes(q)) ||
//         r.tags?.cuisine?.some(c => c.toLowerCase().includes(q))
//       );
//     }

//     // Defensive check for r.tags using optional chaining
//     if (selectedCuisine) result = result.filter(r => r.tags?.cuisine?.includes(selectedCuisine));
//     if (selectedMeal) result = result.filter(r => r.tags?.meal?.includes(selectedMeal));
//     if (selectedDiet) result = result.filter(r => r.tags?.['special-consideration']?.includes(selectedDiet));
//     if (selectedType) result = result.filter(r => r.tags?.type?.includes(selectedType));
//     if (selectedSimple) result = result.filter(r => r.tags?.['simple-cooking']?.includes(selectedSimple));
//     if (selectedTechnique) result = result.filter(r => r.tags?.technique?.includes(selectedTechnique));
//     if (selectedSource) result = result.filter(r => r.tags?.source?.includes(selectedSource));

//     return result;
//   }, [allRecipes, searchQuery, selectedCuisine, selectedMeal, selectedDiet, selectedType, selectedSimple, selectedTechnique, selectedSource, showFavoritesOnly, favorites]);

//   // Pagination Logic
//   useEffect(() => {
//     const batch = filteredRecipesList.slice(0, PAGE_SIZE);
//     setDisplayRecipes(batch);
//     setPage(0);
//     setHasMore(filteredRecipesList.length > PAGE_SIZE);
//   }, [filteredRecipesList]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     const data = await fetchAllRecipes(true);
//     setAllRecipes(data || []);
//     setRefreshing(false);
//   };

//   const loadMore = () => {
//     if (loadingMore || !hasMore) return;
//     setLoadingMore(true);
//     const nextPage = page + 1;
//     const end = (nextPage + 1) * PAGE_SIZE;
//     setDisplayRecipes(filteredRecipesList.slice(0, end));
//     setPage(nextPage);
//     setHasMore(filteredRecipesList.length > end);
//     setLoadingMore(false);
//   };

//   const toggleFavorite = async (sr_no: number) => {
//     const id = sr_no.toString();
//     const newFavs = favorites.includes(id) ? favorites.filter(i => i !== id) : [...favorites, id];
//     setFavorites(newFavs);
//     const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//     await AsyncStorage.setItem(key, JSON.stringify(newFavs));
//   };

//   const renderRecipe = ({ item }: { item: Recipe }) => {
//     const isFav = favorites.includes(item.sr_no.toString());
//     const cuisine = item.tags?.cuisine?.[0] || 'General';
//     const isVeg = item.tags?.['special-consideration']?.includes('Vegetarian') ?? true;
    
//     return (
//       <TouchableOpacity 
//         onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })} 
//         activeOpacity={0.9} 
//         style={[styles.recipeCard, { width: cardWidth, backgroundColor: theme.cardBg, borderColor: theme.border }]}
//       >
//         <View style={styles.cardImageWrapper}>
//           <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.cardImage} resizeMode="cover" />
//           <TouchableOpacity onPress={() => toggleFavorite(item.sr_no)} style={[styles.favBadgeCircle, { backgroundColor: theme.cardBg }]}>
//             <Heart size={16} color={isFav ? '#EA4335' : theme.textSecondary} fill={isFav ? '#EA4335' : 'transparent'} />
//           </TouchableOpacity>
//           <View style={styles.categoryTag}><Text style={styles.tagText}>{cuisine}</Text></View>
//           <View style={styles.foodTypeIndicatorContainer}>
//             <View style={[styles.foodTypeIndicator, { borderColor: isVeg ? '#34A853' : '#EA4335' }]}>
//               <View style={[styles.foodTypeDot, { backgroundColor: isVeg ? '#34A853' : '#EA4335' }]} />
//             </View>
//           </View>
//         </View>
//         <View style={styles.cardInfoContainer}>
//           <Text style={[styles.recipeCardTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
//           <View style={styles.metricsRow}>
//             <View style={styles.metaMetricItem}><Users size={12} color={theme.textSecondary} /><Text style={[styles.metricText, { color: theme.textSecondary }]}>{item.servings || '4'}</Text></View>
//             <View style={styles.metaMetricItem}><Clock size={12} color={theme.textSecondary} /><Text style={[styles.metricText, { color: theme.textSecondary }]}>{item.cooking_time || '30'}m</Text></View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* FIXED NAVBAR */}
//         <View style={[styles.navbar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
//           <View style={styles.headerRow}>
//             <View style={{ flex: 1, marginRight: 8 }}>
//               <Text style={[styles.welcomeText, { color: theme.textSecondary }]} numberOfLines={1}>{t('welcome')}</Text>
//               <Text style={[styles.appTitle, { color: theme.text }]} numberOfLines={1}>{t('find_recipe')}</Text>
//             </View>
//             <View style={styles.headerActions}>
//               <TouchableOpacity onPress={() => setShowFavoritesOnly(!showFavoritesOnly)} style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//                 <Heart size={18} color={showFavoritesOnly ? '#EA4335' : theme.text} fill={showFavoritesOnly ? '#EA4335' : 'transparent'} />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setLangModalVisible(true)} style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//                 <Globe size={18} color={theme.text} />
//               </TouchableOpacity>
//               {user ? (
//                 <TouchableOpacity onPress={() => signOut()} style={[styles.iconButton, { backgroundColor: '#EA433520', borderColor: '#EA4335' }]}>
//                   <LogOut size={18} color="#EA4335" />
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//                   <LogIn size={18} color={theme.text} />
//                 </TouchableOpacity>
//               )}
//             </View>
//         </View>

//         <View style={styles.searchContainer}>
//           <View style={[styles.searchBarWrapper, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//             <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
//             <TextInput
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               placeholder={t('search_placeholder')}
//               placeholderTextColor={theme.textSecondary}
//               style={[styles.searchInput, { color: theme.text }]}
//             />
//             {searchQuery.length > 0 && (
//               <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
//                 <X size={18} color={theme.textSecondary} />
//               </TouchableOpacity>
//             )}
//           </View>
//           <TouchableOpacity onPress={() => setFilterVisible(true)} style={[styles.filterButton, { backgroundColor: theme.accent }]}>
//             <Filter size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         {(selectedCuisine || selectedMeal || selectedDiet || selectedType || selectedSimple || selectedTechnique || selectedSource || showFavoritesOnly) && (
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
//             {showFavoritesOnly && <TouchableOpacity onPress={() => setShowFavoritesOnly(false)} style={[styles.activeFilterChip, { backgroundColor: '#EA433520' }]}><Text style={[styles.activeFilterText, { color: '#EA4335' }]}>{t('favorites')}</Text><X size={14} color='#EA4335' /></TouchableOpacity>}
//             {selectedCuisine && <TouchableOpacity onPress={() => setSelectedCuisine(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedCuisine}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
//             {selectedMeal && <TouchableOpacity onPress={() => setSelectedMeal(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedMeal}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
//             {selectedDiet && <TouchableOpacity onPress={() => setSelectedDiet(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedDiet}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
//             {selectedType && <TouchableOpacity onPress={() => setSelectedType(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedType}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
//             {selectedSimple && <TouchableOpacity onPress={() => setSelectedSimple(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedSimple}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
//             {selectedTechnique && <TouchableOpacity onPress={() => setSelectedTechnique(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedTechnique}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
//             {selectedSource && <TouchableOpacity onPress={() => setSelectedSource(null)} style={[styles.activeFilterChip, { backgroundColor: theme.accent + '20' }]}><Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedSource}</Text><X size={14} color={theme.accent} /></TouchableOpacity>}
//           </ScrollView>
//         )}
//       </View>

//       {loading ? (
//         <View style={styles.centerLoader}><ActivityIndicator size="large" color={theme.accent} /></View>
//       ) : (
//         <FlatList
//           data={displayRecipes}
//           renderItem={renderRecipe}
//           keyExtractor={(item) => item.sr_no.toString()}
//           numColumns={numColumns}
//           columnWrapperStyle={styles.gridContainer}
//           contentContainerStyle={styles.listContent}
//           onEndReached={loadMore}
//           onEndReachedThreshold={0.5}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
//           ListEmptyComponent={<View style={styles.emptyContainer}><Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('no_results')}</Text></View>}
//           ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={theme.accent} style={{ margin: 20 }} /> : null}
//         />
//       )}

//       {/* FILTER MODAL */}
//       <Modal visible={filterVisible} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.filterModalContent, { backgroundColor: theme.cardBg }]}>
//             <View style={styles.filterHeader}><Text style={[styles.filterTitle, { color: theme.text }]}>Filter Recipes</Text><TouchableOpacity onPress={() => setFilterVisible(false)}><X size={24} color={theme.text} /></TouchableOpacity></View>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <FilterSection label="Cuisine" items={['Italian', 'European', 'American', 'Asian', 'Indian', 'French', 'Mexican']} selected={selectedCuisine} onSelect={setSelectedCuisine} theme={theme} />
//               <FilterSection label="Meal Type" items={['Dinner', 'Lunch', 'Side', 'Dessert', 'Breakfast', 'Main Course', 'Starter']} selected={selectedMeal} onSelect={setSelectedMeal} theme={theme} />
//               <FilterSection label="Diet" items={['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut Free', 'Dairy-Free', 'Healthy']} selected={selectedDiet} onSelect={setSelectedDiet} theme={theme} />
//               <FilterSection label="Type" items={['Pasta', 'Risotto', 'Salad', 'Soup', 'Bread', 'Cake', 'Cookie']} selected={selectedType} onSelect={setSelectedType} theme={theme} />
//               <FilterSection label="Simple Cooking" items={['30 Minutes or Less', 'Weeknight Meals', 'Quick & Easy']} selected={selectedSimple} onSelect={setSelectedSimple} theme={theme} />
//               <FilterSection label="Technique" items={['Saute', 'Bake', 'Grill', 'Roast', 'Fry', 'Simmer']} selected={selectedTechnique} onSelect={setSelectedTechnique} theme={theme} />
//               <FilterSection label="Source" items={['Gourmet', 'Bon Appétit', 'Epicurious', 'Self']} selected={selectedSource} onSelect={setSelectedSource} theme={theme} />
//             </ScrollView>
//             <TouchableOpacity onPress={() => setFilterVisible(false)} style={[styles.applyButton, { backgroundColor: theme.accent }]}><Text style={styles.applyButtonText}>Apply Filters</Text></TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Language Selection Modal */}
//       <Modal visible={langModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlayCentered}>
//           <View style={[styles.langModalContent, { backgroundColor: theme.cardBg }]}>
//             <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Language</Text>
//             {LANGUAGES.map(item => (
//               <TouchableOpacity key={item.code} onPress={async () => { await setLanguage(item.code); setLangModalVisible(false); }} style={[styles.langItem, language === item.code && { backgroundColor: theme.accent + '20' }]}><Text style={[styles.langText, { color: theme.text }, language === item.code && { color: theme.accent, fontWeight: '700' }]}>{item.label}</Text></TouchableOpacity>
//             ))}
//             <TouchableOpacity onPress={() => setLangModalVisible(false)} style={styles.closeBtn}><Text style={[styles.closeBtnText, { color: theme.accent }]}>Cancel</Text></TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const FilterSection = ({ label, items, selected, onSelect, theme }: any) => (
//   <View style={styles.filterSection}>
//     <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>{label}</Text>
//     <View style={styles.filterOptions}>{items.map((item: string) => (<TouchableOpacity key={item} onPress={() => onSelect(selected === item ? null : item)} style={[styles.filterChip, selected === item && { backgroundColor: theme.accent, borderColor: theme.accent }]}><Text style={[styles.filterChipText, { color: theme.textSecondary }, selected === item && { color: '#FFFFFF' }]}>{item}</Text></TouchableOpacity>))}</View>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   navbar: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   welcomeText: { fontSize: 14, fontWeight: '600' },
//   appTitle: { fontSize: 22, fontWeight: '800' },
//   headerActions: { flexDirection: 'row', gap: 10 },
//   iconButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
//   searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 8 },
//   searchBarWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 23, paddingHorizontal: 16, borderWidth: 1 },
//   searchIcon: { marginRight: 10 },
//   searchInput: { flex: 1, height: '100%', fontSize: 15 },
//   clearIcon: { padding: 4 },
//   filterButton: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
//   activeFiltersScroll: { flexDirection: 'row', marginTop: 8 },
//   activeFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, height: 32 },
//   activeFilterText: { fontSize: 12, fontWeight: '700' },
//   listContent: { padding: 16, paddingBottom: 100 },
//   gridContainer: { justifyContent: 'space-between' },
//   recipeCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 16, elevation: 2 },
//   cardImageWrapper: { width: '100%', height: 130 },
//   cardImage: { width: '100%', height: '100%' },
//   favBadgeCircle: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
//   categoryTag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
//   tagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
//   foodTypeIndicatorContainer: { position: 'absolute', top: 10, left: 10, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
//   foodTypeIndicator: { width: 12, height: 12, borderWidth: 1, borderRadius: 2, justifyContent: 'center', alignItems: 'center' },
//   foodTypeDot: { width: 4, height: 4, borderRadius: 2 },
//   cardInfoContainer: { padding: 12 },
//   recipeCardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
//   metricsRow: { flexDirection: 'row', gap: 10 },
//   metaMetricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   metricText: { fontSize: 11, fontWeight: '500' },
//   centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
//   emptyText: { fontSize: 16, fontWeight: '600' },
//   modalOverlayCentered: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   filterModalContent: { height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
//   filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
//   filterTitle: { fontSize: 20, fontWeight: '800' },
//   filterSection: { marginBottom: 20 },
//   filterLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
//   filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
//   filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
//   filterChipText: { fontSize: 12, fontWeight: '600' },
//   applyButton: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
//   applyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
//   langModalContent: { 
//     width: '100%', 
//     maxWidth: 320, 
//     borderRadius: 24, 
//     padding: 24,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//   },
//   modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
//   langItem: { paddingVertical: 14, borderRadius: 12, marginBottom: 8, paddingHorizontal: 16 },
//   langText: { fontSize: 15, fontWeight: '600' },
//   closeBtn: { marginTop: 10, alignItems: 'center' },
//   closeBtnText: { fontSize: 14, fontWeight: '700' },
// });



/**
 * CookuBuddy – Recipes Home Screen
 * Warm editorial aesthetic: cream + terracotta + saffron gold
 */

import { LanguageCode, useLanguage } from '@/hooks/use-language';
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
  LogOut,
  Search,
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
  View,
} from 'react-native';

// ─── Design Tokens ────────────────────────────────────────────────
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
  vegGreen:   '#34A853',
  nonVegRed:  '#EA4335',
};

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (మరాఠీ)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
];

const PAGE_SIZE = 12;

export default function RecipesHomeScreen() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();

  const [allRecipes, setAllRecipes]         = useState<Recipe[]>([]);
  const [displayRecipes, setDisplayRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading]               = useState(true);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [refreshing, setRefreshing]         = useState(false);
  const [page, setPage]                     = useState(0);
  const [hasMore, setHasMore]               = useState(true);

  const [searchQuery, setSearchQuery]       = useState('');
  const [filterVisible, setFilterVisible]   = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal]     = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet]     = useState<string | null>(null);
  const [selectedType, setSelectedType]     = useState<string | null>(null);
  const [selectedSimple, setSelectedSimple] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [favorites, setFavorites]           = useState<string[]>([]);
  const [showFavs, setShowFavs]             = useState(false);

  const isTablet  = width > 768;
  const numCols   = isTablet ? 3 : 2;
  const cardWidth = (width - 32 - (numCols - 1) * 12) / numCols;

  const activeFilterCount = [selectedCuisine, selectedMeal, selectedDiet, selectedType, selectedSimple, selectedTechnique, selectedSource, showFavs ? 'favs' : null].filter(Boolean).length;

  // Load favorites
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

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAllRecipes();
      setAllRecipes(data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Filter logic
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
    if (selectedCuisine)  r = r.filter(x => x.tags?.cuisine?.includes(selectedCuisine));
    if (selectedMeal)     r = r.filter(x => x.tags?.meal?.includes(selectedMeal));
    if (selectedDiet)     r = r.filter(x => x.tags?.['special-consideration']?.includes(selectedDiet));
    if (selectedType)     r = r.filter(x => x.tags?.type?.includes(selectedType));
    if (selectedSimple)   r = r.filter(x => x.tags?.['simple-cooking']?.includes(selectedSimple));
    if (selectedTechnique) r = r.filter(x => x.tags?.technique?.includes(selectedTechnique));
    if (selectedSource)   r = r.filter(x => x.tags?.source?.includes(selectedSource));
    return r;
  }, [allRecipes, searchQuery, selectedCuisine, selectedMeal, selectedDiet, selectedType, selectedSimple, selectedTechnique, selectedSource, showFavs, favorites]);

  useEffect(() => {
    setDisplayRecipes(filtered.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(filtered.length > PAGE_SIZE);
  }, [filtered]);

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
    const end  = (next + 1) * PAGE_SIZE;
    setDisplayRecipes(filtered.slice(0, end));
    setPage(next);
    setHasMore(filtered.length > end);
    setLoadingMore(false);
  };

  const toggleFav = async (sr_no: number) => {
    const id  = sr_no.toString();
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    const newFavs = favorites.includes(id) ? favorites.filter(i => i !== id) : [...favorites, id];
    setFavorites(newFavs);
    await AsyncStorage.setItem(key, JSON.stringify(newFavs));
  };

  const renderCard = ({ item }: { item: Recipe }) => {
    const isFav    = favorites.includes(item.sr_no.toString());
    const cuisine  = item.tags?.cuisine?.[0] || 'General';
    const isVeg    = item.tags?.['special-consideration']?.includes('Vegetarian') ?? true;
    const mealType = item.tags?.meal?.[0] || '';

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(tab)/recipe-details', params: { id: item.sr_no } })}
        activeOpacity={0.92}
        style={[styles.card, { width: cardWidth }]}
      >
        <View style={styles.cardImgWrap}>
          <Image
            source={{ uri: getRecipeImageUrl(item.image_filename) }}
            style={styles.cardImg}
            resizeMode="cover"
          />
          {/* Veg indicator */}
          <View style={[styles.vegDot, { borderColor: isVeg ? C.vegGreen : C.nonVegRed }]}>
            <View style={[styles.vegDotInner, { backgroundColor: isVeg ? C.vegGreen : C.nonVegRed }]} />
          </View>
          {/* Fav button */}
          <TouchableOpacity
            onPress={() => toggleFav(item.sr_no)}
            style={styles.favBtn}
            activeOpacity={0.8}
          >
            <Heart
              size={14}
              color={isFav ? C.nonVegRed : C.inkLight}
              fill={isFav ? C.nonVegRed : 'transparent'}
            />
          </TouchableOpacity>
          {/* Cuisine tag */}
          <View style={styles.cuisineTag}>
            <Text style={styles.cuisineTagText}>{cuisine}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {mealType ? <Text style={styles.cardMeal}>{mealType}</Text> : null}
          <View style={styles.cardMeta}>
            <View style={styles.metaPill}>
              <Clock size={11} color={C.terra} />
              <Text style={styles.metaText}>{item.cooking_time || '30'}m</Text>
            </View>
            <View style={styles.metaPill}>
              <Users size={11} color={C.terra} />
              <Text style={styles.metaText}>{item.servings || '4'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <View style={styles.root}>
      {/* ── NAVBAR ── */}
      <View style={styles.navbar}>
        {/* Top row */}
        <View style={styles.navTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeLabel}>{t('welcome')} 👋</Text>
            <Text style={styles.navTitle}>{t('find_recipe')}</Text>
          </View>
          <View style={styles.navActions}>
            <TouchableOpacity
              onPress={() => setShowFavs(!showFavs)}
              style={[styles.navBtn, showFavs && { backgroundColor: C.nonVegRed + '18', borderColor: C.nonVegRed }]}
            >
              <Heart size={18} color={showFavs ? C.nonVegRed : C.ink} fill={showFavs ? C.nonVegRed : 'transparent'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLangModalVisible(true)} style={styles.navBtn}>
              <Globe size={18} color={C.ink} />
            </TouchableOpacity>
            {user ? (
              <TouchableOpacity
                onPress={() => signOut()}
                style={[styles.navBtn, { backgroundColor: C.terra + '15', borderColor: C.terra + '40' }]}
              >
                <LogOut size={18} color={C.terra} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                style={styles.navBtn}
              >
                <LogIn size={18} color={C.ink} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color={C.inkLight} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('search_placeholder')}
              placeholderTextColor={C.inkLight + '80'}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={C.inkLight} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={[styles.filterBtn, activeFilterCount > 0 && { backgroundColor: C.terra }]}
          >
            <Filter size={18} color={activeFilterCount > 0 ? C.white : C.white} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {showFavs && (
              <TouchableOpacity onPress={() => setShowFavs(false)} style={[styles.chip, { backgroundColor: C.nonVegRed + '18', borderColor: C.nonVegRed }]}>
                <Text style={[styles.chipText, { color: C.nonVegRed }]}>Favorites</Text>
                <X size={12} color={C.nonVegRed} />
              </TouchableOpacity>
            )}
            {[
              [selectedCuisine,   setSelectedCuisine],
              [selectedMeal,      setSelectedMeal],
              [selectedDiet,      setSelectedDiet],
              [selectedType,      setSelectedType],
              [selectedSimple,    setSelectedSimple],
              [selectedTechnique, setSelectedTechnique],
              [selectedSource,    setSelectedSource],
            ].map(([val, setter]: any) => val ? (
              <TouchableOpacity key={val} onPress={() => setter(null)} style={styles.chip}>
                <Text style={styles.chipText}>{val}</Text>
                <X size={12} color={C.terra} />
              </TouchableOpacity>
            ) : null)}
          </ScrollView>
        )}
      </View>

      {/* ── LIST ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.terra} />
          <Text style={styles.loaderText}>Preparing your recipes...</Text>
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.terra} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No recipes found</Text>
              <Text style={styles.emptyBody}>Try adjusting your search or filters</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator size="small" color={C.terra} style={{ margin: 20 }} />
          ) : null}
        />
      )}

      {/* ── FILTER MODAL ── */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.filterHandle} />
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Recipes</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <X size={22} color={C.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterSection label="🌍 Cuisine"       items={['Italian','European','American','Asian','Indian','French','Mexican']} selected={selectedCuisine}   onSelect={setSelectedCuisine} />
              <FilterSection label="🍽️ Meal Type"     items={['Dinner','Lunch','Side','Dessert','Breakfast','Main Course','Starter']} selected={selectedMeal}  onSelect={setSelectedMeal} />
              <FilterSection label="🥗 Diet"          items={['Vegetarian','Vegan','Gluten-Free','Nut Free','Dairy-Free','Healthy']} selected={selectedDiet}    onSelect={setSelectedDiet} />
              <FilterSection label="📦 Type"          items={['Pasta','Risotto','Salad','Soup','Bread','Cake','Cookie']} selected={selectedType}                  onSelect={setSelectedType} />
              <FilterSection label="⚡ Quick Cooking" items={['30 Minutes or Less','Weeknight Meals','Quick & Easy']} selected={selectedSimple}                 onSelect={setSelectedSimple} />
              <FilterSection label="🔥 Technique"     items={['Saute','Bake','Grill','Roast','Fry','Simmer']} selected={selectedTechnique}                       onSelect={setSelectedTechnique} />
              <FilterSection label="📖 Source"        items={['Gourmet','Bon Appétit','Epicurious','Self']} selected={selectedSource}                            onSelect={setSelectedSource} />
            </ScrollView>
            <View style={styles.filterFooter}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCuisine(null); setSelectedMeal(null); setSelectedDiet(null);
                  setSelectedType(null); setSelectedSimple(null); setSelectedTechnique(null);
                  setSelectedSource(null);
                }}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
                style={styles.applyBtn}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── LANGUAGE MODAL ── */}
      <Modal visible={langModalVisible} transparent animationType="fade">
        <View style={styles.centeredOverlay}>
          <View style={styles.langModal}>
            <Text style={styles.langModalTitle}>Choose Language</Text>
            {LANGUAGES.map(item => (
              <TouchableOpacity
                key={item.code}
                onPress={async () => { await setLanguage(item.code); setLangModalVisible(false); }}
                style={[styles.langItem, language === item.code && styles.langItemActive]}
              >
                <Text style={[styles.langText, language === item.code && styles.langTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setLangModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Filter Section Component ────────────────────────────────────
const FilterSection = ({ label, items, selected, onSelect }: any) => (
  <View style={filterStyles.section}>
    <Text style={filterStyles.label}>{label}</Text>
    <View style={filterStyles.options}>
      {items.map((item: string) => (
        <TouchableOpacity
          key={item}
          onPress={() => onSelect(selected === item ? null : item)}
          style={[filterStyles.chip, selected === item && filterStyles.chipActive]}
        >
          <Text style={[filterStyles.chipText, selected === item && filterStyles.chipTextActive]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const filterStyles = StyleSheet.create({
  section:       { marginBottom: 20 },
  label:         { fontSize: 13, fontWeight: '700', color: C.inkLight, marginBottom: 10 },
  options:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.parchment },
  chipActive:    { backgroundColor: C.terra, borderColor: C.terra },
  chipText:      { fontSize: 12, fontWeight: '600', color: C.inkLight },
  chipTextActive:{ color: C.white },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },

  // Navbar
  navbar: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.cream,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  welcomeLabel: { fontSize: 12, fontWeight: '600', color: C.inkLight, letterSpacing: 0.3 },
  navTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: C.ink },
  navActions: { flexDirection: 'row', gap: 8 },
  navBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1.5,
    borderColor: C.border, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
  },

  // Search
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', height: 46,
    backgroundColor: C.white, borderRadius: 23, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: C.border, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: C.ink },
  filterBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: C.saffron,
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute', top: -4, right: -4, width: 18, height: 18,
    borderRadius: 9, backgroundColor: C.terra, justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: C.white },

  // Chips
  chipsScroll: { flexDirection: 'row', marginTop: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8,
    backgroundColor: C.terra + '15', borderWidth: 1, borderColor: C.terra + '40',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: C.terra },

  // List
  listContent: { padding: 16, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },

  // Card
  card: {
    backgroundColor: C.cardBg, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardImgWrap: { width: '100%', height: 130, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  vegDot: {
    position: 'absolute', top: 8, left: 8, width: 16, height: 16,
    borderRadius: 2, borderWidth: 1.5, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
  },
  vegDotInner: { width: 6, height: 6, borderRadius: 3 },
  favBtn: {
    position: 'absolute', top: 6, right: 6, width: 28, height: 28,
    borderRadius: 14, backgroundColor: C.white + 'EE',
    justifyContent: 'center', alignItems: 'center',
  },
  cuisineTag: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(44,26,14,0.7)', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  cuisineTagText: { color: C.white, fontSize: 9, fontWeight: '700' },

  cardBody: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 3, lineHeight: 18 },
  cardMeal: { fontSize: 10, color: C.inkLight, fontWeight: '600', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', gap: 8 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.parchment, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  metaText: { fontSize: 10, fontWeight: '600', color: C.inkLight },

  // Loader
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: {
    fontFamily: 'Georgia', fontSize: 14, color: C.inkLight, fontStyle: 'italic',
  },

  // Empty
  empty: { flex: 1, alignItems: 'center', marginTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.ink },
  emptyBody: { fontSize: 13, color: C.inkLight },

  // Filter modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(44,26,14,0.4)', justifyContent: 'flex-end' },
  filterSheet: {
    backgroundColor: C.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, maxHeight: '88%',
  },
  filterHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: C.border,
    alignSelf: 'center', marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  filterTitle: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: C.ink },
  filterFooter: { flexDirection: 'row', gap: 12, marginTop: 12 },
  clearBtn: {
    flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border,
  },
  clearBtnText: { fontSize: 14, fontWeight: '700', color: C.inkLight },
  applyBtn: {
    flex: 2, height: 50, borderRadius: 14, backgroundColor: C.terra,
    justifyContent: 'center', alignItems: 'center',
  },
  applyBtnText: { fontSize: 14, fontWeight: '800', color: C.white },

  // Language modal
  centeredOverlay: {
    flex: 1, backgroundColor: 'rgba(44,26,14,0.4)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  langModal: {
    width: '100%', maxWidth: 320, backgroundColor: C.cream,
    borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border,
  },
  langModalTitle: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700',
    color: C.ink, textAlign: 'center', marginBottom: 16,
  },
  langItem: { paddingVertical: 13, borderRadius: 12, marginBottom: 6, paddingHorizontal: 16 },
  langItemActive: { backgroundColor: C.terra + '18' },
  langText: { fontSize: 15, fontWeight: '600', color: C.ink },
  langTextActive: { color: C.terra, fontWeight: '800' },
  cancelBtn: { marginTop: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: C.terra },
});