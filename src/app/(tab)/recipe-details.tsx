import { ThemedView } from '@/components/themed-view';
import { useLanguage, LANGUAGE_NAMES } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { getRecipeBySrNo, Recipe } from '@/lib/github-data';
import { getRecipeImageUrl } from '@/lib/images';
import { translateObject, translateArray } from '@/lib/google-translate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Flame,
  PlayCircle,
  Sparkles,
  Users,
  Info,
  ShoppingCart,
  BookOpen,
  ChevronRight,
  Lock
} from 'lucide-react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform
} from 'react-native';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

// --- Scaling Utility ---

const toFraction = (val: number): string => {
  const whole = Math.floor(val);
  const remainder = val - whole;
  if (remainder === 0) return whole.toString();
  const fractions: [number, string][] = [
    [0.25, '1/4'], [0.33, '1/3'], [0.5, '1/2'], [0.66, '2/3'], [0.75, '3/4'],
    [0.125, '1/8'], [0.375, '3/8'], [0.625, '5/8'], [0.875, '7/8']
  ];
  for (const [fVal, fStr] of fractions) {
    if (Math.abs(remainder - fVal) < 0.05) return whole > 0 ? `${whole} ${fStr}` : fStr;
  }
  return val.toFixed(1).replace(/\.?0+$/, '');
};

const scaleIngredient = (ingredient: string, originalServings: number, currentServings: number) => {
  if (!originalServings || originalServings === 0 || originalServings === currentServings) return ingredient;
  const factor = currentServings / originalServings;
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
  const { t, language, isLanguageLoading } = useLanguage();
  const { user } = useAuth();

  const mainScrollRef = useRef<ScrollView>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [displayRecipe, setDisplayRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [currentServings, setCurrentServings] = useState(4);
  const [isServingModalVisible, setIsServingModalVisible] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);

  // Gamification states
  const [isAlreadyCooked, setIsAlreadyCooked] = useState(false);

  // Derived states for flow control
  const allIngredientsChecked = useMemo(() => {
    if (!displayRecipe) return false;
    const ingKeys = displayRecipe.ingredients.map((_, i) => `${displayRecipe.sr_no}-ing-${i}`);
    return ingKeys.every(k => completedItems.includes(k));
  }, [displayRecipe, completedItems]);

  const allInstructionsChecked = useMemo(() => {
    if (!displayRecipe) return false;
    const insKeys = Object.keys(displayRecipe.instructions).map((_, i) => `${displayRecipe.sr_no}-ins-${i}`);
    return insKeys.every(k => completedItems.includes(k));
  }, [displayRecipe, completedItems]);

  const addToShoppingList = async () => {
    if (!displayRecipe || isAddingToList) return;
    setIsAddingToList(true);
    try {
      const storageKey = user ? `cooking_lists_v2_${user.id}` : 'cooking_lists_v2_guest';
      const saved = await AsyncStorage.getItem(storageKey);
      const lists = saved ? JSON.parse(saved) : [];
      
      const targetName = `${displayRecipe.title} Ingredients`;
      
      // Check if already exists
      const alreadyExists = lists.some((l: any) => l.recipeName === targetName);
      
      if (alreadyExists) {
        setIsAddingToList(false);
        Alert.alert(
          "Already Added",
          `The ingredients for "${displayRecipe.title}" are already in your Cooking List.`,
          [
            { text: "View List", onPress: () => router.push('/(tab)/shopping-list') },
            { text: "OK", style: "cancel" }
          ]
        );
        return;
      }

      const newList = {
        id: Date.now().toString(),
        recipeName: targetName,
        createdAt: new Date().toLocaleString(),
        items: displayRecipe.ingredients.map((ing, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: scaleIngredient(ing, parseInt(displayRecipe.servings || '4') || 4, currentServings),
          amount: '',
          unit: '',
          completed: false
        }))
      };
      
      await AsyncStorage.setItem(storageKey, JSON.stringify([newList, ...lists]));
      setIsAddingToList(false);
      
      Alert.alert(
        "Added to List",
        `All ingredients for "${displayRecipe.title}" have been added to your Cooking List.`,
        [
          { text: "View List", onPress: () => router.push('/(tab)/shopping-list') },
          { text: "OK", style: "cancel" }
        ]
      );
    } catch (e) {
      setIsAddingToList(false);
      console.error('Failed to add to shopping list:', e);
      Alert.alert("Error", "Could not add ingredients to your list.");
    }
  };

  useEffect(() => {
    if (id) {
      setRecipe(null);
      setDisplayRecipe(null);
      setLoading(true);
      setIsTranslating(false);
      setCompletedItems([]);
      fetchRecipeData();
      checkIfFav();
      checkIfCooked();
    }
  }, [id]);

  useEffect(() => {
    const performTranslation = async () => {
      if (!recipe) return;
      if (language === 'en') {
        setDisplayRecipe(recipe);
        return;
      }

      try {
        setIsTranslating(true);
        setDisplayRecipe(null); 
        
        const targetLang = LANGUAGE_NAMES[language];
        const cacheKey = `recipe_trans_v3_${id}_${language}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        
        if (cached) {
          setDisplayRecipe(JSON.parse(cached));
        } else {
          const title = await translateObject(recipe.title, targetLang);
          const description = await translateObject(recipe.description, targetLang);
          const ingredients = await translateArray(recipe.ingredients, targetLang);
          
          const insKeys = Object.keys(recipe.instructions).sort((a, b) => parseInt(a) - parseInt(b));
          const insValues = insKeys.map(k => recipe.instructions[k]);
          const translatedInsValues = await translateArray(insValues, targetLang);
          const instructions: Record<string, string> = {};
          insKeys.forEach((key, idx) => {
            instructions[key] = translatedInsValues[idx];
          });

          const finalRecipe = { ...recipe, title, description, ingredients, instructions };
          await AsyncStorage.setItem(cacheKey, JSON.stringify(finalRecipe));
          setDisplayRecipe(finalRecipe);
        }
      } catch (e) {
        console.error('[TRANS] Translation failed:', e);
        setDisplayRecipe(recipe);
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [recipe, language, id]);

  const fetchRecipeData = async () => {
    try {
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

  const checkIfCooked = async () => {
    const key = user ? `app_cooked_recipes_${user.id}` : 'app_cooked_recipes_guest';
    const saved = await AsyncStorage.getItem(key);
    if (saved) {
      const cooked = JSON.parse(saved);
      setIsAlreadyCooked(cooked.includes(id.toString()));
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
        "Keep Cooking?", 
        "You have checked items. Leaving will reset your current progress.", 
        [
          { text: "Keep Cooking", style: "cancel" },
          { text: "Discard & Exit", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleFinishRecipe = async () => {
    // Only increment cooked count if it's the first time
    if (!isAlreadyCooked) {
      const key = user ? `app_cooked_recipes_${user.id}` : 'app_cooked_recipes_guest';
      const saved = await AsyncStorage.getItem(key);
      const cooked = saved ? JSON.parse(saved) : [];
      if (!cooked.includes(id.toString())) {
        const next = [...cooked, id.toString()];
        await AsyncStorage.setItem(key, JSON.stringify(next));
        setIsAlreadyCooked(true);
      }
    }

    Alert.alert(
      "Cooking Completed! 🎉",
      "Congratulations! You've successfully prepared this dish. Your chef progress has been updated.",
      [
        { 
          text: "Done", 
          onPress: () => {
            setCompletedItems([]);
            mainScrollRef.current?.scrollTo({ y: 0, animated: true });
          } 
        }
      ]
    );
  };

  if (loading || isLanguageLoading || isTranslating || !displayRecipe) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ marginTop: 15, color: theme.textSecondary, fontWeight: '600' }}>
          {isLanguageLoading ? "Switching Language..." : 
           loading ? "Loading Recipe..." :
           `Translating to ${LANGUAGE_NAMES[language]}...`}
        </Text>
      </View>
    );
  }

  const baseServings = parseInt(displayRecipe.servings || '4') || 4;
  const displayIngredients = displayRecipe.ingredients.map(ing => scaleIngredient(ing, baseServings, currentServings));
  const displayInstructions = Object.entries(displayRecipe.instructions)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([_, text]) => text);

  const toggleItemKey = (key: string) => {
    setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const cuisine = displayRecipe.tags?.cuisine?.[0] || 'General';
  const isVeg = displayRecipe.tags?.['special-consideration']?.includes('Vegetarian') ?? true;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Area */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: getRecipeImageUrl(displayRecipe.image_filename) }} style={styles.mainImage} resizeMode="cover" />
        <View style={styles.gradientScrim} />
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleActionBtn} onPress={handleBackPress}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={[styles.glassProfileCard, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)', borderColor: theme.border }]}>
          <View style={styles.glassProfileLeft}>
            <View style={[styles.chefIconCircle, { backgroundColor: isVeg ? '#10B981' : '#EF4444' }]}>
              <Flame size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.chefMainTitle, { color: theme.text }]}>{cuisine} Kitchen</Text>
              <Text style={[styles.chefSubtitleText, { color: theme.textSecondary }]}>
                {isVeg ? 'Vegetarian' : 'Non-Vegetarian'} • {displayRecipe.tags?.meal?.[0] || 'Main'}
              </Text>
            </View>
          </View>
          {isAlreadyCooked && (
            <View style={[styles.trendingBadge, { backgroundColor: theme.success }]}>
              <Award size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.trendingBadgeText}>Mastered</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        ref={mainScrollRef} 
        style={styles.mainScroll} 
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.sheetContent, { backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 24 }]}>
          
          {/* Title & Stats */}
          <View style={styles.titleWrapperRow}>
            <Text style={[styles.mainRecipeHeadline, { color: theme.text }]} numberOfLines={2}>{displayRecipe.title}</Text>
            <TouchableOpacity style={styles.favoriteCircleBadge} onPress={toggleFavorite}>
              <Bookmark size={24} color={isFav ? theme.accent : theme.textSecondary} fill={isFav ? theme.accent : 'transparent'} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsBar}>
            <View style={[styles.metricPill, { backgroundColor: theme.backgroundElement }]}>
              <Clock size={14} color={theme.accent} />
              <Text style={[styles.metricPillText, { color: theme.textSecondary }]}>{displayRecipe.cooking_time || '30'}m</Text>
            </View>
            <TouchableOpacity style={[styles.metricPill, { backgroundColor: theme.backgroundElement }]} onPress={() => setIsServingModalVisible(true)}>
              <Users size={14} color={theme.accent} />
              <Text style={[styles.metricPillText, { color: theme.textSecondary }]}>{currentServings} ppl</Text>
              <ChevronDown size={12} color={theme.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.metricPill, { backgroundColor: theme.backgroundElement }]}>
              <Sparkles size={14} color={theme.accent} />
              <Text style={[styles.metricPillText, { color: theme.textSecondary }]}>{displayRecipe.ratings?.rating || '4.5'}</Text>
            </View>
          </View>

          {/* Intro Box */}
          <Card style={[styles.descriptionBox, { backgroundColor: theme.backgroundElement, borderStyle: 'none', shadowOpacity: 0, marginTop: 10 }]}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
              <Info size={14} color={theme.accent} />
              <Text style={[styles.chefNoteLabel, { color: theme.accent }]}>Chef's Note</Text>
            </View>
            <Text 
              style={[styles.descriptionText, { color: theme.textSecondary }]} 
              numberOfLines={isDescExpanded ? undefined : 3}
            >
              {displayRecipe.description}
            </Text>
            {displayRecipe.description && displayRecipe.description.length > 80 && (
              <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={styles.readMoreBtn}>
                <Text style={[styles.readMoreText, { color: theme.accent }]}>{isDescExpanded ? "Collapse" : "Read Full Intro"}</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* LINE BY LINE UI - SECTION 1: INGREDIENTS */}
          <View style={styles.sectionHeader}>
            <View style={styles.tabHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.accent + '15' }]}>
                  <ShoppingCart size={18} color={theme.accent} />
                </View>
                <Text style={[styles.tabHeaderTitle, { color: theme.text }]}>Ingredients Checklist</Text>
              </View>
              <TouchableOpacity 
                onPress={addToShoppingList}
                style={[styles.actionIconBtn, { backgroundColor: theme.accent + '15' }]}
              >
                {isAddingToList ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <ShoppingCart size={18} color={theme.accent} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              {completedItems.filter(k => k.includes('-ing-')).length} of {displayIngredients.length} prepared
            </Text>
          </View>

          <View style={styles.linearStack}>
            {displayIngredients.map((item, index) => {
              const itemKey = `${displayRecipe.sr_no}-ing-${index}`;
              const isCompleted = completedItems.includes(itemKey);
              return (
                <TouchableOpacity
                  key={itemKey}
                  activeOpacity={0.8}
                  style={[styles.dataItemCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, isCompleted && styles.itemCompleted]}
                  onPress={() => toggleItemKey(itemKey)}
                >
                  <View style={styles.dataItemLeft}>
                    {isCompleted ? <CheckCircle2 size={18} color={theme.success} /> : <Circle size={18} color={theme.textSecondary + '60'} />}
                    <Text style={[styles.dataItemText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeText]}>{item}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* LINE BY LINE UI - SECTION 2: INSTRUCTIONS */}
          <View style={[styles.sectionHeader, { marginTop: 40 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.accent + '15' }]}>
                <BookOpen size={18} color={theme.accent} />
              </View>
              <Text style={[styles.tabHeaderTitle, { color: theme.text }]}>Cooking Steps</Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Follow these {displayInstructions.length} steps to perfection
            </Text>
          </View>

          <View style={styles.linearStack}>
            {!allIngredientsChecked && (
              <View style={[styles.lockedOverlay, { backgroundColor: theme.backgroundElement + 'CC' }]}>
                <Lock size={24} color={theme.textSecondary} />
                <Text style={[styles.lockedText, { color: theme.textSecondary }]}>Finish checking ingredients to unlock steps</Text>
              </View>
            )}

            {displayInstructions.map((step, index) => {
              const itemKey = `${displayRecipe.sr_no}-ins-${index}`;
              const isCompleted = completedItems.includes(itemKey);
              return (
                <TouchableOpacity
                  key={itemKey}
                  disabled={!allIngredientsChecked}
                  activeOpacity={0.8}
                  style={[
                    styles.stepCard, 
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border }, 
                    isCompleted && styles.itemCompleted,
                    !allIngredientsChecked && { opacity: 0.3 }
                  ]}
                  onPress={() => toggleItemKey(itemKey)}
                >
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepBadge, { backgroundColor: isCompleted ? theme.success : theme.accent }]}>
                      <Text style={styles.stepBadgeText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.stepTitle, { color: isCompleted ? theme.success : theme.text }]}>
                      {isCompleted ? 'Step Complete' : `Step ${index + 1}`}
                    </Text>
                    {isCompleted && <CheckCircle2 size={16} color={theme.success} />}
                  </View>
                  <Text style={[styles.stepText, { color: theme.textSecondary }, isCompleted && styles.strikeText]}>{step}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Final Actions */}
          <View style={styles.finalActions}>
            {allInstructionsChecked ? (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.finishBtn, { backgroundColor: theme.success }]} 
                onPress={handleFinishRecipe}
              >
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={styles.finishBtnText}>Finalize Cooking Experience</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.progressHint, { backgroundColor: theme.backgroundElement }]}>
                <Text style={[styles.progressHintText, { color: theme.textSecondary }]}>
                  {allIngredientsChecked ? 'Complete all steps to finish' : 'Finish ingredients first'}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.publishInfo, { borderTopColor: theme.border, marginTop: 40 }]}>
            <Text style={[styles.publishDate, { color: theme.textSecondary }]}>Recipe Ref: {displayRecipe.sr_no}</Text>
            <Text style={[styles.sourceText, { color: theme.textSecondary }]}>CookuBuddy Culinary Library</Text>
          </View>
        </View>
      </ScrollView>

      {/* SERVINGS MODAL */}
      <Modal visible={isServingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.servingModalContent}>
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
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageWrapper: { width: '100%', height: 300, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  gradientScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.25)' },
  topBar: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  circleActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  glassProfileCard: { position: 'absolute', bottom: 20, left: 16, right: 16, height: 64, borderRadius: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
  glassProfileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chefIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  chefMainTitle: { fontSize: 14, fontWeight: '800' },
  chefSubtitleText: { fontSize: 11, fontWeight: '600' },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  trendingBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  
  mainScroll: { flex: 1, marginTop: -30 },
  sheetContent: { paddingHorizontal: 24 },
  titleWrapperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'start', gap: 16 },
  mainRecipeHeadline: { fontSize: 24, fontWeight: '900', flex: 1, lineHeight: 32 },
  favoriteCircleBadge: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginTop: -4 },
  metricsBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, marginBottom: 16 },
  metricPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  metricPillText: { fontSize: 13, fontWeight: '800' },
  
  descriptionBox: { padding: 16, marginBottom: 24, borderRadius: 20 },
  chefNoteLabel: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  descriptionText: { fontSize: 15, lineHeight: 24 },
  readMoreBtn: { alignSelf: 'flex-start', marginTop: 12 },
  readMoreText: { fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' },

  sectionHeader: { marginBottom: 16 },
  sectionIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 4, marginLeft: 42 },
  tabHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabHeaderTitle: { fontSize: 18, fontWeight: '900' },
  actionIconBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  linearStack: { gap: 12 },
  dataItemCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1 },
  dataItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  dataItemText: { fontSize: 15, fontWeight: '600', flex: 1, lineHeight: 22 },
  itemCompleted: { opacity: 0.5, borderStyle: 'dashed' },
  strikeText: { textDecorationLine: 'line-through' },

  stepCard: { padding: 18, borderRadius: 22, borderWidth: 1, gap: 10 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  stepTitle: { fontSize: 14, fontWeight: '800' },
  stepText: { fontSize: 15, lineHeight: 24, fontWeight: '500' },

  lockedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, borderRadius: 22, justifyContent: 'center', alignItems: 'center', gap: 10 },
  lockedText: { fontSize: 13, fontWeight: '700', textAlign: 'center', paddingHorizontal: 40 },

  finalActions: { marginTop: 32, alignItems: 'center' },
  finishBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 18, paddingHorizontal: 24, borderRadius: 20, width: '100%', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  finishBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  progressHint: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  progressHintText: { fontSize: 13, fontWeight: '700', fontStyle: 'italic' },

  publishInfo: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 16, paddingBottom: 20 },
  publishDate: { fontSize: 12, fontWeight: '600' },
  sourceText: { fontSize: 12, fontWeight: '700' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  servingModalContent: { width: 280, maxHeight: 400, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  servingItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4 },
  servingText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  closeBtn: { marginTop: 12, alignItems: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '700' },
});
