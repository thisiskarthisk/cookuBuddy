// import { ThemedView } from '@/components/themed-view';
// import { LanguageCode, useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { supabase } from '@/lib/supabase';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import {
//   ArrowLeft,
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   Circle,
//   Clock,
//   PlayCircle,
//   Sparkles,
//   Users,
// } from 'lucide-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from 'react-native';
// import YoutubePlayer from 'react-native-youtube-iframe';

// interface RecipeDetails {
//   id: string;
//   recipe_name: string;
//   translated_recipe_name: string;
//   ingredients: string;
//   translated_ingredients: string;
//   instructions: string;
//   translated_instructions: string;
//   prep_time_in_mins: number;
//   cook_time_in_mins: number;
//   total_time_in_mins: number;
//   servings: string;
//   cuisine: string;
//   course: string;
//   diet: string;
//   difficulty: string;
//   image_url: string;
//   video_url: string | null;
// }

// const LANGUAGES: { code: LanguageCode; label: string }[] = [
//   { code: 'en', label: 'English' },
//   { code: 'ta', label: 'Tamil (தமிழ்)' },
//   { code: 'hi', label: 'Hindi (हिन्दी)' },
//   { code: 'te', label: 'Telugu (తెలుగు)' },
//   { code: 'mr', label: 'Marathi (மராठी)' },
//   { code: 'bn', label: 'Bengali (বাংলা)' },
// ];

// export default function RecipeDetailsScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const { colors: theme, isDark } = useTheme();
//   const { t, language, setLanguage } = useLanguage();
//   const { width } = useWindowDimensions();

//   // Reference for managing global page scroll positions dynamically
//   const scrollRef = useRef<ScrollView>(null);

//   const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [langModalVisible, setLangModalVisible] = useState(false);
//   const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
//   const [completedItems, setCompletedItems] = useState<string[]>([]);


//   useEffect(() => {
//     if (id) {
//       setActiveTab('ingredients');

//       setCompletedItems([]);

//       scrollRef.current?.scrollTo({
//         y: 0,
//         animated: false,
//       });
//       fetchRecipe();
//     }
//   }, [id]);

//   const fetchRecipe = async () => {
//     try {
//       setLoading(true);

//       const { data, error } =
//         await supabase
//           .from('recipes')
//           .select('*')
//           .eq('id', id)
//           .single();

//       if (error) {
//         console.log(error);
//         return;
//       }

//       setRecipe(data);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
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

//   const displayName = language === 'en' ? recipe.recipe_name : recipe.translated_recipe_name;

//   const displayIngredients = (
//     language === 'en' ? recipe.ingredients : recipe.translated_ingredients
//   ).split(',').map((item) => item.trim()).filter((item) => item.length > 0);

//   const displayInstructions = (
//     language === 'en' ? recipe.instructions : recipe.translated_instructions
//   ).split('.').map((item) => item.trim()).filter((item) => item.length > 0);

//   const youtubeId = getYouTubeId(recipe.video_url);

//   const currentRecipeIngredientsKeys = displayIngredients.map((_, idx) => `${recipe.id}-ing-${idx}`);
//   const currentRecipeInstructionsKeys = displayInstructions.map((_, idx) => `${recipe.id}-ins-${idx}`);

//   const allIngredientsChecked = currentRecipeIngredientsKeys.every(key => completedItems.includes(key));
//   const allInstructionsChecked = currentRecipeInstructionsKeys.every(key => completedItems.includes(key));
  
//   const userHasProgress = currentRecipeIngredientsKeys.some(key => completedItems.includes(key)) || 
//                           currentRecipeInstructionsKeys.some(key => completedItems.includes(key));

//   const handleBackPress = () => {
//     if (userHasProgress) {
//       Alert.alert(
//         "Exit Cooking Session?",
//         "You have checked items in this recipe. Leaving now will discard your current progress tracking.",
//         [
//           { text: "Keep Cooking", style: "cancel" },
//           { text: "Exit & Clear", style: "destructive", onPress: () => {
//               resetRecipeStates();
//               router.back();
//             } 
//           }
//         ]
//       );
//     } else {
//       router.back();
//     }
//   };

//   const toggleItemKey = (key: string) => {
//     setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   const resetRecipeStates = () => {
//     const combinedRecipeKeys = [...currentRecipeIngredientsKeys, ...currentRecipeInstructionsKeys];
//     setCompletedItems(prev => prev.filter(key => !combinedRecipeKeys.includes(key)));
//   };

//   /**
//    * Action wizard to automatically jump views and scroll the page layout instantly to top index position
//    */
//   const handleNextToInstructions = () => {
//     setActiveTab('instructions');
//     // Forces the parent ScrollView container to reset positions cleanly
//     scrollRef.current?.scrollTo({ y: 0, animated: true });
//   };

//   const handleFinishRecipe = () => {
//     Alert.alert(
//       "Yum! Cooking Complete! 🎉",
//       "Delicious job! We have reset your checkboxes so you can easily prepare this dish next time.",
//       [
//         { text: "Awesome!", onPress: () => {
//             resetRecipeStates();
//             setActiveTab('ingredients');
//             scrollRef.current?.scrollTo({ y: 0, animated: true });
//           }
//         }
//       ]
//     );
//   };

//   function getYouTubeId(url: string | null) {
//     if (!url) return '';
//     try {
//       const watchMatch = url.match(/[?&]v=([^&]+)/);
//       if (watchMatch && watchMatch[1]) return watchMatch[1];
//       const shortMatch = url.match(/youtu\.be\/([^?]+)/);
//       if (shortMatch && shortMatch[1]) return shortMatch[1];
//       const shortsMatch = url.match(/shorts\/([^?]+)/);
//       if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
//       const embedMatch = url.match(/embed\/([^?]+)/);
//       if (embedMatch && embedMatch[1]) return embedMatch[1];
//       return '';
//     } catch (error) {
//       return '';
//     }
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* HEADER IMAGE */}
//       <View style={styles.imageContainer}>
//         <Image source={{ uri: recipe.image_url }} style={styles.headerImage} resizeMode="cover" />
//         <View style={styles.navbar}>
//           <TouchableOpacity style={styles.navButton} onPress={handleBackPress}>
//             <ArrowLeft size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Connected the scrollRef reference mapping variable here */}
//       <ScrollView 
//         ref={scrollRef}
//         showsVerticalScrollIndicator={false} 
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* RECIPE INFO */}
//         <View style={styles.infoCard}>
//           <Text style={[styles.title, { color: theme.text }]}>{displayName}</Text>
//           <View style={styles.metaRow}>
//             <View style={styles.metaItem}>
//               <Clock size={16} color={theme.accent} />
//               <Text style={[styles.metaText, { color: theme.textSecondary }]}>{recipe.total_time_in_mins} mins</Text>
//             </View>
//             <View style={styles.metaItem}>
//               <Users size={16} color={theme.accent} />
//               <Text style={[styles.metaText, { color: theme.textSecondary }]}>{recipe.servings}</Text>
//             </View>
//             <View style={styles.metaItem}>
//               <Award size={16} color={theme.accent} />
//               <Text style={[styles.metaText, { color: theme.textSecondary }]}>{recipe.difficulty}</Text>
//             </View>
//           </View>
//           <Text style={[styles.dietText, { color: theme.accent }]}>
//             {recipe.diet} • {recipe.cuisine}
//           </Text>
//         </View>

//         {/* TABS BAR */}
//         <View style={[styles.tabBar, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
//           <TouchableOpacity style={[styles.tabButton, activeTab === 'ingredients' && { backgroundColor: theme.accent }]} onPress={() => setActiveTab('ingredients')}>
//             <Text style={[styles.tabText, { color: activeTab === 'ingredients' ? '#FFFFFF' : theme.textSecondary }]}>{t('ingredients')}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tabButton, activeTab === 'instructions' && { backgroundColor: theme.accent }]} onPress={() => setActiveTab('instructions')}>
//             <Text style={[styles.tabText, { color: activeTab === 'instructions' ? '#FFFFFF' : theme.textSecondary }]}>{t('instructions')}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tabButton, activeTab === 'video' && { backgroundColor: theme.accent }]} onPress={() => setActiveTab('video')}>
//             <Text style={[styles.tabText, { color: activeTab === 'video' ? '#FFFFFF' : theme.textSecondary }]}>{t('video')}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* CONTENT TABS */}
//         <View style={styles.tabContent}>
//           {activeTab === 'ingredients' && (
//             <View style={styles.listContainer}>
//               {displayIngredients.map((item, index) => {
//                 const itemKey = `${recipe.id}-ing-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.7}
//                     style={[styles.listItem, isCompleted && [styles.disabledItem, { borderColor: theme.border }]]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     {isCompleted ? <CheckCircle2 size={20} color={theme.accent} /> : <Circle size={20} color={theme.textSecondary} />}
//                     <Text style={[styles.listText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeThroughText]}>
//                       {item}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}

//               {allIngredientsChecked && (
//                 <TouchableOpacity 
//                   activeOpacity={0.8} 
//                   style={[styles.wizardActionBtn, { backgroundColor: theme.accent }]}
//                   onPress={handleNextToInstructions}
//                 >
//                   <Text style={styles.wizardActionBtnText}>Ingredients Prepared! Next Step</Text>
//                   <ArrowRight size={18} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'instructions' && (
//             <View style={styles.listContainer}>
//               {displayInstructions.map((step, index) => {
//                 const itemKey = `${recipe.id}-ins-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.7}
//                     style={[styles.instructionStep, isCompleted && [styles.disabledItem, { borderColor: theme.border }]]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={[styles.stepNumber, { backgroundColor: isCompleted ? theme.textSecondary + '60' : theme.accent }]}>
//                       <Text style={styles.stepNumberText}>{index + 1}</Text>
//                     </View>
//                     <Text style={[styles.instructionText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeThroughText]}>
//                       {step}.
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}

//               {allInstructionsChecked && (
//                 <TouchableOpacity 
//                   activeOpacity={0.8} 
//                   style={[styles.wizardActionBtn, { backgroundColor: '#10B981' }]}
//                   onPress={handleFinishRecipe}
//                 >
//                   <Text style={styles.wizardActionBtnText}>Finish Recipe & Clear States</Text>
//                   <Sparkles size={18} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'video' && (
//             <View style={styles.videoContainer}>
//               {youtubeId ? (
//                 <YoutubePlayer height={240} width={width - 32} play={false} videoId={youtubeId} />
//               ) : (
//                 <View style={styles.noVideo}>
//                   <PlayCircle size={48} color={theme.textSecondary} />
//                   <Text style={[styles.noVideoText, { color: theme.textSecondary }]}>Video tutorial not available</Text>
//                 </View>
//               )}
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   imageContainer: { width: '100%', height: 300 },
//   headerImage: { width: '100%', height: '100%' },
//   navbar: { position: 'absolute', top: 50, left: 20 },
//   navButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
//   scrollContent: { padding: 16, paddingBottom: 80 },
//   infoCard: { marginBottom: 24 },
//   title: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
//   metaRow: { flexDirection: 'row', gap: 20, marginBottom: 12 },
//   metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   metaText: { fontSize: 14, fontWeight: '600' },
//   dietText: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
//   tabBar: { flexDirection: 'row', padding: 6, borderRadius: 12, marginBottom: 20 },
//   tabButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
//   tabText: { fontSize: 14, fontWeight: '700' },
//   tabContent: { minHeight: 300 },
//   listContainer: { gap: 14 },
//   listItem: {
//     flexDirection: 'row',
//     gap: 12,
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 14,
//     backgroundColor: 'rgba(0,0,0,0.02)',
//   },
//   listText: { fontSize: 16, flex: 1, lineHeight: 24 },
//   instructionStep: {
//     flexDirection: 'row',
//     gap: 14,
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 14,
//     backgroundColor: 'rgba(0,0,0,0.02)',
//   },
//   stepNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
//   stepNumberText: { color: '#FFFFFF', fontWeight: '800' },
//   instructionText: { flex: 1, fontSize: 16, lineHeight: 24 },
//   disabledItem: {
//     opacity: 0.5,
//     borderWidth: 1,
//     borderStyle: 'dashed',
//     backgroundColor: 'transparent',
//   },
//   strikeThroughText: {
//     textDecorationLine: 'line-through',
//     textDecorationStyle: 'solid',
//     textAlign: 'center',
//   },
//   wizardActionBtn: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 10,
//     paddingVertical: 16,
//     borderRadius: 16,
//     marginTop: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   wizardActionBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
//   videoContainer: { width: '100%', borderRadius: 16, overflow: 'hidden' },
//   noVideo: { height: 220, justifyContent: 'center', alignItems: 'center', gap: 12 },
//   noVideoText: { fontSize: 14, fontWeight: '600' },
// });


// ------------------------------------------------------------------------------------------------------------

// perfer design


// import { ThemedView } from '@/components/themed-view';
// import { useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { supabase } from '@/lib/supabase';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import {
//   ArrowLeft,
//   ArrowRight,
//   CheckCircle2,
//   ChefHat,
//   Circle,
//   Clock,
//   Layers,
//   PlayCircle,
//   Sparkles,
//   Users
// } from 'lucide-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from 'react-native';
// import YoutubePlayer from 'react-native-youtube-iframe';

// interface RecipeDetails {
//   id: string;
//   recipe_name: string;
//   translated_recipe_name: string;
//   ingredients: string;
//   translated_ingredients: string;
//   instructions: string;
//   translated_instructions: string;
//   prep_time_in_mins: number;
//   cook_time_in_mins: number;
//   total_time_in_mins: number;
//   servings: string;
//   cuisine: string;
//   course: string;
//   diet: string;
//   difficulty: string;
//   image_url: string;
//   video_url: string | null;
// }

// export default function RecipeDetailsScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const { colors: theme, isDark } = useTheme();
//   const { t, language } = useLanguage();
//   const { width } = useWindowDimensions();

//   // Reference to handle separate inner scrolling transitions smoothly
//   const innerScrollRef = useRef<ScrollView>(null);

//   const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
//   const [completedItems, setCompletedItems] = useState<string[]>([]);

//   useEffect(() => {
//     if (id) {
//       setActiveTab('ingredients');
//       setCompletedItems([]);
//       innerScrollRef.current?.scrollTo({ y: 0, animated: false });
//       fetchRecipe();
//     }
//   }, [id]);

//   const fetchRecipe = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('recipes')
//         .select('*')
//         .eq('id', id)
//         .single();

//       if (error) {
//         console.log(error);
//         return;
//       }
//       setRecipe(data);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
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

//   const displayName = language === 'en' ? recipe.recipe_name : recipe.translated_recipe_name;

//   const displayIngredients = (
//     language === 'en' ? recipe.ingredients : recipe.translated_ingredients
//   ).split(',').map((item) => item.trim()).filter((item) => item.length > 0);

//   const displayInstructions = (
//     language === 'en' ? recipe.instructions : recipe.translated_instructions
//   ).split('.').map((item) => item.trim()).filter((item) => item.length > 0);

//   const youtubeId = getYouTubeId(recipe.video_url);

//   const currentRecipeIngredientsKeys = displayIngredients.map((_, idx) => `${recipe.id}-ing-${idx}`);
//   const currentRecipeInstructionsKeys = displayInstructions.map((_, idx) => `${recipe.id}-ins-${idx}`);

//   const allIngredientsChecked = currentRecipeIngredientsKeys.every(key => completedItems.includes(key));
//   const allInstructionsChecked = currentRecipeInstructionsKeys.every(key => completedItems.includes(key));
  
//   const userHasProgress = currentRecipeIngredientsKeys.some(key => completedItems.includes(key)) || 
//                           currentRecipeInstructionsKeys.some(key => completedItems.includes(key));

//   const handleBackPress = () => {
//     if (userHasProgress) {
//       Alert.alert(
//         "Exit Cooking Session?",
//         "You have checked items in this recipe. Leaving now will discard your current progress tracking.",
//         [
//           { text: "Keep Cooking", style: "cancel" },
//           { text: "Exit & Clear", style: "destructive", onPress: () => {
//               resetRecipeStates();
//               router.back();
//             } 
//           }
//         ]
//       );
//     } else {
//       router.back();
//     }
//   };

//   const toggleItemKey = (key: string) => {
//     setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   const resetRecipeStates = () => {
//     const combinedRecipeKeys = [...currentRecipeIngredientsKeys, ...currentRecipeInstructionsKeys];
//     setCompletedItems(prev => prev.filter(key => !combinedRecipeKeys.includes(key)));
//   };

//   const handleNextToInstructions = () => {
//     setActiveTab('instructions');
//     setTimeout(() => {
//       innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//     }, 60);
//   };

//   const handleFinishRecipe = () => {
//     Alert.alert(
//       "Yum! Cooking Complete! 🎉",
//       "Delicious job! We have reset your checkboxes so you can easily prepare this dish next time.",
//       [
//         { text: "Awesome!", onPress: () => {
//             resetRecipeStates();
//             setActiveTab('ingredients');
//             innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//           }
//         }
//       ]
//     );
//   };

//   function getYouTubeId(url: string | null) {
//     if (!url) return '';
//     try {
//       const watchMatch = url.match(/[?&]v=([^&]+)/);
//       if (watchMatch && watchMatch[1]) return watchMatch[1];
//       const shortMatch = url.match(/youtu\.be\/([^?]+)/);
//       if (shortMatch && shortMatch[1]) return shortMatch[1];
//       const shortsMatch = url.match(/shorts\/([^?]+)/);
//       if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
//       const embedMatch = url.match(/embed\/([^?]+)/);
//       if (embedMatch && embedMatch[1]) return embedMatch[1];
//       return '';
//     } catch (error) {
//       return '';
//     }
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* STATIC TOP HERO SECTION */}
//       <View style={styles.imageContainer}>
//         <Image source={{ uri: recipe.image_url }} style={styles.headerImage} resizeMode="cover" />
//         <View style={styles.imageOverlay} />
        
//         <View style={styles.navbar}>
//           <TouchableOpacity style={styles.navButton} onPress={handleBackPress}>
//             <ArrowLeft size={22} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.floatingTopBadges}>
//           <View style={[styles.premiumBadge, { backgroundColor: '#10B981' }]}>
//             <ChefHat size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
//             <Text style={styles.premiumBadgeText}>{recipe.diet}</Text>
//           </View>
//           <View style={[styles.premiumBadge, { backgroundColor: 'rgba(15, 23, 42, 0.75)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 }]}>
//             <Layers size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
//             <Text style={styles.premiumBadgeText}>{recipe.course}</Text>
//           </View>
//         </View>
//       </View>

//       {/* STATIC HERO DETAILS CARD */}
//       <View style={styles.staticCardWrapper}>
//         <View style={[styles.infoCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: theme.border }]}>
//           <View style={styles.cuisineRow}>
//             <Text style={[styles.cuisineText, { color: theme.accent }]}>{recipe.cuisine}</Text>
//             <View style={[styles.dotSeparator, { backgroundColor: theme.textSecondary + '40' }]} />
//             <Text style={[styles.courseMetaText, { color: theme.textSecondary }]}>{recipe.difficulty}</Text>
//           </View>
          
//           <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{displayName}</Text>
          
//           <View style={[styles.metaGrid, { borderColor: theme.border }]}>
//             <View style={styles.gridItem}>
//               <Clock size={16} color={theme.accent} />
//               <View style={styles.gridTextContainer}>
//                 <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>TOTAL TIME</Text>
//                 <Text style={[styles.gridValue, { color: theme.text }]}>{recipe.total_time_in_mins}m</Text>
//               </View>
//             </View>
            
//             <View style={[styles.gridVerticalDivider, { backgroundColor: theme.border }]} />
            
//             <View style={styles.gridItem}>
//               <Users size={16} color={theme.accent} />
//               <View style={styles.gridTextContainer}>
//                 <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>SERVINGS</Text>
//                 <Text style={[styles.gridValue, { color: theme.text }]}>{recipe.servings} Ppl</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </View>

//       {/* FIXED PREMIUM NAVIGATION TAB BAR */}
//       <View style={styles.tabBarWrapper}>
//         <View style={[styles.tabBar, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9', borderColor: theme.border }]}>
//           <TouchableOpacity 
//             activeOpacity={0.9}
//             style={[styles.tabButton, activeTab === 'ingredients' && [styles.activeTabButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]]} 
//             onPress={() => setActiveTab('ingredients')}
//           >
//             <Text style={[styles.tabText, { color: activeTab === 'ingredients' ? theme.accent : theme.textSecondary }]}>{t('ingredients')}</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             activeOpacity={0.9}
//             style={[styles.tabButton, activeTab === 'instructions' && [styles.activeTabButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]]} 
//             onPress={() => setActiveTab('instructions')}
//           >
//             <Text style={[styles.tabText, { color: activeTab === 'instructions' ? theme.accent : theme.textSecondary }]}>{t('instructions')}</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             activeOpacity={0.9}
//             style={[styles.tabButton, activeTab === 'video' && [styles.activeTabButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]]} 
//             onPress={() => setActiveTab('video')}
//           >
//             <Text style={[styles.tabText, { color: activeTab === 'video' ? theme.accent : theme.textSecondary }]}>{t('video')}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* DYNAMIC INDEPENDENTLY SCROLLING INTERIOR */}
//       <ScrollView 
//         ref={innerScrollRef}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.innerScrollContent}
//         style={styles.flexibleContainer}
//       >
//         {activeTab === 'ingredients' && (
//           <View style={styles.listContainer}>
//             {displayIngredients.map((item, index) => {
//               const itemKey = `${recipe.id}-ing-${index}`;
//               const isCompleted = completedItems.includes(itemKey);
//               return (
//                 <TouchableOpacity
//                   key={itemKey}
//                   activeOpacity={0.7}
//                   style={[
//                     styles.listItem, 
//                     { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.border },
//                     isCompleted && [styles.disabledItem, { borderColor: theme.border + '40' }]
//                   ]}
//                   onPress={() => toggleItemKey(itemKey)}
//                 >
//                   <View style={styles.interactiveCheckWrapper}>
//                     {isCompleted ? (
//                       <CheckCircle2 size={20} color="#10B981" />
//                     ) : (
//                       <Circle size={20} color={theme.textSecondary + '80'} />
//                     )}
//                   </View>
//                   <Text style={[styles.listText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeThroughText]}>
//                     {item}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}

//             {allIngredientsChecked && (
//               <TouchableOpacity 
//                 activeOpacity={0.8} 
//                 style={[styles.wizardActionBtn, { backgroundColor: theme.accent }]}
//                 onPress={handleNextToInstructions}
//               >
//                 <Text style={styles.wizardActionBtnText}>Ingredients Ready! Let's Cook</Text>
//                 <ArrowRight size={18} color="#FFFFFF" />
//               </TouchableOpacity>
//             )}
//           </View>
//         )}

//         {activeTab === 'instructions' && (
//           <View style={styles.listContainer}>
//             {displayInstructions.map((step, index) => {
//               const itemKey = `${recipe.id}-ins-${index}`;
//               const isCompleted = completedItems.includes(itemKey);
//               return (
//                 <TouchableOpacity
//                   key={itemKey}
//                   activeOpacity={0.7}
//                   style={[
//                     styles.instructionStep, 
//                     { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.border },
//                     isCompleted && [styles.disabledItem, { borderColor: theme.border + '40' }]
//                   ]}
//                   onPress={() => toggleItemKey(itemKey)}
//                 >
//                   <View style={[
//                     styles.stepNumberCapsule, 
//                     { backgroundColor: isCompleted ? theme.textSecondary + '20' : theme.accent + '15' }
//                   ]}>
//                     <Text style={[styles.stepNumberText, { color: isCompleted ? theme.textSecondary : theme.accent }]}>
//                       {(index + 1).toString().padStart(2, '0')}
//                     </Text>
//                   </View>
//                   <Text style={[
//                     styles.instructionText, 
//                     { color: isCompleted ? theme.textSecondary : theme.text }, 
//                     isCompleted && styles.strikeThroughText
//                   ]}>
//                     {step}.
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}

//             {allInstructionsChecked && (
//               <TouchableOpacity 
//                 activeOpacity={0.8} 
//                 style={[styles.wizardActionBtn, { backgroundColor: '#10B981' }]}
//                 onPress={handleFinishRecipe}
//               >
//                 <Text style={styles.wizardActionBtnText}>Complete & Reset Progress</Text>
//                 <Sparkles size={18} color="#FFFFFF" />
//               </TouchableOpacity>
//             )}
//           </View>
//         )}

//         {activeTab === 'video' && (
//           <View style={[styles.videoContainer, { borderColor: theme.border, backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
//             {youtubeId ? (
//               <View style={styles.videoWrapper}>
//                 <YoutubePlayer height={200} width={width - 32} play={false} videoId={youtubeId} />
//               </View>
//             ) : (
//               <View style={styles.noVideo}>
//                 <PlayCircle size={44} color={theme.textSecondary + '80'} />
//                 <Text style={[styles.noVideoText, { color: theme.textSecondary }]}>No Video Tutorial Found</Text>
//               </View>
//             )}
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   flexibleContainer: { flex: 1 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   imageContainer: { width: '100%', height: 200, position: 'relative' },
//   headerImage: { width: '100%', height: '100%' },
//   imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.35)' },
//   navbar: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
//   navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)' },
//   floatingTopBadges: { position: 'absolute', bottom: 35, left: 16, flexDirection: 'row', gap: 8, zIndex: 10 },
//   premiumBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
//   premiumBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
//   staticCardWrapper: { paddingHorizontal: 16, marginTop: -25, zIndex: 20 },
//   infoCard: { padding: 18, borderRadius: 24, borderWidth: 1, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
//   cuisineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
//   cuisineText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
//   dotSeparator: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 6 },
//   courseMetaText: { fontSize: 12, fontWeight: '600' },
//   title: { fontSize: 22, fontWeight: '900', lineHeight: 28, marginBottom: 14, letterSpacing: -0.2 },
//   metaGrid: { flexDirection: 'row', borderWidth: 1, borderRadius: 16, paddingVertical: 10 },
//   gridItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 4 },
//   gridVerticalDivider: { width: 1, height: '65%', alignSelf: 'center' },
//   gridTextContainer: { flexDirection: 'column' },
//   gridLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.6, marginBottom: 1 },
//   gridValue: { fontSize: 13, fontWeight: '800' },
//   tabBarWrapper: { paddingHorizontal: 16, marginTop: 16, marginBottom: 10 },
//   tabBar: { flexDirection: 'row', padding: 5, borderRadius: 16, borderWidth: 1 },
//   tabButton: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
//   activeTabButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 2 },
//   tabText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
//   innerScrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 },
//   listContainer: { gap: 10 },
//   listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
//   interactiveCheckWrapper: { marginRight: 10, justifyContent: 'center', alignItems: 'center' },
//   listText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20, letterSpacing: -0.1 },
//   instructionStep: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1 },
//   stepNumberCapsule: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
//   stepNumberText: { fontWeight: '900', fontSize: 11 },
//   instructionText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 22, letterSpacing: -0.1 },
//   disabledItem: { opacity: 0.45, borderStyle: 'dashed' },
//   strikeThroughText: { textDecorationLine: 'line-through', textDecorationStyle: 'solid' },
//   wizardActionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 16, borderRadius: 18, marginTop: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
//   wizardActionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.2 },
//   videoContainer: { width: '100%', borderRadius: 20, overflow: 'hidden', borderWidth: 1, minHeight: 200, justifyContent: 'center' },
//   videoWrapper: { borderRadius: 20, overflow: 'hidden' },
//   noVideo: { justifyContent: 'center', alignItems: 'center', gap: 10, padding: 30 },
//   noVideoText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.1 },
// });




// -----------------------------------------------------------------------------------------------------------

// perfer perfect design

// import { ThemedView } from '@/components/themed-view';
// import { useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { supabase } from '@/lib/supabase';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import {
//   ArrowLeft,
//   ArrowRight,
//   Bookmark,
//   CheckCircle2,
//   Circle,
//   Clock,
//   PlayCircle,
//   Sparkles,
//   Users
// } from 'lucide-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from 'react-native';
// import YoutubePlayer from 'react-native-youtube-iframe';

// interface RecipeDetails {
//   id: string;
//   recipe_name: string;
//   translated_recipe_name: string;
//   ingredients: string;
//   translated_ingredients: string;
//   instructions: string;
//   translated_instructions: string;
//   prep_time_in_mins: number;
//   cook_time_in_mins: number;
//   total_time_in_mins: number;
//   servings: string;
//   cuisine: string;
//   course: string;
//   diet: string;
//   difficulty: string;
//   image_url: string;
//   video_url: string | null;
// }

// export default function RecipeDetailsScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const { colors: theme, isDark } = useTheme();
//   const { t, language } = useLanguage();
//   const { width } = useWindowDimensions();

//   const innerScrollRef = useRef<ScrollView>(null);

//   const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
//   const [completedItems, setCompletedItems] = useState<string[]>([]);

//   useEffect(() => {
//     if (id) {
//       setActiveTab('ingredients');
//       setCompletedItems([]);
//       innerScrollRef.current?.scrollTo({ y: 0, animated: false });
//       fetchRecipe();
//     }
//   }, [id]);

//   const fetchRecipe = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('recipes')
//         .select('*')
//         .eq('id', id)
//         .single();

//       if (error) {
//         console.log(error);
//         return;
//       }
//       setRecipe(data);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
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

//   const displayName = language === 'en' ? recipe.recipe_name : recipe.translated_recipe_name;

//   const displayIngredients = (
//     language === 'en' ? recipe.ingredients : recipe.translated_ingredients
//   ).split(',').map((item) => item.trim()).filter((item) => item.length > 0);

//   const displayInstructions = (
//     language === 'en' ? recipe.instructions : recipe.translated_instructions
//   ).split('.').map((item) => item.trim()).filter((item) => item.length > 0);

//   const youtubeId = getYouTubeId(recipe.video_url);

//   const currentRecipeIngredientsKeys = displayIngredients.map((_, idx) => `${recipe.id}-ing-${idx}`);
//   const currentRecipeInstructionsKeys = displayInstructions.map((_, idx) => `${recipe.id}-ins-${idx}`);

//   const allIngredientsChecked = currentRecipeIngredientsKeys.every(key => completedItems.includes(key));
//   const allInstructionsChecked = currentRecipeInstructionsKeys.every(key => completedItems.includes(key));
  
//   const userHasProgress = currentRecipeIngredientsKeys.some(key => completedItems.includes(key)) || 
//                           currentRecipeInstructionsKeys.some(key => completedItems.includes(key));

//   const handleBackPress = () => {
//     if (userHasProgress) {
//       Alert.alert(
//         "Exit Cooking Session?",
//         "You have checked items in this recipe. Leaving now will discard your current progress tracking.",
//         [
//           { text: "Keep Cooking", style: "cancel" },
//           { text: "Exit & Clear", style: "destructive", onPress: () => {
//               resetRecipeStates();
//               router.back();
//             } 
//           }
//         ]
//       );
//     } else {
//       router.back();
//     }
//   };

//   const toggleItemKey = (key: string) => {
//     setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   const resetRecipeStates = () => {
//     const combinedRecipeKeys = [...currentRecipeIngredientsKeys, ...currentRecipeInstructionsKeys];
//     setCompletedItems(prev => prev.filter(key => !combinedRecipeKeys.includes(key)));
//   };

//   const handleNextToInstructions = () => {
//     setActiveTab('instructions');
//     setTimeout(() => {
//       innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//     }, 60);
//   };

//   const handleFinishRecipe = () => {
//     Alert.alert(
//       "Yum! Cooking Complete! 🎉",
//       "Delicious job! We have reset your checkboxes so you can easily prepare this dish next time.",
//       [
//         { text: "Awesome!", onPress: () => {
//             resetRecipeStates();
//             setActiveTab('ingredients');
//             innerScrollRef.current?.scrollTo({ y: 0, animated: true });
//           }
//         }
//       ]
//     );
//   };

//   function getYouTubeId(url: string | null) {
//     if (!url) return '';
//     try {
//       const watchMatch = url.match(/[?&]v=([^&]+)/);
//       if (watchMatch && watchMatch[1]) return watchMatch[1];
//       const shortMatch = url.match(/youtu\.be\/([^?]+)/);
//       if (shortMatch && shortMatch[1]) return shortMatch[1];
//       const shortsMatch = url.match(/shorts\/([^?]+)/);
//       if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
//       const embedMatch = url.match(/embed\/([^?]+)/);
//       if (embedMatch && embedMatch[1]) return embedMatch[1];
//       return '';
//     } catch (error) {
//       return '';
//     }
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' }]}>
//       {/* IMMERSIVE TOP IMAGE BACKGROUND AS SEEN IN image_e35426.png */}
//       <View style={styles.imageBackgroundContainer}>
//         <Image source={{ uri: recipe.image_url }} style={styles.headerImage} resizeMode="cover" />
//         <View style={styles.darkGradientOverlay} />
        
//         {/* BACK BUTTON */}
//         <View style={styles.navbar}>
//           <TouchableOpacity style={styles.navButton} onPress={handleBackPress}>
//             <ArrowLeft size={22} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         {/* FLOATING TRANSLUCENT CHEF BANNER PROFILE PANEL */}
//         <View style={styles.chefFloatingPanel}>
//           <View style={styles.chefProfileSection}>
//             <View style={[styles.chefAvatarCircle, { backgroundColor: theme.accent }]}>
//               <Text style={styles.chefAvatarText}>
//                 {recipe.cuisine ? recipe.cuisine.charAt(0).toUpperCase() : 'C'}
//               </Text>
//             </View>
//             <View>
//               <Text style={styles.chefNameText}>{recipe.cuisine} Chef</Text>
//               <Text style={styles.chefMetaSubtitle}>{recipe.diet} • {recipe.difficulty}</Text>
//             </View>
//           </View>
//           <View style={[styles.followBadge, { backgroundColor: theme.accent }]}>
//             <Text style={styles.followBadgeText}>{recipe.course}</Text>
//           </View>
//         </View>
//       </View>

//       {/* PULL-UP SHEET CONTENT CONTAINER */}
//       <View style={[styles.pullUpCardSheet, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        
//         {/* RECIPE TITLE & ACTION ROW */}
//         <View style={styles.titleSectionRow}>
//           <Text style={[styles.recipeMainTitle, { color: theme.text }]} numberOfLines={2}>
//             {displayName}
//           </Text>
//           <TouchableOpacity style={styles.bookmarkActionCircle}>
//             <Bookmark size={22} color="#10B981" fill="#10B981" />
//           </TouchableOpacity>
//         </View>

//         {/* TIME & SERVINGS SIMPLE SPECS SUBSECTION */}
//         <View style={styles.simpleSpecsRow}>
//           <View style={styles.specInlineItem}>
//             <Clock size={16} color={theme.textSecondary} />
//             <Text style={[styles.specInlineText, { color: theme.textSecondary }]}>{recipe.total_time_in_mins} mins</Text>
//           </View>
//           <View style={[styles.inlineDot, { backgroundColor: theme.textSecondary + '40' }]} />
//           <View style={styles.specInlineItem}>
//             <Users size={16} color={theme.textSecondary} />
//             <Text style={[styles.specInlineText, { color: theme.textSecondary }]}>{recipe.servings} servings</Text>
//           </View>
//         </View>

//         {/* MINIMALIST SEGMENTED NAVIGATION LABELS */}
//         <View style={[styles.navigationLabelsBar, { borderBottomColor: theme.border }]}>
//           <TouchableOpacity 
//             style={[styles.labelTabItem, activeTab === 'ingredients' && [styles.activeLabelTabItem, { borderBottomColor: theme.accent }]]}
//             onPress={() => setActiveTab('ingredients')}
//           >
//             <Text style={[styles.labelTextText, { color: activeTab === 'ingredients' ? theme.accent : theme.textSecondary }]}>
//               Ingredients ({displayIngredients.length})
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.labelTabItem, activeTab === 'instructions' && [styles.activeLabelTabItem, { borderBottomColor: theme.accent }]]}
//             onPress={() => setActiveTab('instructions')}
//           >
//             <Text style={[styles.labelTextText, { color: activeTab === 'instructions' ? theme.accent : theme.textSecondary }]}>
//               Steps
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.labelTabItem, activeTab === 'video' && [styles.activeLabelTabItem, { borderBottomColor: theme.accent }]]}
//             onPress={() => setActiveTab('video')}
//           >
//             <Text style={[styles.labelTextText, { color: activeTab === 'video' ? theme.accent : theme.textSecondary }]}>
//               Video
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* SCROLLABLE INNER TAB DATA AREA */}
//         <ScrollView
//           ref={innerScrollRef}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.innerSheetScrollArea}
//           style={styles.flexGrowth}
//         >
//           {activeTab === 'ingredients' && (
//             <View style={styles.elementsStack}>
//               {displayIngredients.map((item, index) => {
//                 const itemKey = `${recipe.id}-ing-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.8}
//                     style={[
//                       styles.premiumCardItem,
//                       { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: theme.border },
//                       isCompleted && styles.completedDimState
//                     ]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.leftRowItemAlign}>
//                       <View style={styles.checkboxSpace}>
//                         {isCompleted ? (
//                           <CheckCircle2 size={20} color="#10B981" />
//                         ) : (
//                           <Circle size={20} color={theme.textSecondary + '60'} />
//                         )}
//                       </View>
//                       <Text style={[styles.cardItemMainText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeText]}>
//                         {item}
//                       </Text>
//                     </View>
//                     <Text style={[styles.cardItemRightQuantity, { color: theme.accent }]}>
//                       {index + 1}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}

//               {allIngredientsChecked && (
//                 <TouchableOpacity 
//                   activeOpacity={0.8} 
//                   style={[styles.bottomWizardBtn, { backgroundColor: theme.accent }]}
//                   onPress={handleNextToInstructions}
//                 >
//                   <Text style={styles.bottomWizardBtnText}>Start Preparing Steps</Text>
//                   <ArrowRight size={18} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'instructions' && (
//             <View style={styles.elementsStack}>
//               {displayInstructions.map((step, index) => {
//                 const itemKey = `${recipe.id}-ins-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.8}
//                     style={[
//                       styles.premiumCardItem,
//                       { backgroundColor: isDark ? '#2D3748' : '#F8FAFC', borderColor: theme.border },
//                       isCompleted && styles.completedDimState
//                     ]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.leftRowItemAlign}>
//                       <View style={[styles.numberedCircleBadge, { backgroundColor: isCompleted ? theme.textSecondary + '30' : theme.accent + '15' }]}>
//                         <Text style={[styles.numberedCircleBadgeText, { color: isCompleted ? theme.textSecondary : theme.accent }]}>
//                           {index + 1}
//                         </Text>
//                       </View>
//                       <Text style={[styles.cardStepBodyText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeText]}>
//                         {step}.
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}

//               {allInstructionsChecked && (
//                 <TouchableOpacity 
//                   activeOpacity={0.8} 
//                   style={[styles.bottomWizardBtn, { backgroundColor: '#10B981' }]}
//                   onPress={handleFinishRecipe}
//                 >
//                   <Text style={styles.bottomWizardBtnText}>Finish Session & Clear</Text>
//                   <Sparkles size={18} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'video' && (
//             <View style={[styles.videoCardWrapper, { borderColor: theme.border, backgroundColor: isDark ? '#2D3748' : '#F8FAFC' }]}>
//               {youtubeId ? (
//                 <View style={styles.videoMask}>
//                   <YoutubePlayer height={200} width={width - 32} play={false} videoId={youtubeId} />
//                 </View>
//               ) : (
//                 <View style={styles.missingVideoArea}>
//                   <PlayCircle size={44} color={theme.textSecondary + '70'} />
//                   <Text style={[styles.missingVideoLabelText, { color: theme.textSecondary }]}>Video content not loaded</Text>
//                 </View>
//               )}
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   flexGrowth: { flex: 1 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   imageBackgroundContainer: { width: '100%', height: 290, position: 'relative' },
//   headerImage: { width: '100%', height: '100%' },
//   darkGradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.25)' },
//   navbar: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
//   navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'center', alignItems: 'center' },
//   chefFloatingPanel: { position: 'absolute', bottom: 35, left: 16, right: 16, height: 62, borderRadius: 16, backgroundColor: 'rgba(15, 23, 42, 0.65)', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 0.1, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)' },
//   chefProfileSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   chefAvatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
//   chefAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
//   chefNameText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
//   chefMetaSubtitle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11, fontWeight: '500', marginTop: 1 },
//   followBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
//   followBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
//   pullUpCardSheet: { flex: 1, marginTop: -20, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 16, paddingTop: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
//   titleSectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   recipeMainTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, flex: 1 },
//   bookmarkActionCircle: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
//   simpleSpecsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
//   specInlineItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   specInlineText: { fontSize: 13, fontWeight: '600' },
//   inlineDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },
//   navigationLabelsBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16 },
//   labelTabItem: { paddingVertical: 10, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
//   activeLabelTabItem: { borderBottomWidth: 2 },
//   labelTextText: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
//   innerSheetScrollArea: { paddingBottom: 30, paddingTop: 2 },
//   elementsStack: { gap: 10 },
//   premiumCardItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
//   leftRowItemAlign: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
//   checkboxSpace: { justifyContent: 'center', alignItems: 'center' },
//   cardItemMainText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
//   cardItemRightQuantity: { fontSize: 13, fontWeight: '700' },
//   numberedCircleBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   numberedCircleBadgeText: { fontWeight: '800', fontSize: 11 },
//   cardStepBodyText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 22 },
//   completedDimState: { opacity: 0.5, borderStyle: 'dashed' },
//   strikeText: { textDecorationLine: 'line-through' },
//   bottomWizardBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, marginTop: 10 },
//   bottomWizardBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
//   videoCardWrapper: { width: '100%', borderRadius: 18, overflow: 'hidden', borderWidth: 1, minHeight: 200, justifyContent: 'center' },
//   videoMask: { borderRadius: 18, overflow: 'hidden' },
//   missingVideoArea: { justifyContent: 'center', alignItems: 'center', gap: 8, padding: 30 },
//   missingVideoLabelText: { fontSize: 13, fontWeight: '700' },
// });




// import { ThemedView } from '@/components/themed-view';
// import { useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { supabase } from '@/lib/supabase';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import {
//   ArrowLeft,
//   ArrowRight,
//   Bookmark,
//   CheckCircle2,
//   Circle,
//   PlayCircle,
//   Plus,
//   Sparkles
// } from 'lucide-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from 'react-native';
// import YoutubePlayer from 'react-native-youtube-iframe';

// interface RecipeDetails {
//   id: string;
//   recipe_name: string;
//   translated_recipe_name: string;
//   ingredients: string;
//   translated_ingredients: string;
//   instructions: string;
//   translated_instructions: string;
//   prep_time_in_mins: number;
//   cook_time_in_mins: number;
//   total_time_in_mins: number;
//   servings: string;
//   cuisine: string;
//   course: string;
//   diet: string;
//   difficulty: string;
//   image_url: string;
//   video_url: string | null;
// }

// export default function RecipeDetailsScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const { colors: theme, isDark } = useTheme();
//   const { t, language } = useLanguage();
//   const { width } = useWindowDimensions();

//   const innerScrollRef = useRef<ScrollView>(null);

//   const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
//   const [completedItems, setCompletedItems] = useState<string[]>([]);

//   useEffect(() => {
//     if (id) {
//       setActiveTab('ingredients');
//       setCompletedItems([]);
//       innerScrollRef.current?.scrollTo({ y: 0, animated: false });
//       fetchRecipe();
//     }
//   }, [id]);

//   const fetchRecipe = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('recipes')
//         .select('*')
//         .eq('id', id)
//         .single();

//       if (error) {
//         console.log(error);
//         return;
//       }
//       setRecipe(data);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
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

//   const displayName = language === 'en' ? recipe.recipe_name : recipe.translated_recipe_name;

//   const displayIngredients = (
//     language === 'en' ? recipe.ingredients : recipe.translated_ingredients
//   ).split(',').map((item) => item.trim()).filter((item) => item.length > 0);

//   const displayInstructions = (
//     language === 'en' ? recipe.instructions : recipe.translated_instructions
//   ).split('.').map((item) => item.trim()).filter((item) => item.length > 0);

//   const youtubeId = getYouTubeId(recipe.video_url);

//   const currentRecipeIngredientsKeys = displayIngredients.map((_, idx) => `${recipe.id}-ing-${idx}`);
//   const currentRecipeInstructionsKeys = displayInstructions.map((_, idx) => `${recipe.id}-ins-${idx}`);

//   const allIngredientsChecked = currentRecipeIngredientsKeys.every(key => completedItems.includes(key));
//   const allInstructionsChecked = currentRecipeInstructionsKeys.every(key => completedItems.includes(key));
  
//   const userHasProgress = currentRecipeIngredientsKeys.some(key => completedItems.includes(key)) || 
//                           currentRecipeInstructionsKeys.some(key => completedItems.includes(key));

//   const handleBackPress = () => {
//     if (userHasProgress) {
//       Alert.alert(
//         "Discard Session?",
//         "Your dynamic checkmarks will be cleared.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Exit", style: "destructive", onPress: () => { resetRecipeStates(); router.back(); } }
//         ]
//       );
//     } else {
//       router.back();
//     }
//   };

//   const toggleItemKey = (key: string) => {
//     setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   const resetRecipeStates = () => {
//     const combinedRecipeKeys = [...currentRecipeIngredientsKeys, ...currentRecipeInstructionsKeys];
//     setCompletedItems(prev => prev.filter(key => !combinedRecipeKeys.includes(key)));
//   };

//   function getYouTubeId(url: string | null) {
//     if (!url) return '';
//     try {
//       const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/) || url.match(/shorts\/([^?]+)/);
//       return match ? match[1] : '';
//     } catch {
//       return '';
//     }
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F4F4F5' }]}>
      
//       {/* FULL-BLEED BACKGROUND PHOTO BACKDROP */}
//       <View style={styles.imageHeaderWrapper}>
//         <Image source={{ uri: recipe.image_url }} style={styles.heroImageFill} resizeMode="cover" />
        
//         {/* TOP INTERACTIVE ACTION ROW */}
//         <View style={styles.topActionRow}>
//           <TouchableOpacity style={styles.minimalBackBtn} onPress={handleBackPress}>
//             <ArrowLeft size={20} color="#111827" />
//           </TouchableOpacity>
//         </View>

//         {/* BRUTALIST FLOATING BRAND CHIP */}
//         <View style={styles.floatingBrutalPanel}>
//           <View style={styles.avatarSection}>
//             <View style={styles.avatarMiniBlock}>
//               <Text style={styles.avatarLetter}>{recipe.cuisine ? recipe.cuisine.charAt(0) : 'R'}</Text>
//             </View>
//             <Text style={styles.authorTitleText}>{recipe.cuisine} Kitchen</Text>
//           </View>
//           <TouchableOpacity style={[styles.followCapsuleBtn, { backgroundColor: theme.accent }]}>
//             <Text style={styles.followCapsuleBtnText}>Follow</Text>
//             <Plus size={12} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* SYSTEMATIC DATA SHEET BOTTOM STACK */}
//       <View style={[styles.editorialDataSheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        
//         {/* COMPACT HEADLINE ROW */}
//         <View style={styles.headlineContainer}>
//           <Text style={[styles.editorialTitle, { color: theme.text }]} numberOfLines={2}>
//             {displayName}
//           </Text>
//           <TouchableOpacity style={styles.bookmarkBadgeContainer}>
//             <Bookmark size={22} color="#10B981" fill="#10B981" />
//           </TouchableOpacity>
//         </View>

//         {/* FLUID SPECS BADGES */}
//         <View style={styles.compactSpecsGrid}>
//           <Text style={[styles.badgeTextMeta, { color: theme.textSecondary }]}>
//             {recipe.total_time_in_mins} Mins Total
//           </Text>
//           <Text style={styles.badgeMetaDot}>•</Text>
//           <Text style={[styles.badgeTextMeta, { color: theme.textSecondary }]}>
//             Yields {recipe.servings} Servings
//           </Text>
//           <Text style={styles.badgeMetaDot}>•</Text>
//           <Text style={[styles.badgeTextMeta, { color: theme.accent, textTransform: 'uppercase', fontWeight: '800' }]}>
//             {recipe.difficulty}
//           </Text>
//         </View>

//         {/* HIGH-CONTRAST UNDERLINED TAB SEGMENTS */}
//         <View style={[styles.underlinedTabBar, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E7EB' }]}>
//           <TouchableOpacity 
//             style={[styles.underlinedTabItem, activeTab === 'ingredients' && { borderBottomColor: theme.text }]}
//             onPress={() => setActiveTab('ingredients')}
//           >
//             <Text style={[styles.tabLabelTypography, { color: activeTab === 'ingredients' ? theme.text : theme.textSecondary }]}>
//               Ingredients ({displayIngredients.length})
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.underlinedTabItem, activeTab === 'instructions' && { borderBottomColor: theme.text }]}
//             onPress={() => setActiveTab('instructions')}
//           >
//             <Text style={[styles.tabLabelTypography, { color: activeTab === 'instructions' ? theme.text : theme.textSecondary }]}>
//               Instructions
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.underlinedTabItem, activeTab === 'video' && { borderBottomColor: theme.text }]}
//             onPress={() => setActiveTab('video')}
//           >
//             <Text style={[styles.tabLabelTypography, { color: activeTab === 'video' ? theme.text : theme.textSecondary }]}>
//               Video Guides
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* INLINE INTERNAL INDEPENDENT SCROLL LIST CONTAINER */}
//         <ScrollView
//           ref={innerScrollRef}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listInternalScroller}
//           style={styles.flexBox}
//         >
//           {activeTab === 'ingredients' && (
//             <View style={styles.verticalDataList}>
//               {displayIngredients.map((item, index) => {
//                 const itemKey = `${recipe.id}-ing-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.85}
//                     style={[
//                       styles.flatAsymmetricRow,
//                       { backgroundColor: isDark ? '#262629' : '#F9F9F9', borderColor: isDark ? '#3A3A3C' : '#E5E7EB' },
//                       isCompleted && styles.completedMutedOpacity
//                     ]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.leftRowGroup}>
//                       {isCompleted ? (
//                         <CheckCircle2 size={18} color="#10B981" />
//                       ) : (
//                         <Circle size={18} color={theme.textSecondary + '70'} />
//                       )}
//                       <Text style={[styles.ingredientItemLabelText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeThrough]}>
//                         {item}
//                       </Text>
//                     </View>
//                     <Text style={[styles.rightIndexQuantityText, { color: theme.textSecondary }]}>
//                       {index + 1}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}

//               {allIngredientsChecked && (
//                 <TouchableOpacity 
//                   activeOpacity={0.8} 
//                   style={[styles.blockAccentBtn, { backgroundColor: theme.accent }]}
//                   onPress={() => setActiveTab('instructions')}
//                 >
//                   <Text style={styles.blockAccentBtnText}>Proceed to Instructions</Text>
//                   <ArrowRight size={16} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'instructions' && (
//             <View style={styles.verticalDataList}>
//               {displayInstructions.map((step, index) => {
//                 const itemKey = `${recipe.id}-ins-${index}`;
//                 const isCompleted = completedItems.includes(itemKey);
//                 return (
//                   <TouchableOpacity
//                     key={itemKey}
//                     activeOpacity={0.85}
//                     style={[
//                       styles.flatAsymmetricRow,
//                       { backgroundColor: isDark ? '#262629' : '#F9F9F9', borderColor: isDark ? '#3A3A3C' : '#E5E7EB' },
//                       isCompleted && styles.completedMutedOpacity
//                     ]}
//                     onPress={() => toggleItemKey(itemKey)}
//                   >
//                     <View style={styles.stepBlockIndicator}>
//                       <Text style={[styles.stepBlockNumberText, { color: isCompleted ? theme.textSecondary : theme.accent }]}>
//                         {index + 1}
//                       </Text>
//                     </View>
//                     <Text style={[styles.instructionStepBodyText, { color: isCompleted ? theme.textSecondary : theme.text }, isCompleted && styles.strikeThrough]}>
//                       {step}.
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}

//               {allInstructionsChecked && (
//                 <TouchableOpacity 
//                   activeOpacity={0.8} 
//                   style={[styles.blockAccentBtn, { backgroundColor: '#10B981' }]}
//                   onPress={() => {
//                     Alert.alert("All Done! 🎉", "Resetting trackers.", [{ text: "Ok", onPress: () => { resetRecipeStates(); setActiveTab('ingredients'); } }]);
//                   }}
//                 >
//                   <Text style={styles.blockAccentBtnText}>Reset & Complete Session</Text>
//                   <Sparkles size={16} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {activeTab === 'video' && (
//             <View style={[styles.videoFramedCard, { borderColor: isDark ? '#3A3A3C' : '#E5E7EB', backgroundColor: isDark ? '#262629' : '#F9F9F9' }]}>
//               {youtubeId ? (
//                 <View style={styles.videoMaskOver}>
//                   <YoutubePlayer height={225} width={width - 32} play={false} videoId={youtubeId} />
//                 </View>
//               ) : (
//                 <View style={styles.emptyVideoStateBlock}>
//                   <PlayCircle size={40} color={theme.textSecondary + '60'} />
//                   <Text style={[styles.emptyVideoStateLabelText, { color: theme.textSecondary }]}>No Video Feed Found</Text>
//                 </View>
//               )}
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   flexBox: { flex: 1 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   imageHeaderWrapper: { width: '100%', height: 260, position: 'relative' },
//   heroImageFill: { width: '100%', height: '100%' },
//   topActionRow: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
//   minimalBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
//   floatingBrutalPanel: { position: 'absolute', bottom: 25, left: 16, right: 16, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
//   avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   avatarMiniBlock: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
//   avatarLetter: { color: '#111827', fontWeight: '800', fontSize: 13 },
//   authorTitleText: { color: '#111827', fontSize: 13, fontWeight: '700' },
//   followCapsuleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
//   followCapsuleBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
//   editorialDataSheet: { flex: 1, marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 22 },
//   headlineContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
//   editorialTitle: { fontSize: 20, fontWeight: '800', flex: 1, letterSpacing: -0.2, lineHeight: 26 },
//   bookmarkBadgeContainer: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
//   compactSpecsGrid: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 18 },
//   badgeTextMeta: { fontSize: 12, fontWeight: '600' },
//   badgeMetaDot: { marginHorizontal: 6, fontSize: 12, color: '#9CA3AF' },
//   underlinedTabBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 14 },
//   underlinedTabItem: { paddingVertical: 8, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
//   tabLabelTypography: { fontSize: 13, fontWeight: '700' },
//   listInternalScroller: { paddingBottom: 30 },
//   verticalDataList: { gap: 8 },
//   flatAsymmetricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
//   leftRowGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
//   ingredientItemLabelText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },
//   rightIndexQuantityText: { fontSize: 12, fontWeight: '700' },
//   stepBlockIndicator: { marginRight: 10, justifyContent: 'center' },
//   stepBlockNumberText: { fontWeight: '900', fontSize: 13 },
//   instructionStepBodyText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 20 },
//   completedMutedOpacity: { opacity: 0.45 },
//   strikeThrough: { textDecorationLine: 'line-through' },
//   blockAccentBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
//   blockAccentBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
//   videoFramedCard: { width: '100%', borderRadius: 14, overflow: 'hidden', borderWidth: 1, minHeight: 195, justifyContent: 'center' },
//   videoMaskOver: { borderRadius: 14, overflow: 'hidden' },
//   emptyVideoStateBlock: { justifyContent: 'center', alignItems: 'center', gap: 6, padding: 30 },
//   emptyVideoStateLabelText: { fontSize: 12, fontWeight: '700' },
// });






import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
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
  Users
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
  View
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

interface RecipeDetails {
  id: string;
  srno: number;
  recipe_name: string;
  translated_recipe_name: string;
  ingredients: string;
  translated_ingredients: string;
  instructions: string;
  translated_instructions: string;
  prep_time_in_mins: number;
  cook_time_in_mins: number;
  total_time_in_mins: number;
  servings: string;
  cuisine: string;
  course: string;
  diet: string;
  image_url: string;
  video_url: string | null;
  url: string;
  created_at: string;
}

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors: theme, isDark } = useTheme(); 
  const { t, language } = useLanguage();
  const { width } = useWindowDimensions();

  const innerScrollRef = useRef<ScrollView>(null);

  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'video'>('ingredients');
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      setActiveTab('ingredients');
      setCompletedItems([]);
      innerScrollRef.current?.scrollTo({ y: 0, animated: false });
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.log(error);
        return;
      }
      setRecipe(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // --- FIXED NAVIGATION: CLEARS STATE ON DISCARD ---
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
              setCompletedItems([]); // Clear out marked ingredients/steps explicitly
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
        <ActivityIndicator size="large" color="#FF5A5F" />
      </ThemedView>
    );
  }

  if (!recipe) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#1E293B' }}>Recipe not found</Text>
      </ThemedView>
    );
  }

  const displayName = language === 'en' ? recipe.recipe_name : recipe.translated_recipe_name;

  const displayIngredients = (
    language === 'en' ? recipe.ingredients : recipe.translated_ingredients
  ).split(',').map((item) => item.trim()).filter((item) => item.length > 0);

  const displayInstructions = (
    language === 'en' ? recipe.instructions : recipe.translated_instructions
  ).split('.').map((item) => item.trim()).filter((item) => item.length > 0);

  const youtubeId = getYouTubeId(recipe.video_url);

  const currentRecipeIngredientsKeys = displayIngredients.map((_, idx) => `${recipe.id}-ing-${idx}`);
  const currentRecipeInstructionsKeys = displayInstructions.map((_, idx) => `${recipe.id}-ins-${idx}`);

  const allIngredientsChecked = currentRecipeIngredientsKeys.every(key => completedItems.includes(key));
  const allInstructionsChecked = currentRecipeInstructionsKeys.every(key => completedItems.includes(key));

  const toggleItemKey = (key: string) => {
    setCompletedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const resetRecipeStates = () => {
    const combinedRecipeKeys = [...currentRecipeIngredientsKeys, ...currentRecipeInstructionsKeys];
    setCompletedItems(prev => prev.filter(key => !combinedRecipeKeys.includes(key)));
  };

  function getYouTubeId(url: string | null) {
    if (!url) return '';
    try {
      const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/) || url.match(/shorts\/([^?]+)/);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  }

  // DYNAMIC THEMING COLOR CONFIGURATION
  const bgMain = isDark ? '#0F172A' : '#F8FAFC';
  const bgSheet = isDark ? '#1E293B' : '#FFFFFF';
  const bgCard = isDark ? '#2D3748' : '#F8FAFC';
  const bgTabs = isDark ? '#0F172A' : '#F1F5F9';
  const textMain = isDark ? '#FFFFFF' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const borderLine = isDark ? '#334155' : '#E2E8F0';
  const glassBg = isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.4)';

  return (
    <View style={[styles.container, { backgroundColor: bgMain }]}>
      {/* IMMERSIVE HEADER IMAGE */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: recipe.image_url }} style={styles.mainImage} resizeMode="cover" />
        <View style={styles.gradientScrim} />

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleActionBtn} onPress={handleBackPress}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* CHEF MODULE BRANDING */}
        <View style={[styles.glassProfileCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          <View style={styles.glassProfileLeft}>
            <View style={styles.chefIconCircle}>
              <Flame size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.chefMainTitle, { color: textMain }]}>{recipe.cuisine || "Specialty"} Kitchen</Text>
              <Text style={[styles.chefSubtitleText, { color: textMuted }]}>Verified Masterchef Recipe</Text>
            </View>
          </View>
          <View style={styles.trendingBadge}>
            <Award size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.trendingBadgeText}>{"Medium"}</Text>
          </View>
        </View>
      </View>

      {/* CORE LAYER CANVAS */}
      <View style={[styles.bottomSheetSheet, { backgroundColor: bgSheet }]}>
        <View style={styles.titleWrapperRow}>
          <Text style={[styles.mainRecipeHeadline, { color: textMain }]} numberOfLines={2}>
            {displayName}
          </Text>
          <TouchableOpacity style={styles.favoriteCircleBadge}>
            <Bookmark size={20} color="#FFB000" fill="#FFB000" />
          </TouchableOpacity>
        </View>

        {/* METRIC PILLS */}
        <View style={styles.statsHubRow}>
          <View style={[styles.statCapsulePill, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
            <Clock size={14} color="#FF5A5F" />
            <Text style={[styles.statCapsuleText, { color: isDark ? '#E2E8F0' : '#475569' }]}>{recipe.total_time_in_mins} Mins</Text>
          </View>
          <View style={[styles.statCapsulePill, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
            <Users size={14} color="#00A699" />
            <Text style={[styles.statCapsuleText, { color: isDark ? '#E2E8F0' : '#475569' }]}>{recipe.servings} Servings</Text>
          </View>
          <View style={[styles.statCapsulePill, { backgroundColor: '#7B1FA2' }]}>
            <Text style={[styles.statCapsuleText, { color: '#FFFFFF' }]}>{recipe.diet || "Fresh"}</Text>
          </View>
        </View>

        {/* TAB CONTROLLERS */}
        <View style={[styles.neonTabsWrapper, { backgroundColor: bgTabs }]}>
          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.neonTabItem, activeTab === 'ingredients' && styles.activeNeonTabItem]}
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.neonTabText, { color: activeTab === 'ingredients' ? '#FFFFFF' : textMuted }]}>
              Ingredients ({displayIngredients.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.neonTabItem, activeTab === 'instructions' && styles.activeNeonTabItem]}
            onPress={() => setActiveTab('instructions')}
          >
            <Text style={[styles.neonTabText, { color: activeTab === 'instructions' ? '#FFFFFF' : textMuted }]}>
              Steps Guide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.neonTabItem, activeTab === 'video' && styles.activeNeonTabItem]}
            onPress={() => setActiveTab('video')}
          >
            <Text style={[styles.neonTabText, { color: activeTab === 'video' ? '#FFFFFF' : textMuted }]}>
              Watch Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE DATA BLOCKS */}
        <ScrollView
          ref={innerScrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollAreaContainerContent}
          style={styles.flexibleGrowth}
        >
          {activeTab === 'ingredients' && (
            <View style={styles.verticalListStack}>
              {displayIngredients.map((item, index) => {
                const itemKey = `${recipe.id}-ing-${index}`;
                const isCompleted = completedItems.includes(itemKey);
                
                const selectedRowBg = isDark ? '#14251C' : '#E6F6F4';
                const selectedBorder = isDark ? '#00E676' : '#00A699';

                return (
                  <TouchableOpacity
                    key={itemKey}
                    activeOpacity={0.9}
                    style={[
                      styles.neonListItemRow, 
                      { backgroundColor: bgCard, borderColor: borderLine },
                      isCompleted && { borderColor: selectedBorder, backgroundColor: selectedRowBg }
                    ]}
                    onPress={() => toggleItemKey(itemKey)}
                  >
                    <View style={styles.listItemLeftRowAlign}>
                      <View style={styles.iconSelectionWrapper}>
                        {isCompleted ? (
                          <CheckCircle2 size={22} color={isDark ? '#00E676' : '#00A699'} />
                        ) : (
                          <Circle size={22} color={isDark ? '#455A64' : '#CBD5E1'} />
                        )}
                      </View>
                      <Text style={[styles.ingredientMainTextText, { color: isDark ? '#F1F5F9' : '#334155' }, isCompleted && styles.completedMutedText]}>
                        {item}
                      </Text>
                    </View>
                    <View style={[styles.countBadgeMicro, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }, isCompleted && { backgroundColor: isDark ? '#263238' : '#E2E8F0' }]}>
                      <Text style={[styles.countBadgeMicroText, { color: textMuted }]}>{index + 1}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {allIngredientsChecked && (
                <TouchableOpacity 
                  activeOpacity={0.85} 
                  style={styles.neonActionSubmitBtn}
                  onPress={() => setActiveTab('instructions')}
                >
                  <Text style={styles.neonActionSubmitBtnText}>Everything Ready! Let's Cook</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {activeTab === 'instructions' && (
            <View style={styles.verticalListStack}>
              {displayInstructions.map((step, index) => {
                const itemKey = `${recipe.id}-ins-${index}`;
                const isCompleted = completedItems.includes(itemKey);
                
                const selectedRowBg = isDark ? '#14251C' : '#E6F6F4';
                const selectedBorder = isDark ? '#00E676' : '#00A699';

                return (
                  <TouchableOpacity
                    key={itemKey}
                    activeOpacity={0.9}
                    style={[
                      styles.neonListItemRow, 
                      { backgroundColor: bgCard, borderColor: borderLine },
                      isCompleted && { borderColor: selectedBorder, backgroundColor: selectedRowBg }
                    ]}
                    onPress={() => toggleItemKey(itemKey)}
                  >
                    <View style={styles.listItemLeftRowAlign}>
                      <View style={[styles.stepGlowCounterBlock, { backgroundColor: 'rgba(255, 90, 95, 0.1)' }, isCompleted && { backgroundColor: isDark ? '#37474F' : '#E2E8F0' }]}>
                        <Text style={[styles.stepGlowCounterBlockText, isCompleted && { color: '#94A3B8' }]}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.recipeInstructionBodyText, { color: isDark ? '#F1F5F9' : '#334155' }, isCompleted && styles.completedMutedText]}>
                        {step}.
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {allInstructionsChecked && (
                <TouchableOpacity 
                  activeOpacity={0.85} 
                  style={[styles.neonActionSubmitBtn, { backgroundColor: isDark ? '#00E676' : '#00A699' }]}
                  onPress={() => {
                    Alert.alert(
                      "Chef Status Unlocked! 🍳", 
                      "Recipe completed successfully.", 
                      [{ text: "Awesome", onPress: () => { resetRecipeStates(); setActiveTab('ingredients'); } }]
                    );
                  }}
                >
                  <Text style={styles.neonActionSubmitBtnText}>Complete Cooking Session</Text>
                  <Sparkles size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {activeTab === 'video' && (
            <View style={[styles.videoEmbeddedCardHolder, { backgroundColor: bgMain, borderColor: borderLine }]}>
              {youtubeId ? (
                <View style={styles.videoMaskClipContainer}>
                  <YoutubePlayer height={200} width={width - 32} play={false} videoId={youtubeId} />
                </View>
              ) : (
                <View style={styles.noVideoPlaceholderArea}>
                  <PlayCircle size={48} color={textMuted} />
                  <Text style={[styles.noVideoPlaceholderText, { color: textMuted }]}>Interactive Video Unavailable</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexibleGrowth: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageWrapper: { width: '100%', height: 280, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  gradientScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.25)' },
  topBar: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  circleActionBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center' },
  glassProfileCard: { position: 'absolute', bottom: 32, left: 16, right: 16, height: 60, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
  glassProfileLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chefIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF5A5F', justifyContent: 'center', alignItems: 'center' },
  chefMainTitle: { fontSize: 13, fontWeight: '700' },
  chefSubtitleText: { fontSize: 11, marginTop: 1 },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00A699', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  trendingBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  bottomSheetSheet: { flex: 1, marginTop: -16, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 22 },
  titleWrapperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  mainRecipeHeadline: { fontSize: 20, fontWeight: '800', flex: 1, letterSpacing: -0.3, lineHeight: 26 },
  favoriteCircleBadge: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  statsHubRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 18 },
  statCapsulePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statCapsuleText: { fontSize: 12, fontWeight: '600' },
  neonTabsWrapper: { flexDirection: 'row', padding: 4, borderRadius: 14, marginBottom: 16 },
  neonTabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  activeNeonTabItem: { backgroundColor: '#FF5A5F' },
  neonTabText: { fontSize: 12, fontWeight: '700' },
  scrollAreaContainerContent: { paddingBottom: 30 },
  verticalListStack: { gap: 10 },
  neonListItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  listItemLeftRowAlign: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconSelectionWrapper: { justifyContent: 'center', alignItems: 'center' },
  ingredientMainTextText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  completedMutedText: { color: '#94A3B8', textDecorationLine: 'line-through' },
  countBadgeMicro: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  countBadgeMicroText: { fontSize: 11, fontWeight: '700' },
  stepGlowCounterBlock: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stepGlowCounterBlockText: { color: '#FF5A5F', fontWeight: '800', fontSize: 12 },
  recipeInstructionBodyText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 22 },
  neonActionSubmitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#FF5A5F', paddingVertical: 15, borderRadius: 14, marginTop: 8 },
  neonActionSubmitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  videoEmbeddedCardHolder: { width: '100%', borderRadius: 16, overflow: 'hidden', minHeight: 200, justifyContent: 'center', borderWidth: 1 },
  videoMaskClipContainer: { borderRadius: 16, overflow: 'hidden' },
  noVideoPlaceholderArea: { justifyContent: 'center', alignItems: 'center', gap: 6, padding: 30 },
  noVideoPlaceholderText: { fontSize: 13, fontWeight: '600' },
});