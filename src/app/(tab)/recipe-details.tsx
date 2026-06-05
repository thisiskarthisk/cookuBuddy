// import { ThemedView } from '@/components/themed-view';
// import { LANGUAGE_NAMES, useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { getRecipeBySrNo, Recipe } from '@/lib/github-data';
// import { getRecipeImageUrl } from '@/lib/images';
// import { translateObject } from '@/lib/puter';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import {
//   ArrowLeft,
//   ArrowRight,
//   Award,
//   Bookmark,
//   CheckCircle2,
//   ChevronDown,
//   Circle,
//   Clock,
//   Flame,
//   PlayCircle,
//   Sparkles,
//   Users
// } from 'lucide-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from 'react-native';

// // --- Scaling Utility ---

// const toFraction = (val: number): string => {
//   const whole = Math.floor(val);
//   const remainder = val - whole;
  
//   if (remainder === 0) return whole.toString();
  
//   const tolerance = 1.0e-6;
//   const fractions: [number, string][] = [
//     [0.25, '1/4'],
//     [0.33, '1/3'],
//     [0.5, '1/2'],
//     [0.66, '2/3'],
//     [0.75, '3/4'],
//     [0.125, '1/8'],
//     [0.375, '3/8'],
//     [0.625, '5/8'],
//     [0.875, '7/8']
//   ];

//   for (const [fVal, fStr] of fractions) {
//     if (Math.abs(remainder - fVal) < 0.05) {
//       return whole > 0 ? `${whole} ${fStr}` : fStr;
//     }
//   }

//   return val.toFixed(1).replace(/\.?0+$/, '');
// };

// const scaleIngredient = (ingredient: string, originalServings: number, currentServings: number) => {
//   if (!originalServings || originalServings === 0 || originalServings === currentServings) return ingredient;
  
//   const factor = currentServings / originalServings;
  
//   // Regex to find numbers and fractions at start of string
//   // Matches "1", "1.5", "1/2", "1 1/2"
//   const quantityRegex = /^(\d+)?\s?(\d+\/\d+)?|^\d+\.\d+/;
//   const match = ingredient.match(quantityRegex);
  
//   if (match && match[0].trim()) {
//     const rawMatch = match[0].trim();
//     let numericValue = 0;
    
//     if (rawMatch.includes('/')) {
//       const parts = rawMatch.split(' ');
//       if (parts.length === 2) {
//         const [w, f] = parts;
//         const [n, d] = f.split('/');
//         numericValue = parseInt(w) + (parseInt(n) / parseInt(d));
//       } else {
//         const [n, d] = parts[0].split('/');
//         numericValue = parseInt(n) / parseInt(d);
//       }
//     } else {
//       numericValue = parseFloat(rawMatch);
//     }
    
//     if (!isNaN(numericValue)) {
//       const scaled = numericValue * factor;
//       return ingredient.replace(rawMatch, toFraction(scaled));
//     }
//   }
  
//   return ingredient;
// };

// export default function RecipeDetailsScreen() {
//   const { id } = useLocalSearchParams(); 
//   const router = useRouter();
//   const { colors: theme, isDark } = useTheme(); 
//   const { t, language } = useLanguage();
//   const { width } = useWindowDimensions();
//   const { user } = useAuth();

//   const innerScrollRef = useRef<ScrollView>(null);

//   const [recipe, setRecipe] = useState<Recipe | null>(null);
//   const [displayRecipe, setDisplayRecipe] = useState<Recipe | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isTranslating, setIsTranslating] = useState(false);
//   const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
//   const [completedItems, setCompletedItems] = useState<string[]>([]);
//   const [isFav, setIsFav] = useState(false);
  
//   // Servings State
//   const [currentServings, setCurrentServings] = useState(4);
//   const [isServingModalVisible, setIsServingModalVisible] = useState(false);
  
//   // Description State
//   const [isDescExpanded, setIsDescExpanded] = useState(false);

//   useEffect(() => {
//     if (id) {
//       setActiveTab('ingredients');
//       setCompletedItems([]);
//       innerScrollRef.current?.scrollTo({ y: 0, animated: false });
//       fetchRecipeData();
//       checkIfFav();
//     }
//   }, [id]);

//   useEffect(() => {
//     const performTranslation = async () => {
//       if (!recipe) return;
      
//       if (language === 'en') {
//         setDisplayRecipe(recipe);
//         return;
//       }

//       try {
//         setIsTranslating(true);
//         const targetLang = LANGUAGE_NAMES[language];
//         const cacheKey = `recipe_trans_${id}_${language}`;
//         const cached = await AsyncStorage.getItem(cacheKey);
        
//         if (cached) {
//           setDisplayRecipe(JSON.parse(cached));
//         } else {
//           const toTranslate = {
//             title: recipe.title,
//             description: recipe.description,
//             ingredients: recipe.ingredients,
//             instructions: recipe.instructions
//           };
          
//           const translated = await translateObject(toTranslate, targetLang);
//           const finalRecipe = { ...recipe, ...translated };
//           await AsyncStorage.setItem(cacheKey, JSON.stringify(finalRecipe));
//           setDisplayRecipe(finalRecipe);
//         }
//       } catch (e) {
//         console.error('[TRANS] Translation failed:', e);
//         setDisplayRecipe(recipe);
//       } finally {
//         setIsTranslating(false);
//       }
//     };

//     performTranslation();
//   }, [recipe, language, id]);

//   const fetchRecipeData = async () => {
//     try {
//       setLoading(true);
//       const data = await getRecipeBySrNo(id as string);
//       if (data) {
//         setRecipe(data);
//         const baseServings = parseInt(data.servings || '4');
//         setCurrentServings(isNaN(baseServings) ? 4 : baseServings);
//       }
//     } catch (err) {
//       console.error('Error fetching recipe details:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkIfFav = async () => {
//     const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//     const saved = await AsyncStorage.getItem(key);
//     if (saved) {
//       const favs = JSON.parse(saved);
//       setIsFav(favs.includes(id.toString()));
//     }
//   };

//   const toggleFavorite = async () => {
//     const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//     const saved = await AsyncStorage.getItem(key);
//     let favs = saved ? JSON.parse(saved) : [];
    
//     if (favs.includes(id.toString())) {
//       favs = favs.filter((i: string) => i !== id.toString());
//     } else {
//       favs.push(id.toString());
//     }
    
//     await AsyncStorage.setItem(key, JSON.stringify(favs));
//     setIsFav(favs.includes(id.toString()));
//   };

//   const handleBackPress = () => {
//     if (completedItems.length > 0) {
//       Alert.alert(
//         "Discard Progress?",
//         "You have items marked down. Leaving now will reset your cooking progress checklist.",
//         [
//           { text: "Keep Cooking", style: "cancel" },
//           { 
//             text: "Discard & Exit", 
//             style: "destructive", 
//             onPress: () => {
//               setCompletedItems([]);
//               router.back(); 
//             } 
//           }
//         ]
//       );
//     } else {
//       router.back();
//     }
//   };

//   if (loading || (!displayRecipe && language !== 'en')) {
//     return (
//       <ThemedView style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={theme.accent} />
//         {isTranslating && (
//           <Text style={{ marginTop: 15, color: theme.textSecondary, fontWeight: '600' }}>
//             Translating to {LANGUAGE_NAMES[language]}...
//           </Text>
//         )}
//       </ThemedView>
//     );
//   }

//   if (!displayRecipe) {
//     return (
//       <ThemedView style={styles.loaderContainer}>
//         <Text style={{ color: theme.text }}>Recipe not found</Text>
//       </ThemedView>
//     );
//   }

//   const baseServings = parseInt(displayRecipe.servings || '4') || 4;
//   const displayIngredients = displayRecipe.ingredients.map(ing => scaleIngredient(ing, baseServings, currentServings));
//   const displayInstructions = Object.entries(displayRecipe.instructions)
//     .sort(([a], [b]) => parseInt(a) - parseInt(b))
//     .map(([_, text]) => text);

//   const toggleItemKey = (key: string) => {
//     setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   const allIngredientsDone = displayRecipe.ingredients.every((_, i) => completedItems.includes(`${displayRecipe.sr_no}-ing-${i}`));
//   const allInstructionsDone = displayInstructions.every((_, i) => completedItems.includes(`${displayRecipe.sr_no}-ins-${i}`));

//   const handleNextToInstructions = () => {
//     setActiveTab('instructions');
//     setTimeout(() => {
//       innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//     }, 100);
//   };

//   const handleFinishRecipe = () => {
//     Alert.alert(
//       t('cooking_complete_title'),
//       t('cooking_complete_msg'),
//       [
//         { text: t('awesome'), onPress: () => {
//             setCompletedItems([]);
//             setActiveTab('ingredients');
//             innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//           }
//         }
//       ]
//     );
//   };

//   // THEME COLORS
//   const bgMain = isDark ? '#0F172A' : '#F8FAFC';
//   const bgSheet = isDark ? '#1E293B' : '#FFFFFF';
//   const textMain = isDark ? '#FFFFFF' : '#1E293B';
//   const textMuted = isDark ? '#94A3B8' : '#64748B';
//   const borderLine = isDark ? '#334155' : '#E2E8F0';
//   const glassBg = isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)';
//   const glassBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.4)';

//   const cuisine = displayRecipe.tags?.cuisine?.[0] || 'General';
//   const isVeg = displayRecipe.tags?.['special-consideration']?.includes('Vegetarian') ?? true;

//   return (
//     <View style={[styles.container, { backgroundColor: bgMain }]}>
//       <View style={styles.imageWrapper}>
//         <Image source={{ uri: getRecipeImageUrl(displayRecipe.image_filename) }} style={styles.mainImage} resizeMode="cover" />
//         <View style={styles.gradientScrim} />

//         <View style={styles.topBar}>
//           <TouchableOpacity style={styles.circleActionBtn} onPress={handleBackPress}>
//             <ArrowLeft size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={[styles.glassProfileCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
//           <View style={styles.glassProfileLeft}>
//             <View style={[styles.chefIconCircle, { backgroundColor: isVeg ? '#10B981' : '#EF4444' }]}>
//               <Flame size={16} color="#FFFFFF" />
//             </View>
//             <View>
//               <Text style={[styles.chefMainTitle, { color: textMain }]}>{cuisine} Kitchen</Text>
//               <Text style={[styles.chefSubtitleText, { color: textMuted }]}>
//                 {isVeg ? 'Vegetarian' : 'Non-Vegetarian'} • {displayRecipe.tags?.meal?.[0] || 'Main'}
//               </Text>
//             </View>
//           </View>
//           <View style={[styles.trendingBadge, { backgroundColor: theme.accent }]}>
//             <Award size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
//             <Text style={styles.trendingBadgeText}>{displayRecipe.tags?.type?.[0] || 'Recipe'}</Text>
//           </View>
//         </View>
//       </View>

//       <View style={[styles.bottomSheetSheet, { backgroundColor: bgSheet }]}>
//         <View style={styles.titleWrapperRow}>
//           <Text style={[styles.mainRecipeHeadline, { color: textMain }]} numberOfLines={2}>{displayRecipe.title}</Text>
//           <TouchableOpacity style={styles.favoriteCircleBadge} onPress={toggleFavorite}>
//             <Bookmark size={20} color={isFav ? '#FFB000' : textMuted} fill={isFav ? '#FFB000' : 'transparent'} />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.metricsBar}>
//           <View style={styles.metricPill}>
//             <Clock size={14} color={theme.accent} />
//             <Text style={[styles.metricPillText, { color: textMuted }]}>{displayRecipe.cooking_time || '30'}m</Text>
//           </View>
          
//           <TouchableOpacity style={styles.metricPill} onPress={() => setIsServingModalVisible(true)}>
//             <Users size={14} color={theme.accent} />
//             <Text style={[styles.metricPillText, { color: textMuted }]}>{currentServings} ppl</Text>
//             <ChevronDown size={12} color={textMuted} />
//           </TouchableOpacity>

//           <View style={styles.metricPill}>
//             <Sparkles size={14} color={theme.accent} />
//             <Text style={[styles.metricPillText, { color: textMuted }]}>
//               {displayRecipe.ratings?.rating || '4.5'} ({displayRecipe.ratings?.count || 0})
//             </Text>
//           </View>
//         </View>

//         <View style={[styles.descriptionBox, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
//           <ScrollView 
//             style={[styles.descriptionScroll, !isDescExpanded && { maxHeight: 60 }]} 
//             nestedScrollEnabled={true}
//             showsVerticalScrollIndicator={isDescExpanded}
//           >
//             <Text style={[styles.descriptionText, { color: textMuted }]}>
//               {displayRecipe.description}
//             </Text>
//           </ScrollView>
//           {displayRecipe.description && displayRecipe.description.length > 100 && (
//             <TouchableOpacity 
//               onPress={() => setIsDescExpanded(!isDescExpanded)} 
//               style={styles.readMoreBtn}
//             >
//               <Text style={[styles.readMoreText, { color: theme.accent }]}>
//                 {isDescExpanded ? "Show Less" : "Read More"}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
        
//         <View style={styles.publishInfo}>
//           <Text style={[styles.publishDate, { color: textMuted }]}>Published: {displayRecipe.publish_date}</Text>
//           {displayRecipe.tags?.source && <Text style={[styles.sourceText, { color: theme.accent }]}>Source: {displayRecipe.tags.source[0]}</Text>}
//         </View>

//         <View style={[styles.navigationTabs, { borderBottomColor: borderLine }]}>
//           {['ingredients', 'instructions', 'video'].map(tab => (
//             <TouchableOpacity 
//               key={tab}
//               style={[styles.navTabItem, activeTab === tab && { borderBottomColor: theme.accent }]}
//               onPress={() => {
//                 if (tab === 'instructions' && !allIngredientsDone) {
//                   Alert.alert(t('ingredients_first'), t('ingredients_first_msg'));
//                   return;
//                 }
//                 setActiveTab(tab as any);
//               }}
//             >
//               <Text style={[styles.navTabText, { color: activeTab === tab ? theme.accent : textMuted, textTransform: 'capitalize' }]}>
//                 {tab}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <ScrollView ref={innerScrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScrollArea}>
//           {activeTab === 'ingredients' && (
//             <View style={styles.dataStack}>
//               {displayIngredients.map((item, index) => {
//                 const itemKey = `${recipe.sr_no}-ing-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.8}
//                     style={[styles.dataItemCard, { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: borderLine }, isCompleted && styles.itemCompleted]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.dataItemLeft}>
//                       {isCompleted ? <CheckCircle2 size={18} color="#10B981" /> : <Circle size={18} color={textMuted + '60'} />}
//                       <Text style={[styles.dataItemText, { color: isCompleted ? textMuted : textMain }, isCompleted && styles.strikeText]}>{item}</Text>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//               {allIngredientsDone && (
//                 <TouchableOpacity activeOpacity={0.8} style={[styles.wizardBtn, { backgroundColor: theme.accent }]} onPress={handleNextToInstructions}>
//                   <Text style={styles.wizardBtnText}>Proceed to Steps</Text>
//                   <ArrowRight size={18} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'instructions' && (
//             <View style={styles.dataStack}>
//               {recipe.tags?.technique && (
//                 <View style={styles.techniqueRow}>
//                   {recipe.tags.technique.map((t, i) => (
//                     <View key={i} style={[styles.techniqueBadge, { backgroundColor: theme.accent + '15' }]}><Text style={[styles.techniqueText, { color: theme.accent }]}>{t}</Text></View>
//                   ))}
//                 </View>
//               )}
//               {displayInstructions.map((step, index) => {
//                 const itemKey = `${recipe.sr_no}-ins-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.8}
//                     style={[styles.dataItemCard, { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: borderLine }, isCompleted && styles.itemCompleted]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.dataItemLeft}>
//                       <View style={[styles.stepBadge, { backgroundColor: isCompleted ? textMuted + '30' : theme.accent + '15' }]}><Text style={[styles.stepBadgeText, { color: isCompleted ? textMuted : theme.accent }]}>{index + 1}</Text></View>
//                       <Text style={[styles.stepText, { color: isCompleted ? textMuted : textMain }, isCompleted && styles.strikeText]}>{step}</Text>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//               {allInstructionsDone && (
//                 <TouchableOpacity activeOpacity={0.8} style={[styles.wizardBtn, { backgroundColor: '#10B981' }]} onPress={handleFinishRecipe}>
//                   <Text style={styles.wizardBtnText}>Cooking Complete!</Text>
//                   <Sparkles size={18} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'video' && (
//             <View style={[styles.videoPlaceholder, { borderColor: borderLine, backgroundColor: isDark ? '#2D3748' : '#F8FAFC' }]}>
//               <PlayCircle size={44} color={textMuted + '70'} />
//               <Text style={[styles.videoPlaceholderText, { color: textMuted }]}>Video guide coming soon</Text>
//             </View>
//           )}
//         </ScrollView>
//       </View>

//       {/* SERVINGS SELECTION MODAL */}
//       <Modal visible={isServingModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={[styles.servingModalContent, { backgroundColor: theme.cardBg }]}>
//             <Text style={[styles.modalTitle, { color: theme.text }]}>Select Servings</Text>
//             <FlatList
//               data={[1, 2, 3, 4, 5, 6, 8, 10, 12]}
//               keyExtractor={item => item.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity 
//                   onPress={() => { setCurrentServings(item); setIsServingModalVisible(false); }}
//                   style={[styles.servingItem, currentServings === item && { backgroundColor: theme.accent + '20' }]}
//                 >
//                   <Text style={[styles.servingText, { color: theme.text }, currentServings === item && { color: theme.accent, fontWeight: '700' }]}>{item} Servings</Text>
//                 </TouchableOpacity>
//               )}
//             />
//             <TouchableOpacity onPress={() => setIsServingModalVisible(false)} style={styles.closeBtn}><Text style={[styles.closeBtnText, { color: theme.accent }]}>Close</Text></TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   imageWrapper: { width: '100%', height: 300 },
//   mainImage: { width: '100%', height: '100%' },
//   gradientScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.15)' },
//   topBar: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
//   circleActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
//   glassProfileCard: { position: 'absolute', bottom: 30, left: 16, right: 16, height: 60, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
//   glassProfileLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   chefIconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
//   chefMainTitle: { fontSize: 13, fontWeight: '700' },
//   chefSubtitleText: { fontSize: 10, fontWeight: '500' },
//   trendingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
//   trendingBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
//   bottomSheetSheet: { flex: 1, marginTop: -20, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 24 },
//   titleWrapperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   mainRecipeHeadline: { fontSize: 20, fontWeight: '800', flex: 1 },
//   favoriteCircleBadge: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
//   metricsBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 16 },
//   metricPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
//   metricPillText: { fontSize: 12, fontWeight: '700' },
//   descriptionBox: { borderRadius: 16, padding: 12, marginBottom: 16 },
//   descriptionScroll: { width: '100%' },
//   descriptionText: { fontSize: 14, lineHeight: 20 },
//   readMoreBtn: { alignSelf: 'flex-end', marginTop: 4, padding: 4 },
//   readMoreText: { fontSize: 13, fontWeight: '700' },
//   publishInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
//   publishDate: { fontSize: 11, fontStyle: 'italic' },
//   sourceText: { fontSize: 11, fontWeight: '700' },
//   navigationTabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16 },
//   navTabItem: { paddingVertical: 10, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
//   navTabText: { fontSize: 13, fontWeight: '700' },
//   innerScrollArea: { paddingBottom: 40 },
//   dataStack: { gap: 10 },
//   dataItemCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
//   dataItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
//   dataItemText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
//   stepBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
//   stepBadgeText: { fontWeight: '800', fontSize: 10 },
//   stepText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 22 },
//   itemCompleted: { opacity: 0.5, borderStyle: 'dashed' },
//   strikeText: { textDecorationLine: 'line-through' },
//   wizardBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 10 },
//   wizardBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
//   videoPlaceholder: { width: '100%', borderRadius: 18, overflow: 'hidden', borderWidth: 1, height: 180, justifyContent: 'center', alignItems: 'center', gap: 10 },
//   videoPlaceholderText: { fontSize: 12, fontWeight: '700' },
//   techniqueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
//   techniqueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
//   techniqueText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   servingModalContent: { width: 280, maxHeight: 400, borderRadius: 24, padding: 20 },
//   modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
//   servingItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4 },
//   servingText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
//   closeBtn: { marginTop: 12, alignItems: 'center' },
//   closeBtnText: { fontSize: 14, fontWeight: '700' },
// });



// import { ThemedView } from '@/components/themed-view';
// import { useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { getRecipeBySrNo, Recipe } from '@/lib/github-data';
// import { getRecipeImageUrl } from '@/lib/images';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import {
//   ArrowLeft,
//   ArrowRight,
//   Award,
//   Bookmark,
//   CheckCircle2,
//   ChevronDown,
//   Circle,
//   Clock,
//   Flame,
//   PlayCircle,
//   Sparkles,
//   Users
// } from 'lucide-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from 'react-native';

// // --- Scaling Utility ---

// const toFraction = (val: number): string => {
//   const whole = Math.floor(val);
//   const remainder = val - whole;
  
//   if (remainder === 0) return whole.toString();
  
//   const tolerance = 1.0e-6;
//   const fractions: [number, string][] = [
//     [0.25, '1/4'],
//     [0.33, '1/3'],
//     [0.5, '1/2'],
//     [0.66, '2/3'],
//     [0.75, '3/4'],
//     [0.125, '1/8'],
//     [0.375, '3/8'],
//     [0.625, '5/8'],
//     [0.875, '7/8']
//   ];

//   for (const [fVal, fStr] of fractions) {
//     if (Math.abs(remainder - fVal) < 0.05) {
//       return whole > 0 ? `${whole} ${fStr}` : fStr;
//     }
//   }

//   return val.toFixed(1).replace(/\.?0+$/, '');
// };

// const scaleIngredient = (ingredient: string, originalServings: number, currentServings: number) => {
//   if (!originalServings || originalServings === 0 || originalServings === currentServings) return ingredient;
  
//   const factor = currentServings / originalServings;
  
//   // Regex to find numbers and fractions at start of string
//   // Matches "1", "1.5", "1/2", "1 1/2"
//   const quantityRegex = /^(\d+)?\s?(\d+\/\d+)?|^\d+\.\d+/;
//   const match = ingredient.match(quantityRegex);
  
//   if (match && match[0].trim()) {
//     const rawMatch = match[0].trim();
//     let numericValue = 0;
    
//     if (rawMatch.includes('/')) {
//       const parts = rawMatch.split(' ');
//       if (parts.length === 2) {
//         const [w, f] = parts;
//         const [n, d] = f.split('/');
//         numericValue = parseInt(w) + (parseInt(n) / parseInt(d));
//       } else {
//         const [n, d] = parts[0].split('/');
//         numericValue = parseInt(n) / parseInt(d);
//       }
//     } else {
//       numericValue = parseFloat(rawMatch);
//     }
    
//     if (!isNaN(numericValue)) {
//       const scaled = numericValue * factor;
//       return ingredient.replace(rawMatch, toFraction(scaled));
//     }
//   }
  
//   return ingredient;
// };

// export default function RecipeDetailsScreen() {
//   const { id } = useLocalSearchParams(); 
//   const router = useRouter();
//   const { colors: theme, isDark } = useTheme(); 
//   const { t, language } = useLanguage();
//   const { width } = useWindowDimensions();
//   const { user } = useAuth();

//   const innerScrollRef = useRef<ScrollView>(null);

//   const [recipe, setRecipe] = useState<Recipe | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
//   const [completedItems, setCompletedItems] = useState<string[]>([]);
//   const [isFav, setIsFav] = useState(false);
  
//   // Servings State
//   const [currentServings, setCurrentServings] = useState(4);
//   const [isServingModalVisible, setIsServingModalVisible] = useState(false);
  
//   // Description State
//   const [isDescExpanded, setIsDescExpanded] = useState(false);

//   useEffect(() => {
//     if (id) {
//       setActiveTab('ingredients');
//       setCompletedItems([]);
//       innerScrollRef.current?.scrollTo({ y: 0, animated: false });
//       fetchRecipeData();
//       checkIfFav();
//     }
//   }, [id]);

//   const fetchRecipeData = async () => {
//     try {
//       setLoading(true);
//       const data = await getRecipeBySrNo(id as string);
//       if (data) {
//         setRecipe(data);
//         const baseServings = parseInt(data.servings || '4');
//         setCurrentServings(isNaN(baseServings) ? 4 : baseServings);
//       }
//     } catch (err) {
//       console.error('Error fetching recipe details:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkIfFav = async () => {
//     const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//     const saved = await AsyncStorage.getItem(key);
//     if (saved) {
//       const favs = JSON.parse(saved);
//       setIsFav(favs.includes(id.toString()));
//     }
//   };

//   const toggleFavorite = async () => {
//     const key = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
//     const saved = await AsyncStorage.getItem(key);
//     let favs = saved ? JSON.parse(saved) : [];
    
//     if (favs.includes(id.toString())) {
//       favs = favs.filter((i: string) => i !== id.toString());
//     } else {
//       favs.push(id.toString());
//     }
    
//     await AsyncStorage.setItem(key, JSON.stringify(favs));
//     setIsFav(favs.includes(id.toString()));
//   };

//   const handleBackPress = () => {
//     if (completedItems.length > 0) {
//       Alert.alert(
//         "Discard Progress?",
//         "You have items marked down. Leaving now will reset your cooking progress checklist.",
//         [
//           { text: "Keep Cooking", style: "cancel" },
//           { 
//             text: "Discard & Exit", 
//             style: "destructive", 
//             onPress: () => {
//               setCompletedItems([]);
//               router.back(); 
//             } 
//           }
//         ]
//       );
//     } else {
//       router.back();
//     }
//   };

//   if (loading) {
//     return (
//       <ThemedView style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={theme.accent} />
//       </ThemedView>
//     );
//   }

//   if (!recipe) {
//     return (
//       <ThemedView style={styles.loaderContainer}>
//         <Text style={{ color: theme.text }}>Recipe not found</Text>
//       </ThemedView>
//     );
//   }

//   const baseServings = parseInt(recipe.servings || '4') || 4;
//   const displayIngredients = recipe.ingredients.map(ing => scaleIngredient(ing, baseServings, currentServings));
//   const displayInstructions = Object.entries(recipe.instructions)
//     .sort(([a], [b]) => parseInt(a) - parseInt(b))
//     .map(([_, text]) => text);

//   const toggleItemKey = (key: string) => {
//     setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   const handleNextToInstructions = () => {
//     setActiveTab('instructions');
//     setTimeout(() => {
//       innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//     }, 100);
//   };

//   const handleFinishRecipe = () => {
//     Alert.alert(
//       "Yum! Cooking Complete! 🎉",
//       "Delicious job! We have reset your checkboxes so you can easily prepare this dish next time.",
//       [
//         { text: "Awesome!", onPress: () => {
//             setCompletedItems([]);
//             setActiveTab('ingredients');
//             innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//           }
//         }
//       ]
//     );
//   };

//   // THEME COLORS
//   const bgMain = isDark ? '#0F172A' : '#F8FAFC';
//   const bgSheet = isDark ? '#1E293B' : '#FFFFFF';
//   const textMain = isDark ? '#FFFFFF' : '#1E293B';
//   const textMuted = isDark ? '#94A3B8' : '#64748B';
//   const borderLine = isDark ? '#334155' : '#E2E8F0';
//   const glassBg = isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)';
//   const glassBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.4)';

//   const cuisine = recipe.tags?.cuisine?.[0] || 'General';
//   const isVeg = recipe.tags?.['special-consideration']?.includes('Vegetarian') ?? true;

//   return (
//     <View style={[styles.container, { backgroundColor: bgMain }]}>
//       <View style={styles.imageWrapper}>
//         <Image source={{ uri: getRecipeImageUrl(recipe.image_filename) }} style={styles.mainImage} resizeMode="cover" />
//         <View style={styles.gradientScrim} />

//         <View style={styles.topBar}>
//           <TouchableOpacity style={styles.circleActionBtn} onPress={handleBackPress}>
//             <ArrowLeft size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={[styles.glassProfileCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
//           <View style={styles.glassProfileLeft}>
//             <View style={[styles.chefIconCircle, { backgroundColor: isVeg ? '#10B981' : '#EF4444' }]}>
//               <Flame size={16} color="#FFFFFF" />
//             </View>
//             <View>
//               <Text style={[styles.chefMainTitle, { color: textMain }]}>{cuisine} Kitchen</Text>
//               <Text style={[styles.chefSubtitleText, { color: textMuted }]}>
//                 {isVeg ? 'Vegetarian' : 'Non-Vegetarian'} • {recipe.tags?.meal?.[0] || 'Main'}
//               </Text>
//             </View>
//           </View>
//           <View style={[styles.trendingBadge, { backgroundColor: theme.accent }]}>
//             <Award size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
//             <Text style={styles.trendingBadgeText}>{recipe.tags?.type?.[0] || 'Recipe'}</Text>
//           </View>
//         </View>
//       </View>

//       <View style={[styles.bottomSheetSheet, { backgroundColor: bgSheet }]}>
//         <View style={styles.titleWrapperRow}>
//           <Text style={[styles.mainRecipeHeadline, { color: textMain }]} numberOfLines={2}>{recipe.title}</Text>
//           <TouchableOpacity style={styles.favoriteCircleBadge} onPress={toggleFavorite}>
//             <Bookmark size={20} color={isFav ? '#FFB000' : textMuted} fill={isFav ? '#FFB000' : 'transparent'} />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.metricsBar}>
//           <View style={styles.metricPill}>
//             <Clock size={14} color={theme.accent} />
//             <Text style={[styles.metricPillText, { color: textMuted }]}>{recipe.cooking_time || '30'}m</Text>
//           </View>
          
//           <TouchableOpacity style={styles.metricPill} onPress={() => setIsServingModalVisible(true)}>
//             <Users size={14} color={theme.accent} />
//             <Text style={[styles.metricPillText, { color: textMuted }]}>{currentServings} ppl</Text>
//             <ChevronDown size={12} color={textMuted} />
//           </TouchableOpacity>

//           <View style={styles.metricPill}>
//             <Sparkles size={14} color={theme.accent} />
//             <Text style={[styles.metricPillText, { color: textMuted }]}>
//               {recipe.ratings?.rating || '4.5'} ({recipe.ratings?.count || 0})
//             </Text>
//           </View>
//         </View>

//         <View style={[styles.descriptionBox, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
//           <ScrollView 
//             style={[styles.descriptionScroll, !isDescExpanded && { maxHeight: 60 }]} 
//             nestedScrollEnabled={true}
//             showsVerticalScrollIndicator={isDescExpanded}
//           >
//             <Text style={[styles.descriptionText, { color: textMuted }]}>
//               {recipe.description}
//             </Text>
//           </ScrollView>
//           {recipe.description && recipe.description.length > 100 && (
//             <TouchableOpacity 
//               onPress={() => setIsDescExpanded(!isDescExpanded)} 
//               style={styles.readMoreBtn}
//             >
//               <Text style={[styles.readMoreText, { color: theme.accent }]}>
//                 {isDescExpanded ? "Show Less" : "Read More"}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
        
//         <View style={styles.publishInfo}>
//           <Text style={[styles.publishDate, { color: textMuted }]}>Published: {recipe.publish_date}</Text>
//           {recipe.tags?.source && <Text style={[styles.sourceText, { color: theme.accent }]}>Source: {recipe.tags.source[0]}</Text>}
//         </View>

//         <View style={[styles.navigationTabs, { borderBottomColor: borderLine }]}>
//           {['ingredients', 'instructions', 'video'].map(tab => (
//             <TouchableOpacity 
//               key={tab}
//               style={[styles.navTabItem, activeTab === tab && { borderBottomColor: theme.accent }]}
//               onPress={() => setActiveTab(tab as any)}
//             >
//               <Text style={[styles.navTabText, { color: activeTab === tab ? theme.accent : textMuted, textTransform: 'capitalize' }]}>
//                 {tab}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <ScrollView ref={innerScrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScrollArea}>
//           {activeTab === 'ingredients' && (
//             <View style={styles.dataStack}>
//               {displayIngredients.map((item, index) => {
//                 const itemKey = `${recipe.sr_no}-ing-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.8}
//                     style={[styles.dataItemCard, { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: borderLine }, isCompleted && styles.itemCompleted]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.dataItemLeft}>
//                       {isCompleted ? <CheckCircle2 size={18} color="#10B981" /> : <Circle size={18} color={textMuted + '60'} />}
//                       <Text style={[styles.dataItemText, { color: isCompleted ? textMuted : textMain }, isCompleted && styles.strikeText]}>{item}</Text>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//               <TouchableOpacity activeOpacity={0.8} style={[styles.wizardBtn, { backgroundColor: theme.accent }]} onPress={handleNextToInstructions}>
//                 <Text style={styles.wizardBtnText}>Proceed to Steps</Text>
//                 <ArrowRight size={18} color="#FFFFFF" />
//               </TouchableOpacity>
//             </View>
//           )}

//           {activeTab === 'instructions' && (
//             <View style={styles.dataStack}>
//               {recipe.tags?.technique && (
//                 <View style={styles.techniqueRow}>
//                   {recipe.tags.technique.map((t, i) => (
//                     <View key={i} style={[styles.techniqueBadge, { backgroundColor: theme.accent + '15' }]}><Text style={[styles.techniqueText, { color: theme.accent }]}>{t}</Text></View>
//                   ))}
//                 </View>
//               )}
//               {displayInstructions.map((step, index) => {
//                 const itemKey = `${recipe.sr_no}-ins-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.8}
//                     style={[styles.dataItemCard, { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: borderLine }, isCompleted && styles.itemCompleted]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.dataItemLeft}>
//                       <View style={[styles.stepBadge, { backgroundColor: isCompleted ? textMuted + '30' : theme.accent + '15' }]}><Text style={[styles.stepBadgeText, { color: isCompleted ? textMuted : theme.accent }]}>{index + 1}</Text></View>
//                       <Text style={[styles.stepText, { color: isCompleted ? textMuted : textMain }, isCompleted && styles.strikeText]}>{step}</Text>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//               <TouchableOpacity activeOpacity={0.8} style={[styles.wizardBtn, { backgroundColor: '#10B981' }]} onPress={handleFinishRecipe}>
//                 <Text style={styles.wizardBtnText}>Cooking Complete!</Text>
//                 <Sparkles size={18} color="#FFFFFF" />
//               </TouchableOpacity>
//             </View>
//           )}

//           {activeTab === 'video' && (
//             <View style={[styles.videoPlaceholder, { borderColor: borderLine, backgroundColor: isDark ? '#2D3748' : '#F8FAFC' }]}>
//               <PlayCircle size={44} color={textMuted + '70'} />
//               <Text style={[styles.videoPlaceholderText, { color: textMuted }]}>Video guide coming soon</Text>
//             </View>
//           )}
//         </ScrollView>
//       </View>

//       {/* SERVINGS SELECTION MODAL */}
//       <Modal visible={isServingModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={[styles.servingModalContent, { backgroundColor: theme.cardBg }]}>
//             <Text style={[styles.modalTitle, { color: theme.text }]}>Select Servings</Text>
//             <FlatList
//               data={[1, 2, 3, 4, 5, 6, 8, 10, 12]}
//               keyExtractor={item => item.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity 
//                   onPress={() => { setCurrentServings(item); setIsServingModalVisible(false); }}
//                   style={[styles.servingItem, currentServings === item && { backgroundColor: theme.accent + '20' }]}
//                 >
//                   <Text style={[styles.servingText, { color: theme.text }, currentServings === item && { color: theme.accent, fontWeight: '700' }]}>{item} Servings</Text>
//                 </TouchableOpacity>
//               )}
//             />
//             <TouchableOpacity onPress={() => setIsServingModalVisible(false)} style={styles.closeBtn}><Text style={[styles.closeBtnText, { color: theme.accent }]}>Close</Text></TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   imageWrapper: { width: '100%', height: 300 },
//   mainImage: { width: '100%', height: '100%' },
//   gradientScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.15)' },
//   topBar: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
//   circleActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
//   glassProfileCard: { position: 'absolute', bottom: 30, left: 16, right: 16, height: 60, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
//   glassProfileLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   chefIconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
//   chefMainTitle: { fontSize: 13, fontWeight: '700' },
//   chefSubtitleText: { fontSize: 10, fontWeight: '500' },
//   trendingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
//   trendingBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
//   bottomSheetSheet: { flex: 1, marginTop: -20, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 24 },
//   titleWrapperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   mainRecipeHeadline: { fontSize: 20, fontWeight: '800', flex: 1 },
//   favoriteCircleBadge: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
//   metricsBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 16 },
//   metricPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
//   metricPillText: { fontSize: 12, fontWeight: '700' },
//   descriptionBox: { borderRadius: 16, padding: 12, marginBottom: 16 },
//   descriptionScroll: { width: '100%' },
//   descriptionText: { fontSize: 14, lineHeight: 20 },
//   readMoreBtn: { alignSelf: 'flex-end', marginTop: 4, padding: 4 },
//   readMoreText: { fontSize: 13, fontWeight: '700' },
//   publishInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
//   publishDate: { fontSize: 11, fontStyle: 'italic' },
//   sourceText: { fontSize: 11, fontWeight: '700' },
//   navigationTabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16 },
//   navTabItem: { paddingVertical: 10, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
//   navTabText: { fontSize: 13, fontWeight: '700' },
//   innerScrollArea: { paddingBottom: 40 },
//   dataStack: { gap: 10 },
//   dataItemCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
//   dataItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
//   dataItemText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
//   stepBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
//   stepBadgeText: { fontWeight: '800', fontSize: 10 },
//   stepText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 22 },
//   itemCompleted: { opacity: 0.5, borderStyle: 'dashed' },
//   strikeText: { textDecorationLine: 'line-through' },
//   wizardBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 10 },
//   wizardBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
//   videoPlaceholder: { width: '100%', borderRadius: 18, overflow: 'hidden', borderWidth: 1, height: 180, justifyContent: 'center', alignItems: 'center', gap: 10 },
//   videoPlaceholderText: { fontSize: 12, fontWeight: '700' },
//   techniqueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
//   techniqueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
//   techniqueText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   servingModalContent: { width: 280, maxHeight: 400, borderRadius: 24, padding: 20 },
//   modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
//   servingItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4 },
//   servingText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
//   closeBtn: { marginTop: 12, alignItems: 'center' },
//   closeBtnText: { fontSize: 14, fontWeight: '700' },
// });





/**
 * CookuBuddy – Recipe Details Screen
 * Warm editorial aesthetic: cream + terracotta + saffron gold
 */

import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { getRecipeBySrNo, Recipe } from '@/lib/github-data';
import { getRecipeImageUrl } from '@/lib/images';
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
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
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
  scrimGrad:  'rgba(44,26,14,0.25)',
};

// ─── Scaling utility ──────────────────────────────────────────────
const toFraction = (val: number): string => {
  const whole = Math.floor(val);
  const rem   = val - whole;
  if (rem === 0) return whole.toString();
  const fractions: [number, string][] = [
    [0.25,'1/4'],[0.33,'1/3'],[0.5,'1/2'],[0.66,'2/3'],[0.75,'3/4'],
    [0.125,'1/8'],[0.375,'3/8'],[0.625,'5/8'],[0.875,'7/8'],
  ];
  for (const [fVal, fStr] of fractions) {
    if (Math.abs(rem - fVal) < 0.05) return whole > 0 ? `${whole} ${fStr}` : fStr;
  }
  return val.toFixed(1).replace(/\.?0+$/, '');
};

const scaleIngredient = (ing: string, orig: number, curr: number) => {
  if (!orig || orig === 0 || orig === curr) return ing;
  const factor = curr / orig;
  const quantityRegex = /^(\d+)?\s?(\d+\/\d+)?|^\d+\.\d+/;
  const match = ing.match(quantityRegex);
  if (match && match[0].trim()) {
    const raw = match[0].trim();
    let num = 0;
    if (raw.includes('/')) {
      const parts = raw.split(' ');
      if (parts.length === 2) {
        const [w, f] = parts; const [n, d] = f.split('/');
        num = parseInt(w) + parseInt(n) / parseInt(d);
      } else {
        const [n, d] = parts[0].split('/'); num = parseInt(n) / parseInt(d);
      }
    } else { num = parseFloat(raw); }
    if (!isNaN(num)) return ing.replace(raw, toFraction(num * factor));
  }
  return ing;
};

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router  = useRouter();
  const { t }   = useLanguage();
  const { user } = useAuth();

  const scrollRef = useRef<ScrollView>(null);

  const [recipe, setRecipe]       = useState<Recipe | null>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
  const [completed, setCompleted] = useState<string[]>([]);
  const [isFav, setIsFav]         = useState(false);
  const [servings, setServings]   = useState(4);
  const [servingModal, setServingModal] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      setActiveTab('ingredients');
      setCompleted([]);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      fetchData();
      checkFav();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getRecipeBySrNo(id as string);
      if (data) {
        setRecipe(data);
        const base = parseInt(data.servings || '4');
        setServings(isNaN(base) ? 4 : base);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFav = async () => {
    const key   = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    const saved = await AsyncStorage.getItem(key);
    if (saved) setIsFav(JSON.parse(saved).includes(id?.toString()));
  };

  const toggleFav = async () => {
    const key   = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
    const saved = await AsyncStorage.getItem(key);
    let favs    = saved ? JSON.parse(saved) : [];
    favs = favs.includes(id?.toString())
      ? favs.filter((i: string) => i !== id?.toString())
      : [...favs, id?.toString()];
    await AsyncStorage.setItem(key, JSON.stringify(favs));
    setIsFav(favs.includes(id?.toString()));
  };

  const handleBack = () => {
    if (completed.length > 0) {
      Alert.alert(
        'Discard Progress?',
        'You have items checked off. Leaving will reset your progress.',
        [
          { text: 'Keep Cooking', style: 'cancel' },
          { text: 'Discard & Exit', style: 'destructive', onPress: () => { setCompleted([]); router.back(); } },
        ]
      );
    } else {
      router.back();
    }
  };

  const toggleKey = (key: string) =>
    setCompleted(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: C.cream }]}>
        <ActivityIndicator size="large" color={C.terra} />
        <Text style={styles.loadingText}>Plating your recipe…</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.centered, { backgroundColor: C.cream }]}>
        <Text style={{ color: C.ink, fontFamily: 'Georgia', fontSize: 18 }}>Recipe not found 🍽️</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtnFull, { marginTop: 20 }]}>
          <Text style={styles.backBtnFullText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const base         = parseInt(recipe.servings || '4') || 4;
  const ingredients  = recipe.ingredients.map(i => scaleIngredient(i, base, servings));
  const instructions = Object.entries(recipe.instructions)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([_, text]) => text);

  const cuisine = recipe.tags?.cuisine?.[0] || 'General';
  const isVeg   = recipe.tags?.['special-consideration']?.includes('Vegetarian') ?? true;

  return (
    <View style={styles.root}>
      {/* ── HERO IMAGE ── */}
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: getRecipeImageUrl(recipe.image_filename) }}
          style={styles.heroImg}
          resizeMode="cover"
        />
        {/* Warm scrim */}
        <View style={styles.heroScrim} />

        {/* Back */}
        <TouchableOpacity style={styles.backCircle} onPress={handleBack} activeOpacity={0.85}>
          <ArrowLeft size={20} color={C.white} />
        </TouchableOpacity>

        {/* Glass card over hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardLeft}>
            <View style={[styles.flameDot, { backgroundColor: isVeg ? C.vegGreen : C.nonVegRed }]}>
              <Flame size={13} color={C.white} />
            </View>
            <View>
              <Text style={styles.heroCardTitle}>{cuisine} Kitchen</Text>
              <Text style={styles.heroCardSub}>
                {isVeg ? 'Vegetarian' : 'Non-Veg'} · {recipe.tags?.meal?.[0] || 'Main'}
              </Text>
            </View>
          </View>
          <View style={styles.typeBadge}>
            <Award size={10} color={C.white} />
            <Text style={styles.typeBadgeText}>{recipe.tags?.type?.[0] || 'Recipe'}</Text>
          </View>
        </View>
      </View>

      {/* ── BOTTOM SHEET ── */}
      <View style={styles.sheet}>
        {/* Title + fav */}
        <View style={styles.titleRow}>
          <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
          <TouchableOpacity onPress={toggleFav} style={styles.bookmarkBtn} activeOpacity={0.8}>
            <Bookmark size={20} color={isFav ? C.saffron : C.inkLight} fill={isFav ? C.saffron : 'transparent'} />
          </TouchableOpacity>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricPill}>
            <Clock size={13} color={C.terra} />
            <Text style={styles.metricText}>{recipe.cooking_time || '30'}m</Text>
          </View>
          <TouchableOpacity style={[styles.metricPill, styles.metricPillTap]} onPress={() => setServingModal(true)} activeOpacity={0.8}>
            <Users size={13} color={C.terra} />
            <Text style={styles.metricText}>{servings} ppl</Text>
            <ChevronDown size={12} color={C.inkLight} />
          </TouchableOpacity>
          <View style={styles.metricPill}>
            <Sparkles size={13} color={C.saffron} />
            <Text style={styles.metricText}>{recipe.ratings?.rating || '4.5'} ({recipe.ratings?.count || 0})</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descBox}>
          <ScrollView
            style={[styles.descScroll, !descExpanded && { maxHeight: 58 }]}
            nestedScrollEnabled
            showsVerticalScrollIndicator={descExpanded}
          >
            <Text style={styles.descText}>{recipe.description}</Text>
          </ScrollView>
          {(recipe.description?.length || 0) > 100 && (
            <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)} activeOpacity={0.7}>
              <Text style={styles.readMore}>{descExpanded ? 'Show Less ▲' : 'Read More ▼'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Publish info */}
        <View style={styles.publishRow}>
          <Text style={styles.publishDate}>📅 {recipe.publish_date}</Text>
          {recipe.tags?.source?.[0] && (
            <Text style={styles.sourceTag}>📖 {recipe.tags.source[0]}</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['ingredients', 'instructions', 'video'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.tabContent}
        >
          {/* ── Ingredients ── */}
          {activeTab === 'ingredients' && (
            <View style={styles.stack}>
              {ingredients.map((item, idx) => {
                const key       = `${recipe.sr_no}-ing-${idx}`;
                const isDone    = completed.includes(key);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => toggleKey(key)}
                    activeOpacity={0.8}
                    style={[styles.itemCard, isDone && styles.itemCardDone]}
                  >
                    {isDone
                      ? <CheckCircle2 size={18} color={C.sage} />
                      : <Circle size={18} color={C.border} />
                    }
                    <Text style={[styles.itemText, isDone && styles.itemTextDone]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.wizardBtn}
                onPress={() => {
                  setActiveTab('instructions');
                  setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.wizardBtnText}>Proceed to Steps</Text>
                <ArrowRight size={16} color={C.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Instructions ── */}
          {activeTab === 'instructions' && (
            <View style={styles.stack}>
              {/* Technique badges */}
              {recipe.tags?.technique && (
                <View style={styles.techniqueRow}>
                  {recipe.tags.technique.map((t, i) => (
                    <View key={i} style={styles.techniqueBadge}>
                      <Text style={styles.techniqueBadgeText}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
              {instructions.map((step, idx) => {
                const key    = `${recipe.sr_no}-ins-${idx}`;
                const isDone = completed.includes(key);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => toggleKey(key)}
                    activeOpacity={0.8}
                    style={[styles.stepCard, isDone && styles.itemCardDone]}
                  >
                    <View style={[styles.stepNum, isDone && styles.stepNumDone]}>
                      <Text style={[styles.stepNumText, isDone && styles.stepNumTextDone]}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, isDone && styles.itemTextDone]}>{step}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.wizardBtn, { backgroundColor: C.sage }]}
                onPress={() => Alert.alert(
                  '🎉 Cooking Complete!',
                  'Great job! Your checkboxes have been reset for next time.',
                  [{ text: 'Awesome!', onPress: () => { setCompleted([]); setActiveTab('ingredients'); scrollRef.current?.scrollTo({ y: 0, animated: true }); } }]
                )}
                activeOpacity={0.85}
              >
                <Text style={styles.wizardBtnText}>Cooking Complete!</Text>
                <Sparkles size={16} color={C.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Video ── */}
          {activeTab === 'video' && (
            <View style={styles.videoPlaceholder}>
              <PlayCircle size={48} color={C.border} />
              <Text style={styles.videoText}>Video guide coming soon</Text>
              <Text style={styles.videoSubText}>Check back later for step-by-step cooking videos</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* ── SERVINGS MODAL ── */}
      <Modal visible={servingModal} transparent animationType="fade">
        <View style={styles.centeredOverlay}>
          <View style={styles.servingModal}>
            <Text style={styles.servingModalTitle}>Select Servings</Text>
            <FlatList
              data={[1, 2, 3, 4, 5, 6, 8, 10, 12]}
              keyExtractor={item => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setServings(item); setServingModal(false); }}
                  style={[styles.servingItem, servings === item && styles.servingItemActive]}
                >
                  <Text style={[styles.servingText, servings === item && styles.servingTextActive]}>
                    {item} Servings
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setServingModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Georgia', fontSize: 14, color: C.inkLight, fontStyle: 'italic' },
  backBtnFull: {
    paddingHorizontal: 24, paddingVertical: 12, backgroundColor: C.terra, borderRadius: 12,
  },
  backBtnFullText: { color: C.white, fontWeight: '700', fontSize: 14 },

  // Hero
  heroWrap: { width: '100%', height: 300 },
  heroImg:  { width: '100%', height: '100%' },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: C.scrimGrad },

  backCircle: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(44,26,14,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },

  heroCard: {
    position: 'absolute', bottom: 24, left: 16, right: 16, height: 58,
    borderRadius: 16, paddingHorizontal: 12,
    backgroundColor: 'rgba(253,246,237,0.88)',
    borderWidth: 1, borderColor: 'rgba(253,246,237,0.5)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  heroCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flameDot: {
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
  },
  heroCardTitle: { fontSize: 13, fontWeight: '700', color: C.ink },
  heroCardSub:   { fontSize: 10, color: C.inkLight, fontWeight: '500' },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.terra, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  typeBadgeText: { color: C.white, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

  // Sheet
  sheet: {
    flex: 1, marginTop: -20, backgroundColor: C.cream,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 22,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  recipeTitle: { flex: 1, fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: C.ink, lineHeight: 26 },
  bookmarkBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },

  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metricPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.parchment, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
  },
  metricPillTap: { borderColor: C.terra + '50' },
  metricText: { fontSize: 12, fontWeight: '700', color: C.inkLight },

  descBox: { backgroundColor: C.parchment, borderRadius: 14, padding: 12, marginBottom: 12 },
  descScroll: { width: '100%' },
  descText: { fontSize: 14, lineHeight: 20, color: C.inkLight, fontFamily: 'Georgia', fontStyle: 'italic' },
  readMore: { fontSize: 12, fontWeight: '700', color: C.terra, marginTop: 4, textAlign: 'right' },

  publishRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  publishDate: { fontSize: 11, color: C.inkLight },
  sourceTag:   { fontSize: 11, fontWeight: '700', color: C.terra },

  // Tabs
  tabs: {
    flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: C.border, marginBottom: 16,
  },
  tab: { paddingBottom: 10, marginRight: 24, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.terra },
  tabText: { fontSize: 13, fontWeight: '700', color: C.inkLight },
  tabTextActive: { color: C.terra },

  tabContent: { paddingBottom: 48 },
  stack: { gap: 10 },

  // Ingredient cards
  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.white, borderRadius: 14, paddingVertical: 13,
    paddingHorizontal: 14, borderWidth: 1, borderColor: C.border,
  },
  itemCardDone: { opacity: 0.5, borderStyle: 'dashed' },
  itemText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.ink, lineHeight: 20 },
  itemTextDone: { textDecorationLine: 'line-through', color: C.inkLight },

  // Step cards
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: C.white, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 14, borderWidth: 1, borderColor: C.border,
  },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: C.terra + '18',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  stepNumDone:     { backgroundColor: C.border },
  stepNumText:     { fontSize: 10, fontWeight: '800', color: C.terra },
  stepNumTextDone: { color: C.inkLight },
  stepText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.ink, lineHeight: 22 },

  // Technique badges
  techniqueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  techniqueBadge: {
    backgroundColor: C.saffron + '20', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  techniqueBadgeText: { fontSize: 10, fontWeight: '700', color: C.saffron, textTransform: 'uppercase' },

  // Wizard button
  wizardBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 16, backgroundColor: C.terra, marginTop: 6,
    shadowColor: C.terra, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  wizardBtnText: { color: C.white, fontSize: 14, fontWeight: '800' },

  // Video placeholder
  videoPlaceholder: {
    alignItems: 'center', justifyContent: 'center', height: 200,
    backgroundColor: C.white, borderRadius: 18, borderWidth: 1,
    borderColor: C.border, gap: 10,
  },
  videoText:    { fontSize: 14, fontWeight: '700', color: C.inkLight },
  videoSubText: { fontSize: 12, color: C.border, textAlign: 'center', paddingHorizontal: 20 },

  // Servings modal
  centeredOverlay: {
    flex: 1, backgroundColor: 'rgba(44,26,14,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  servingModal: {
    width: 280, maxHeight: 400, backgroundColor: C.cream,
    borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.border,
  },
  servingModalTitle: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700',
    color: C.ink, textAlign: 'center', marginBottom: 14,
  },
  servingItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4 },
  servingItemActive: { backgroundColor: C.terra + '18' },
  servingText:       { fontSize: 15, fontWeight: '600', color: C.ink, textAlign: 'center' },
  servingTextActive: { color: C.terra, fontWeight: '800' },
  cancelBtn:    { marginTop: 10, alignItems: 'center' },
  cancelBtnText:{ fontSize: 14, fontWeight: '700', color: C.terra },
});