import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import { getRecipeImageUrl } from '@/lib/images';
import { getRecipeBySrNo, Recipe } from '@/lib/github-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  PlayCircle,
  Sparkles,
  Users,
  ChevronDown
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Modal,
  FlatList
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';

// --- Scaling Utility ---

const toFraction = (val: number): string => {
  const whole = Math.floor(val);
  const remainder = val - whole;
  
  if (remainder === 0) return whole.toString();
  
  const tolerance = 1.0e-6;
  const fractions: [number, string][] = [
    [0.25, '1/4'],
    [0.33, '1/3'],
    [0.5, '1/2'],
    [0.66, '2/3'],
    [0.75, '3/4'],
    [0.125, '1/8'],
    [0.375, '3/8'],
    [0.625, '5/8'],
    [0.875, '7/8']
  ];

  for (const [fVal, fStr] of fractions) {
    if (Math.abs(remainder - fVal) < 0.05) {
      return whole > 0 ? `${whole} ${fStr}` : fStr;
    }
  }

  return val.toFixed(1).replace(/\.?0+$/, '');
};

const scaleIngredient = (ingredient: string, originalServings: number, currentServings: number) => {
  if (!originalServings || originalServings === 0 || originalServings === currentServings) return ingredient;
  
  const factor = currentServings / originalServings;
  
  // Regex to find numbers and fractions at start of string
  // Matches "1", "1.5", "1/2", "1 1/2"
  const quantityRegex = /^(\d+)?\s?(\d+\/\d+)?|^\d+\.\d+/;
  const match = ingredient.match(quantityRegex);
  
  if (match && match[0].trim()) {
    const rawMatch = match[0].trim();
    let numericValue = 0;
    
    if (rawMatch.includes('/')) {
      const parts = rawMatch.split(' ');
      if (parts.length === 2) {
        const [w, f] = parts;
        const [n, d] = f.split('/');
        numericValue = parseInt(w) + (parseInt(n) / parseInt(d));
      } else {
        const [n, d] = parts[0].split('/');
        numericValue = parseInt(n) / parseInt(d);
      }
    } else {
      numericValue = parseFloat(rawMatch);
    }
    
    if (!isNaN(numericValue)) {
      const scaled = numericValue * factor;
      return ingredient.replace(rawMatch, toFraction(scaled));
    }
  }
  
  return ingredient;
};

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const { colors: theme, isDark } = useTheme(); 
  const { t, language } = useLanguage();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const innerScrollRef = useRef<ScrollView>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isFav, setIsFav] = useState(false);
  
  // Servings State
  const [currentServings, setCurrentServings] = useState(4);
  const [isServingModalVisible, setIsServingModalVisible] = useState(false);
  
  // Description State
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      setActiveTab('ingredients');
      setCompletedItems([]);
      innerScrollRef.current?.scrollTo({ y: 0, animated: false });
      fetchRecipeData();
      checkIfFav();
    }
  }, [id]);

  const fetchRecipeData = async () => {
    try {
      setLoading(true);
      const data = await getRecipeBySrNo(id as string);
      if (data) {
        setRecipe(data);
        const baseServings = parseInt(data.servings || '4');
        setCurrentServings(isNaN(baseServings) ? 4 : baseServings);
      }
    } catch (err) {
      console.error('Error fetching recipe details:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFav = async () => {
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    const saved = await AsyncStorage.getItem(key);
    if (saved) {
      const favs = JSON.parse(saved);
      setIsFav(favs.includes(id.toString()));
    }
  };

  const toggleFavorite = async () => {
    const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    const saved = await AsyncStorage.getItem(key);
    let favs = saved ? JSON.parse(saved) : [];
    
    if (favs.includes(id.toString())) {
      favs = favs.filter((i: string) => i !== id.toString());
    } else {
      favs.push(id.toString());
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(favs));
    setIsFav(favs.includes(id.toString()));
  };

  const handleBackPress = () => {
    if (completedItems.length > 0) {
      Alert.alert(
        "Discard Progress?",
        "You have items marked down. Leaving now will reset your cooking progress checklist.",
        [
          { text: "Keep Cooking", style: "cancel" },
          { 
            text: "Discard & Exit", 
            style: "destructive", 
            onPress: () => {
              setCompletedItems([]);
              router.back(); 
            } 
          }
        ]
      );
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </ThemedView>
    );
  }

  if (!recipe) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <Text style={{ color: theme.text }}>Recipe not found</Text>
      </ThemedView>
    );
  }

  const baseServings = parseInt(recipe.servings || '4') || 4;
  const displayIngredients = recipe.ingredients.map(ing => scaleIngredient(ing, baseServings, currentServings));
  const displayInstructions = Object.entries(recipe.instructions)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([_, text]) => text);

  const toggleItemKey = (key: string) => {
    setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleNextToInstructions = () => {
    setActiveTab('instructions');
    setTimeout(() => {
      innerScrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const handleFinishRecipe = () => {
    Alert.alert(
      "Yum! Cooking Complete! 🎉",
      "Delicious job! We have reset your checkboxes so you can easily prepare this dish next time.",
      [
        { text: "Awesome!", onPress: () => {
            setCompletedItems([]);
            setActiveTab('ingredients');
            innerScrollRef.current?.scrollTo({ y: 0, animated: true });
          }
        }
      ]
    );
  };

  // THEME COLORS
  const bgMain = isDark ? '#0F172A' : '#F8FAFC';
  const bgSheet = isDark ? '#1E293B' : '#FFFFFF';
  const textMain = isDark ? '#FFFFFF' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const borderLine = isDark ? '#334155' : '#E2E8F0';
  const glassBg = isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.4)';

  const cuisine = recipe.tags?.cuisine?.[0] || 'General';
  const isVeg = recipe.tags?.['special-consideration']?.includes('Vegetarian') ?? true;

  return (
    <View style={[styles.container, { backgroundColor: bgMain }]}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: getRecipeImageUrl(recipe.image_filename) }} style={styles.mainImage} resizeMode="cover" />
        <View style={styles.gradientScrim} />

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleActionBtn} onPress={handleBackPress}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={[styles.glassProfileCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          <View style={styles.glassProfileLeft}>
            <View style={[styles.chefIconCircle, { backgroundColor: isVeg ? '#10B981' : '#EF4444' }]}>
              <Flame size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.chefMainTitle, { color: textMain }]}>{cuisine} Kitchen</Text>
              <Text style={[styles.chefSubtitleText, { color: textMuted }]}>
                {isVeg ? 'Vegetarian' : 'Non-Vegetarian'} • {recipe.tags?.meal?.[0] || 'Main'}
              </Text>
            </View>
          </View>
          <View style={[styles.trendingBadge, { backgroundColor: theme.accent }]}>
            <Award size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.trendingBadgeText}>{recipe.tags?.type?.[0] || 'Recipe'}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.bottomSheetSheet, { backgroundColor: bgSheet }]}>
        <View style={styles.titleWrapperRow}>
          <Text style={[styles.mainRecipeHeadline, { color: textMain }]} numberOfLines={2}>{recipe.title}</Text>
          <TouchableOpacity style={styles.favoriteCircleBadge} onPress={toggleFavorite}>
            <Bookmark size={20} color={isFav ? '#FFB000' : textMuted} fill={isFav ? '#FFB000' : 'transparent'} />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsBar}>
          <View style={styles.metricPill}>
            <Clock size={14} color={theme.accent} />
            <Text style={[styles.metricPillText, { color: textMuted }]}>{recipe.cooking_time || '30'}m</Text>
          </View>
          
          <TouchableOpacity style={styles.metricPill} onPress={() => setIsServingModalVisible(true)}>
            <Users size={14} color={theme.accent} />
            <Text style={[styles.metricPillText, { color: textMuted }]}>{currentServings} ppl</Text>
            <ChevronDown size={12} color={textMuted} />
          </TouchableOpacity>

          <View style={styles.metricPill}>
            <Sparkles size={14} color={theme.accent} />
            <Text style={[styles.metricPillText, { color: textMuted }]}>
              {recipe.ratings?.rating || '4.5'} ({recipe.ratings?.count || 0})
            </Text>
          </View>
        </View>

        <View style={[styles.descriptionBox, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
          <ScrollView 
            style={[styles.descriptionScroll, !isDescExpanded && { maxHeight: 60 }]} 
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={isDescExpanded}
          >
            <Text style={[styles.descriptionText, { color: textMuted }]}>
              {recipe.description}
            </Text>
          </ScrollView>
          {recipe.description && recipe.description.length > 100 && (
            <TouchableOpacity 
              onPress={() => setIsDescExpanded(!isDescExpanded)} 
              style={styles.readMoreBtn}
            >
              <Text style={[styles.readMoreText, { color: theme.accent }]}>
                {isDescExpanded ? "Show Less" : "Read More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.publishInfo}>
          <Text style={[styles.publishDate, { color: textMuted }]}>Published: {recipe.publish_date}</Text>
          {recipe.tags?.source && <Text style={[styles.sourceText, { color: theme.accent }]}>Source: {recipe.tags.source[0]}</Text>}
        </View>

        <View style={[styles.navigationTabs, { borderBottomColor: borderLine }]}>
          {['ingredients', 'instructions', 'video'].map(tab => (
            <TouchableOpacity 
              key={tab}
              style={[styles.navTabItem, activeTab === tab && { borderBottomColor: theme.accent }]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.navTabText, { color: activeTab === tab ? theme.accent : textMuted, textTransform: 'capitalize' }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView ref={innerScrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScrollArea}>
          {activeTab === 'ingredients' && (
            <View style={styles.dataStack}>
              {displayIngredients.map((item, index) => {
                const itemKey = `${recipe.sr_no}-ing-${index}`;
                const isCompleted = completedItems.includes(itemKey);
                return (
                  <TouchableOpacity
                    key={itemKey}
                    activeOpacity={0.8}
                    style={[styles.dataItemCard, { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: borderLine }, isCompleted && styles.itemCompleted]}
                    onPress={() => toggleItemKey(itemKey)}
                  >
                    <View style={styles.dataItemLeft}>
                      {isCompleted ? <CheckCircle2 size={18} color="#10B981" /> : <Circle size={18} color={textMuted + '60'} />}
                      <Text style={[styles.dataItemText, { color: isCompleted ? textMuted : textMain }, isCompleted && styles.strikeText]}>{item}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity activeOpacity={0.8} style={[styles.wizardBtn, { backgroundColor: theme.accent }]} onPress={handleNextToInstructions}>
                <Text style={styles.wizardBtnText}>Proceed to Steps</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'instructions' && (
            <View style={styles.dataStack}>
              {recipe.tags?.technique && (
                <View style={styles.techniqueRow}>
                  {recipe.tags.technique.map((t, i) => (
                    <View key={i} style={[styles.techniqueBadge, { backgroundColor: theme.accent + '15' }]}><Text style={[styles.techniqueText, { color: theme.accent }]}>{t}</Text></View>
                  ))}
                </View>
              )}
              {displayInstructions.map((step, index) => {
                const itemKey = `${recipe.sr_no}-ins-${index}`;
                const isCompleted = completedItems.includes(itemKey);
                return (
                  <TouchableOpacity
                    key={itemKey}
                    activeOpacity={0.8}
                    style={[styles.dataItemCard, { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: borderLine }, isCompleted && styles.itemCompleted]}
                    onPress={() => toggleItemKey(itemKey)}
                  >
                    <View style={styles.dataItemLeft}>
                      <View style={[styles.stepBadge, { backgroundColor: isCompleted ? textMuted + '30' : theme.accent + '15' }]}><Text style={[styles.stepBadgeText, { color: isCompleted ? textMuted : theme.accent }]}>{index + 1}</Text></View>
                      <Text style={[styles.stepText, { color: isCompleted ? textMuted : textMain }, isCompleted && styles.strikeText]}>{step}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity activeOpacity={0.8} style={[styles.wizardBtn, { backgroundColor: '#10B981' }]} onPress={handleFinishRecipe}>
                <Text style={styles.wizardBtnText}>Cooking Complete!</Text>
                <Sparkles size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'video' && (
            <View style={[styles.videoPlaceholder, { borderColor: borderLine, backgroundColor: isDark ? '#2D3748' : '#F8FAFC' }]}>
              <PlayCircle size={44} color={textMuted + '70'} />
              <Text style={[styles.videoPlaceholderText, { color: textMuted }]}>Video guide coming soon</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* SERVINGS SELECTION MODAL */}
      <Modal visible={isServingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.servingModalContent, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Servings</Text>
            <FlatList
              data={[1, 2, 3, 4, 5, 6, 8, 10, 12]}
              keyExtractor={item => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => { setCurrentServings(item); setIsServingModalVisible(false); }}
                  style={[styles.servingItem, currentServings === item && { backgroundColor: theme.accent + '20' }]}
                >
                  <Text style={[styles.servingText, { color: theme.text }, currentServings === item && { color: theme.accent, fontWeight: '700' }]}>{item} Servings</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setIsServingModalVisible(false)} style={styles.closeBtn}><Text style={[styles.closeBtnText, { color: theme.accent }]}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageWrapper: { width: '100%', height: 300 },
  mainImage: { width: '100%', height: '100%' },
  gradientScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.15)' },
  topBar: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  circleActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  glassProfileCard: { position: 'absolute', bottom: 30, left: 16, right: 16, height: 60, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
  glassProfileLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chefIconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  chefMainTitle: { fontSize: 13, fontWeight: '700' },
  chefSubtitleText: { fontSize: 10, fontWeight: '500' },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  trendingBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  bottomSheetSheet: { flex: 1, marginTop: -20, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 24 },
  titleWrapperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  mainRecipeHeadline: { fontSize: 20, fontWeight: '800', flex: 1 },
  favoriteCircleBadge: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  metricsBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 16 },
  metricPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  metricPillText: { fontSize: 12, fontWeight: '700' },
  descriptionBox: { borderRadius: 16, padding: 12, marginBottom: 16 },
  descriptionScroll: { width: '100%' },
  descriptionText: { fontSize: 14, lineHeight: 20 },
  readMoreBtn: { alignSelf: 'flex-end', marginTop: 4, padding: 4 },
  readMoreText: { fontSize: 13, fontWeight: '700' },
  publishInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  publishDate: { fontSize: 11, fontStyle: 'italic' },
  sourceText: { fontSize: 11, fontWeight: '700' },
  navigationTabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16 },
  navTabItem: { paddingVertical: 10, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navTabText: { fontSize: 13, fontWeight: '700' },
  innerScrollArea: { paddingBottom: 40 },
  dataStack: { gap: 10 },
  dataItemCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  dataItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  dataItemText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  stepBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepBadgeText: { fontWeight: '800', fontSize: 10 },
  stepText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 22 },
  itemCompleted: { opacity: 0.5, borderStyle: 'dashed' },
  strikeText: { textDecorationLine: 'line-through' },
  wizardBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 10 },
  wizardBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  videoPlaceholder: { width: '100%', borderRadius: 18, overflow: 'hidden', borderWidth: 1, height: 180, justifyContent: 'center', alignItems: 'center', gap: 10 },
  videoPlaceholderText: { fontSize: 12, fontWeight: '700' },
  techniqueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  techniqueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  techniqueText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  servingModalContent: { width: 280, maxHeight: 400, borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  servingItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4 },
  servingText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  closeBtn: { marginTop: 12, alignItems: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '700' },
});
