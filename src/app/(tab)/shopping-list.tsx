// import { useLanguage } from '@/hooks/use-language';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import {
//   ArrowLeft,
//   Calendar,
//   CheckCircle2,
//   ChevronDown,
//   Circle,
//   Download,
//   Notebook,
//   Plus,
//   Trash2
// } from 'lucide-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Alert,
//   Dimensions,
//   FlatList,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// interface IngredientItem {
//   id: string;
//   name: string;
//   amount: string;
//   unit: string;
//   completed: boolean;
// }

// interface CookingList {
//   id: string;
//   recipeName: string;
//   createdAt: string;
//   items: IngredientItem[];
// }

// const FRACTIONS = ['1/4', '1/2', '3/4'];
// const COMMON_UNITS = [
//   '(g) Gram',
//   '(kg) Kilogram',
//   '(mL) Milliliter',
//   '(L) Liter',
//   '(tsp) Teaspoon',
//   '(tbsp) Tablespoon',
//   '(cup) Cup',
//   '(pcs) Piece',
//   '(doz) Dozen',
//   'Pinch',
//   '(pkt) Packet',
//   '(btl) Bottle',
//   'Can',
//   'Box',
//   'Bag',
//   'Bunch'
// ];
// export default function ShoppingListScreen() {
//   const { colors: theme, isDark } = useTheme();
//   const { t } = useLanguage();
//   const { user } = useAuth();
  
//   const [lists, setLists] = useState<CookingList[]>([]);
//   const [activeList, setActiveList] = useState<CookingList | null>(null);
//   const [isNewListModalVisible, setIsNewListModalVisible] = useState(false);
//   const [isUnitSheetVisible, setIsUnitSheetVisible] = useState(false);
  
//   // Form State
//   const [recipeName, setRecipeName] = useState('');
//   const [itemName, setItemName] = useState('');
//   const [amount, setAmount] = useState('');
//   const [unit, setUnit] = useState('kg');

//   const amountInputRef = useRef<TextInput>(null);
//   const nameInputRef = useRef<TextInput>(null);

//   const storageKey = user ? `cooking_lists_v2_${user.id}` : 'cooking_lists_v2_guest';

//   useEffect(() => {
//     loadLists();
//   }, [user]);

//   const loadLists = async () => {
//     try {
//       const saved = await AsyncStorage.getItem(storageKey);
//       if (saved) setLists(JSON.parse(saved));
//     } catch (e) {
//       console.error('Error loading lists:', e);
//     }
//   };

//   const saveToStorage = async (newLists: CookingList[]) => {
//     try {
//       setLists(newLists);
//       await AsyncStorage.setItem(storageKey, JSON.stringify(newLists));
//     } catch (e) {
//       console.error('Error saving lists:', e);
//     }
//   };

//   const createNewList = () => {
//     if (!recipeName.trim()) {
//       Alert.alert(t('error') || 'Error', t('enter_recipe_name'));
//       return;
//     }
//     const newList: CookingList = {
//       id: Date.now().toString(),
//       recipeName: recipeName.trim(),
//       createdAt: new Date().toLocaleString(),
//       items: []
//     };
//     const updatedLists = [newList, ...lists];
//     saveToStorage(updatedLists);
//     setRecipeName('');
//     setIsNewListModalVisible(false);
//     setActiveList(newList);
//   };

//   const deleteList = (id: string) => {
//     Alert.alert(
//       t('clear_confirm_title'),
//       t('delete_list_confirm'),
//       [
//         { text: t('cancel'), style: "cancel" },
//         { text: t('delete_all'), style: "destructive", onPress: () => {
//           const updatedLists = lists.filter(l => l.id !== id);
//           saveToStorage(updatedLists);
//           if (activeList?.id === id) setActiveList(null);
//         }}
//       ]
//     );
//   };

//   const addIngredient = () => {
//     if (!itemName.trim() || !activeList) return;
//     const newItem: IngredientItem = {
//       id: Date.now().toString(),
//       name: itemName.trim(),
//       amount: amount || '1',
//       unit: unit,
//       completed: false,
//     };
    
//     const updatedActive = { ...activeList, items: [newItem, ...activeList.items] };
//     const updatedLists = lists.map(l => l.id === activeList.id ? updatedActive : l);
    
//     setActiveList(updatedActive);
//     saveToStorage(updatedLists);
//     setItemName('');
//     setAmount('');
    
//     // Focus back to product name for next item
//     setTimeout(() => { nameInputRef.current?.focus(); }, 100);
//   };

//   const handleFractionSelect = (fraction: string) => {
//     // If quantity is like "1", make it "1 1/2"
//     // If quantity is empty, make it "1/2"
//     const current = amount.trim();
//     if (current.includes(fraction)) return;
//     const newAmount = current ? `${current} ${fraction}` : fraction;
//     setAmount(newAmount);
//   };

//   const toggleItem = (itemId: string) => {
//     if (!activeList) return;
//     const updatedItems = activeList.items.map(item => 
//       item.id === itemId ? { ...item, completed: !item.completed } : item
//     );
//     const updatedActive = { ...activeList, items: updatedItems };
//     const updatedLists = lists.map(l => l.id === activeList.id ? updatedActive : l);
//     setActiveList(updatedActive);
//     saveToStorage(updatedLists);
//   };

//   const deleteIngredient = (itemId: string) => {
//     if (!activeList) return;
//     const updatedItems = activeList.items.filter(item => item.id !== itemId);
//     const updatedActive = { ...activeList, items: updatedItems };
//     const updatedLists = lists.map(l => l.id === activeList.id ? updatedActive : l);
//     setActiveList(updatedActive);
//     saveToStorage(updatedLists);
//   };

//   const generatePDF = async (list: CookingList) => {
//     if (list.items.length === 0) {
//       Alert.alert(t('list_empty'), t('add_before_pdf'));
//       return;
//     }

//     const htmlContent = `
//       <html>
//         <head>
//           <style>
//             body { font-family: 'Helvetica'; padding: 40px; color: #333; }
//             h1 { color: #8B4513; border-bottom: 2px solid #8B4513; padding-bottom: 10px; margin-bottom: 5px; }
//             .date { color: #666; font-size: 14px; margin-bottom: 30px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th { text-align: left; background-color: #f8f9fa; padding: 12px; border-bottom: 2px solid #dee2e6; color: #8B4513; }
//             td { padding: 12px; border-bottom: 1px solid #dee2e6; font-size: 16px; }
//             .completed { color: #888; text-decoration: line-through; }
//             .footer { margin-top: 50px; font-size: 12px; color: #AAA; text-align: center; }
//           </style>
//         </head>
//         <body>
//           <h1>${list.recipeName}</h1>
//           <div class="date">Generated on ${list.createdAt}</div>
//           <table>
//             <thead><tr><th>Product</th><th>Qty</th><th>Measure</th></tr></thead>
//             <tbody>
//               ${list.items.map(item => `<tr class="${item.completed ? 'completed' : ''}"><td>${item.name}</td><td>${item.amount}</td><td>${item.unit}</td></tr>`).join('')}
//             </tbody>
//           </table>
//           <div class="footer">CookuBuddy - Your Digital Kitchen Assistant</div>
//         </body>
//       </html>
//     `;

//     try {
//       const { uri } = await Print.printToFileAsync({ html: htmlContent });
//       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//     } catch (e) {
//       Alert.alert("Error", t('pdf_error'));
//     }
//   };

//   // Adaptive Colors
//   const paperColor = isDark ? '#1E1E1E' : '#FFF9C4';
//   const textColor = isDark ? '#E2E8F0' : '#4E342E';
//   const lineSecondary = isDark ? '#334155' : '#B3E5FC';
//   const linePrimary = isDark ? '#EF4444' : '#FFCDD2';
//   const woodDark = isDark ? '#0F172A' : '#5D4037';

//   if (activeList) {
//     return (
//       <View style={[styles.container, { backgroundColor: woodDark }]}>
//         {/* REFINED ALIGNED HEADER */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => setActiveList(null)} style={styles.backBtn}>
//             <ArrowLeft size={22} color="#FFF" />
//           </TouchableOpacity>
//           <View style={styles.headerTitleContainer}>
//             <Text style={styles.headerRecipeLabel}>{t('cooking_list')}</Text>
//             <Text style={styles.headerRecipeName} numberOfLines={1}>{activeList.recipeName}</Text>
//           </View>
//           <TouchableOpacity onPress={() => generatePDF(activeList)} style={styles.downloadBtn}>
//             <Download size={22} color="#FFF" />
//           </TouchableOpacity>
//         </View>

//         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
//           <View style={[styles.notepadContainer, { backgroundColor: paperColor, borderColor: isDark ? '#334155' : '#E0E0E0' }]}>
//             <View style={[styles.redLine, { backgroundColor: linePrimary }]} />
            
//             <View style={[styles.inputSection, { borderBottomColor: lineSecondary }]}>
//               {/* TOP ROW: PRODUCT & QTY */}
//               <View style={styles.inputMainRow}>
//                 <TextInput
//                   ref={nameInputRef}
//                   style={[styles.productInput, { color: textColor, borderRightColor: lineSecondary }]}
//                   placeholder={t('type_ingredient')}
//                   placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
//                   value={itemName}
//                   onChangeText={setItemName}
//                   returnKeyType="next"
//                   onSubmitEditing={() => amountInputRef.current?.focus()}
//                 />
//                 <TextInput
//                   ref={amountInputRef}
//                   style={[styles.qtyInputField, { color: textColor, borderRightColor: lineSecondary }]}
//                   placeholder="Qty"
//                   placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
//                   value={amount}
//                   onChangeText={setAmount}
//                   keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
//                   returnKeyType="done"
//                   onSubmitEditing={addIngredient}
//                 />
//                 <TouchableOpacity onPress={() => setIsUnitSheetVisible(true)} style={styles.unitTrigger}>
//                   <Text style={[styles.unitTriggerText, { color: theme.accent }]}>{unit}</Text>
//                   <ChevronDown size={14} color={theme.accent} />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={addIngredient} style={[styles.submitBtn, { backgroundColor: theme.accent }]}>
//                   <Plus size={20} color="#FFF" />
//                 </TouchableOpacity>
//               </View>

//               {/* BOTTOM ROW: FRACTION SELECTOR */}
//               <View style={styles.fractionRow}>
//                 <Text style={[styles.fractionLabel, { color: isDark ? '#475569' : '#8D6E63' }]}>Quick Add:</Text>
//                 {FRACTIONS.map(f => (
//                   <TouchableOpacity key={f} onPress={() => handleFractionSelect(f)} style={[styles.fractionBtn, { borderColor: theme.accent + '30' }]}>
//                     <Text style={[styles.fractionText, { color: theme.accent }]}>{f}</Text>
//                   </TouchableOpacity>
//                 ))}
//                 <View style={{ flex: 1 }} />
//               </View>
//             </View>

//             <FlatList
//               data={activeList.items}
//               keyExtractor={item => item.id}
//               renderItem={({ item }) => (
//                 <View style={[styles.listItem, { borderBottomColor: lineSecondary }]}>
//                   <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.itemLeft}>
//                     {item.completed ? (
//                       <CheckCircle2 size={22} color="#10B981" />
//                     ) : (
//                       <Circle size={22} color={isDark ? '#334155' : '#CBD5E1'} />
//                     )}
//                     <View style={styles.itemTextContainer}>
//                       <Text style={[styles.itemProductName, { color: textColor }, item.completed && styles.completedText]}>{item.name}</Text>
//                       <Text style={[styles.itemQuantityLabel, { color: isDark ? '#64748B' : '#8D6E63' }]}>{item.amount} {item.unit}</Text>
//                     </View>
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={() => deleteIngredient(item.id)} style={styles.itemDeleteBtn}>
//                     <Trash2 size={18} color="#EF4444" />
//                   </TouchableOpacity>
//                 </View>
//               )}
//               contentContainerStyle={styles.listPadding}
//               ListEmptyComponent={
//                 <View style={styles.emptyContainer}>
//                   <Notebook size={40} color={isDark ? '#334155' : '#CBD5E1'} />
//                   <Text style={[styles.emptyText, { color: isDark ? '#475569' : '#8D6E63' }]}>{t('empty_notepad')}</Text>
//                 </View>
//               }
//             />
//           </View>
//         </KeyboardAvoidingView>

//         {/* UNIT SELECTION BOTTOM SHEET */}
//         <Modal visible={isUnitSheetVisible} transparent animationType="slide">
//           <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setIsUnitSheetVisible(false)}>
//             <View style={[styles.unitSheet, { backgroundColor: theme.cardBg }]}>
//               <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
//               <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Measurement</Text>
//               <View style={styles.unitGrid}>
//                 {COMMON_UNITS.map(u => (
//                   <TouchableOpacity 
//                     key={u} 
//                     style={[styles.unitGridItem, unit === u && { backgroundColor: theme.accent, borderColor: theme.accent }]}
//                     onPress={() => { setUnit(u); setIsUnitSheetVisible(false); }}
//                   >
//                     <Text style={[styles.unitGridText, { color: theme.text }, unit === u && { color: '#FFF', fontWeight: '800' }]}>{u}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <TouchableOpacity onPress={() => setIsUnitSheetVisible(false)} style={[styles.sheetCloseBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
//                 <Text style={[styles.sheetCloseText, { color: theme.textSecondary }]}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         </Modal>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* DASHBOARD HEADER */}
//       <View style={[styles.dashboardHeader, { borderBottomColor: theme.border }]}>
//         <View>
//           <Text style={[styles.dashboardSub, { color: theme.textSecondary }]}>Chef's Workspace</Text>
//           <Text style={[styles.dashboardTitle, { color: theme.text }]}>{t('cooking_list')}</Text>
//         </View>
//         <TouchableOpacity style={[styles.newListBtn, { backgroundColor: theme.accent }]} onPress={() => setIsNewListModalVisible(true)}>
//           <Plus size={20} color="#FFF" />
//           <Text style={styles.newListBtnText}>{t('new_list')}</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={lists}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.dashboardListPadding}
//         renderItem={({ item }) => (
//           <TouchableOpacity activeOpacity={0.8} onPress={() => setActiveList(item)} style={[styles.recipeCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//             <View style={styles.recipeCardTop}>
//               <View style={[styles.recipeIconBg, { backgroundColor: theme.accent + '15' }]}><Notebook size={18} color={theme.accent} /></View>
//               <Text style={[styles.recipeCardName, { color: theme.text }]} numberOfLines={1}>{item.recipeName}</Text>
//               <TouchableOpacity onPress={() => deleteList(item.id)}><Trash2 size={16} color="#EF4444" /></TouchableOpacity>
//             </View>
//             <View style={styles.recipeCardBottom}>
//               <View style={styles.recipeCardMeta}><Calendar size={12} color={theme.textSecondary} /><Text style={[styles.recipeCardDate, { color: theme.textSecondary }]}>{item.createdAt.split(',')[0]}</Text></View>
//               <Text style={[styles.recipeCardCount, { color: theme.accent }]}>{item.items.length} {t('ingredients_plural')} </Text>
//             </View>
//           </TouchableOpacity>
//         )}
//         ListEmptyComponent={
//           <View style={styles.dashboardEmpty}>
//             <Notebook size={64} color={theme.border} />
//             <Text style={[styles.dashboardEmptyText, { color: theme.textSecondary }]}>{t('no_lists_yet')}</Text>
//           </View>
//         }
//       />

//       <Modal visible={isNewListModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={[styles.creationModal, { backgroundColor: theme.cardBg }]}>
//             <Text style={[styles.modalTitle, { color: theme.text }]}>{t('start_purchase')}</Text>
//             <TextInput style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} placeholder={t('enter_recipe_name')} placeholderTextColor={theme.textSecondary} value={recipeName} onChangeText={setRecipeName} autoFocus />
//             <View style={styles.modalActionRow}>
//               <TouchableOpacity onPress={() => setIsNewListModalVisible(false)} style={[styles.modalBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}><Text style={{ color: theme.textSecondary }}>{t('cancel')}</Text></TouchableOpacity>
//               <TouchableOpacity onPress={createNewList} style={[styles.newListSubmit, { backgroundColor: theme.accent }]}><Text style={styles.newListSubmitText}>{t('create_notepad')}</Text></TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
//   headerTitleContainer: { flex: 1, paddingHorizontal: 16 },
//   headerRecipeLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
//   headerRecipeName: { fontSize: 20, fontWeight: '900', color: '#FFF' },
//   downloadBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
//   content: { flex: 1, padding: 16, paddingBottom: 30 },
//   notepadContainer: { flex: 0, borderRadius: 28, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, overflow: 'hidden', borderWidth: 1 , height:"95%" },
//   redLine: { position: 'absolute', left: 45, top: 0, bottom: 0, width: 2, zIndex: 0 },
//   inputSection: { paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, zIndex: 1 },
//   inputMainRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 35 },
//   productInput: { flex: 1, height: 48, fontSize: 16, fontWeight: '600', paddingHorizontal: 12, borderRightWidth: 1 },
//   qtyInputField: { width: 70, height: 48, fontSize: 16, fontWeight: '700', textAlign: 'center', borderRightWidth: 1 },
//   unitTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 48 },
//   unitTriggerText: { fontSize: 14, fontWeight: '800' },
//   submitBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
//   fractionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 50, marginTop: 12 },
//   fractionLabel: { fontSize: 11, fontWeight: '700' },
//   fractionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
//   fractionText: { fontSize: 12, fontWeight: '800' },
//   measureHelper: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
//   measureHelperText: { fontSize: 12, fontWeight: '700' },
//   listPadding: { paddingLeft: 60, paddingRight: 20, paddingBottom: 100, paddingTop: 12 },
//   listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
//   itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 15 },
//   itemTextContainer: { flex: 1 },
//   itemProductName: { fontSize: 16, fontWeight: '600' },
//   itemQuantityLabel: { fontSize: 12, fontWeight: '700', marginTop: 3 },
//   completedText: { textDecorationLine: 'line-through', opacity: 0.4 },
//   itemDeleteBtn: { padding: 6 },
//   emptyContainer: { paddingTop: 120, alignItems: 'center', opacity: 0.4 },
//   emptyText: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  
//   // Dashboard Styles
//   dashboardHeader: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
//   dashboardSub: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
//   dashboardTitle: { fontSize: 28, fontWeight: '900' },
//   newListBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 22, elevation: 4 },
//   newListBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
//   dashboardListPadding: { padding: 20, paddingBottom: 100 },
//   recipeCard: { borderRadius: 24, padding: 20, marginBottom: 18, borderWidth: 1, elevation: 3 },
//   recipeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
//   recipeIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
//   recipeCardName: { fontSize: 18, fontWeight: '800', flex: 1 },
//   recipeCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   recipeCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   recipeCardDate: { fontSize: 12, fontWeight: '600' },
//   recipeCardCount: { fontSize: 13, fontWeight: '800' },
//   dashboardEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 150, opacity: 0.3 },
//   dashboardEmptyText: { fontSize: 18, fontWeight: '700', marginTop: 20 },

//   // Modal & Sheet Styles
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
//   creationModal: { width: '100%', maxWidth: 340, borderRadius: 32, padding: 28 },
//   modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
//   modalInput: { height: 56, borderRadius: 18, borderWidth: 1, paddingHorizontal: 20, fontSize: 16, marginBottom: 24, fontWeight: '600' },
//   modalActionRow: { flexDirection: 'row', gap: 12 },
//   modalBtn: { flex: 1, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
//   newListSubmit: { flex: 1.5, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
//   newListSubmitText: { color: '#FFF', fontWeight: '700' },
  
//   sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   unitSheet: { width: '100%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
//   sheetHandle: { width: 40, height: 5, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
//   sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 24, textAlign: 'center' },
//   unitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
//   unitGridItem: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', minWidth: 80, alignItems: 'center' },
//   unitGridText: { fontSize: 14, fontWeight: '600' },
//   sheetCloseBtn: { marginTop: 24, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
//   sheetCloseText: { fontSize: 15, fontWeight: '700' }
// });



import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Download,
  Notebook,
  Plus,
  Trash2,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IngredientItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  completed: boolean;
}

interface CookingList {
  id: string;
  recipeName: string;
  createdAt: string;
  items: IngredientItem[];
}

const FRACTIONS    = ['¼', '½', '¾', '⅓', '⅔'];
const COMMON_UNITS = [
  'g', 'kg', 'mL', 'L', 'tsp', 'tbsp', 'cup',
  'pcs', 'doz', 'pinch', 'pkt', 'btl', 'can', 'box', 'bag', 'bunch',
];

export default function ShoppingListScreen() {
  const { t }    = useLanguage();
  const { user } = useAuth();

  const [lists, setLists]                         = useState<CookingList[]>([]);
  const [activeList, setActiveList]               = useState<CookingList | null>(null);
  const [isNewListModalVisible, setNewListModal]  = useState(false);
  const [isUnitSheetVisible, setUnitSheet]        = useState(false);

  const [recipeName, setRecipeName] = useState('');
  const [itemName, setItemName]     = useState('');
  const [amount, setAmount]         = useState('');
  const [unit, setUnit]             = useState('g');

  const amountInputRef = useRef<TextInput>(null);
  const nameInputRef   = useRef<TextInput>(null);

  const storageKey = user ? `cooking_lists_v2_${user.id}` : 'cooking_lists_v2_guest';

  useEffect(() => { loadLists(); }, [user]);

  const loadLists = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) setLists(JSON.parse(saved));
    } catch (e) { console.error(e); }
  };

  const persist = async (next: CookingList[]) => {
    setLists(next);
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(next)); } catch (e) { console.error(e); }
  };

  const createNewList = () => {
    if (!recipeName.trim()) { Alert.alert('Error', t('enter_recipe_name')); return; }
    const newList: CookingList = {
      id: Date.now().toString(),
      recipeName: recipeName.trim(),
      createdAt: new Date().toLocaleString(),
      items: [],
    };
    persist([newList, ...lists]);
    setRecipeName('');
    setNewListModal(false);
    setActiveList(newList);
  };

  const deleteList = (id: string) => {
    Alert.alert(t('clear_confirm_title'), t('delete_list_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete_all'), style: 'destructive', onPress: () => {
        persist(lists.filter(l => l.id !== id));
        if (activeList?.id === id) setActiveList(null);
      }},
    ]);
  };

  const addIngredient = () => {
    if (!itemName.trim() || !activeList) return;
    const newItem: IngredientItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      amount: amount || '1',
      unit,
      completed: false,
    };
    const updated = { ...activeList, items: [newItem, ...activeList.items] };
    const next    = lists.map(l => l.id === activeList.id ? updated : l);
    setActiveList(updated);
    persist(next);
    setItemName('');
    setAmount('');
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const appendFraction = (f: string) => {
    const cur = amount.trim();
    setAmount(cur ? `${cur} ${f}` : f);
  };

  const toggleItem = (itemId: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
    const updated = { ...activeList, items: updatedItems };
    setActiveList(updated);
    persist(lists.map(l => l.id === activeList.id ? updated : l));
  };

  const deleteIngredient = (itemId: string) => {
    if (!activeList) return;
    const updated = { ...activeList, items: activeList.items.filter(i => i.id !== itemId) };
    setActiveList(updated);
    persist(lists.map(l => l.id === activeList.id ? updated : l));
  };

  const generatePDF = async (list: CookingList) => {
    if (list.items.length === 0) { Alert.alert(t('list_empty'), t('add_before_pdf')); return; }
    const html = `
      <html><head><style>
        body{font-family:Helvetica;padding:40px;color:#2C1A0E;}
        h1{color:#C1440E;border-bottom:2px solid #C1440E;padding-bottom:10px;}
        .date{color:#7A5C46;font-size:13px;margin-bottom:28px;}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;background:#F5EBD8;padding:10px;border-bottom:2px solid #E2CEB0;color:#C1440E;}
        td{padding:10px;border-bottom:1px solid #E2CEB0;}
        .done{color:#aaa;text-decoration:line-through;}
        .footer{margin-top:50px;font-size:11px;color:#aaa;text-align:center;}
      </style></head><body>
        <h1>${list.recipeName}</h1>
        <div class="date">Generated on ${list.createdAt}</div>
        <table>
          <thead><tr><th>Ingredient</th><th>Qty</th><th>Unit</th></tr></thead>
          <tbody>${list.items.map(i => `<tr class="${i.completed ? 'done' : ''}"><td>${i.name}</td><td>${i.amount}</td><td>${i.unit}</td></tr>`).join('')}</tbody>
        </table>
        <div class="footer">CookuBuddy · Made with 🍅</div>
      </body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch { Alert.alert('Error', t('pdf_error')); }
  };

  // ─── Active List View ────────────────────────────────────────────
  if (activeList) {
    const done  = activeList.items.filter(i => i.completed).length;
    const total = activeList.items.length;

    return (
      <View style={styles.root}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveList(null)} style={styles.backBtn}>
            <ArrowLeft size={20} color={C.terra} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>COOKING LIST</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{activeList.recipeName}</Text>
          </View>
          <TouchableOpacity onPress={() => generatePDF(activeList)} style={styles.iconActionBtn}>
            <Download size={18} color={C.terra} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        {total > 0 && (
          <View style={styles.progressWrapper}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(done / total) * 100}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>{done}/{total} done</Text>
          </View>
        )}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          {/* Input card */}
          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <TextInput
                ref={nameInputRef}
                style={styles.ingredientInput}
                placeholder="Add ingredient…"
                placeholderTextColor={C.inkLight + '80'}
                value={itemName}
                onChangeText={setItemName}
                returnKeyType="next"
                onSubmitEditing={() => amountInputRef.current?.focus()}
              />
              <TextInput
                ref={amountInputRef}
                style={styles.qtyInput}
                placeholder="Qty"
                placeholderTextColor={C.inkLight + '80'}
                value={amount}
                onChangeText={setAmount}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                returnKeyType="done"
                onSubmitEditing={addIngredient}
              />
              <TouchableOpacity onPress={() => setUnitSheet(true)} style={styles.unitBtn}>
                <Text style={styles.unitBtnText}>{unit}</Text>
                <ChevronDown size={12} color={C.terra} />
              </TouchableOpacity>
              <TouchableOpacity onPress={addIngredient} style={styles.addBtn}>
                <Plus size={18} color={C.white} />
              </TouchableOpacity>
            </View>

            {/* Fraction helpers */}
            <View style={styles.fractionRow}>
              <Text style={styles.fractionHint}>Quick:</Text>
              {FRACTIONS.map(f => (
                <TouchableOpacity key={f} onPress={() => appendFraction(f)} style={styles.fractionChip}>
                  <Text style={styles.fractionChipText}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Items list */}
          <FlatList
            data={activeList.items}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.itemsContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.ingredientRow, item.completed && styles.ingredientRowDone]}>
                <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.checkBtn}>
                  {item.completed
                    ? <CheckCircle2 size={22} color={C.sage} />
                    : <Circle size={22} color={C.border} />}
                </TouchableOpacity>
                <View style={styles.ingredientTextBlock}>
                  <Text style={[styles.ingredientName, item.completed && styles.strikeName]}>
                    {item.name}
                  </Text>
                  <Text style={styles.ingredientQty}>{item.amount} {item.unit}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteIngredient(item.id)} style={styles.deleteBtn}>
                  <Trash2 size={16} color={C.errorRed + 'AA'} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Notebook size={32} color={C.border} />
                </View>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptySubtitle}>Add your first ingredient above</Text>
              </View>
            }
          />
        </KeyboardAvoidingView>

        {/* Unit bottom sheet */}
        <Modal visible={isUnitSheetVisible} transparent animationType="slide">
          <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setUnitSheet(false)}>
            <View style={styles.unitSheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Select Unit</Text>
              <View style={styles.unitGrid}>
                {COMMON_UNITS.map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => { setUnit(u); setUnitSheet(false); }}
                  >
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setUnitSheet(false)} style={styles.sheetCloseBtn}>
                <Text style={styles.sheetCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // ─── Dashboard View ──────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Dashboard Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>CHEF'S WORKSPACE</Text>
          <Text style={styles.headerTitle}>{t('cooking_list')}</Text>
        </View>
        <TouchableOpacity onPress={() => setNewListModal(true)} style={styles.newListPill}>
          <Plus size={14} color={C.white} />
          <Text style={styles.newListPillText}>{t('new_list')}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats summary */}
      {lists.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>{lists.length}</Text>
            <Text style={styles.summaryLbl}>Lists</Text>
          </View>
          <View style={[styles.summaryBox, { borderLeftWidth: 1, borderLeftColor: C.border }]}>
            <Text style={styles.summaryVal}>{lists.reduce((acc, l) => acc + l.items.length, 0)}</Text>
            <Text style={styles.summaryLbl}>Ingredients</Text>
          </View>
          <View style={[styles.summaryBox, { borderLeftWidth: 1, borderLeftColor: C.border }]}>
            <Text style={styles.summaryVal}>{lists.reduce((acc, l) => acc + l.items.filter(i => i.completed).length, 0)}</Text>
            <Text style={styles.summaryLbl}>Checked off</Text>
          </View>
        </View>
      )}

      <FlatList
        data={lists}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.dashContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const pct = item.items.length > 0
            ? item.items.filter(i => i.completed).length / item.items.length
            : 0;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveList(item)}
              style={styles.listCard}
            >
              <View style={styles.listCardTop}>
                <View style={styles.listCardIconBg}>
                  <Notebook size={18} color={C.terra} />
                </View>
                <Text style={styles.listCardName} numberOfLines={1}>{item.recipeName}</Text>
                <TouchableOpacity onPress={() => deleteList(item.id)} style={styles.listCardDelete}>
                  <Trash2 size={15} color={C.errorRed} />
                </TouchableOpacity>
              </View>

              {/* Mini progress bar */}
              {item.items.length > 0 && (
                <View style={styles.miniProgressTrack}>
                  <View style={[styles.miniProgressFill, { width: `${pct * 100}%` as any }]} />
                </View>
              )}

              <View style={styles.listCardBottom}>
                <View style={styles.listCardMeta}>
                  <Calendar size={11} color={C.inkLight} />
                  <Text style={styles.listCardDate}>{item.createdAt.split(',')[0]}</Text>
                </View>
                <Text style={styles.listCardCount}>
                  {item.items.length} {t('ingredients_plural')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Notebook size={36} color={C.border} />
            </View>
            <Text style={styles.emptyTitle}>{t('no_lists_yet')}</Text>
            <Text style={styles.emptySubtitle}>Tap "+ New List" to get started</Text>
          </View>
        }
      />

      {/* New list modal */}
      <Modal visible={isNewListModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Notebook size={24} color={C.terra} />
            </View>
            <Text style={styles.modalTitle}>{t('start_purchase')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('enter_recipe_name')}
              placeholderTextColor={C.inkLight + '80'}
              value={recipeName}
              onChangeText={setRecipeName}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setNewListModal(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createNewList} style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>{t('create_notepad')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // ── Header ──────────────────────────────────────────────────────
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
  iconActionBtn: {
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
  newListPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.terra, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20,
    shadowColor: C.terra, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  newListPillText: { color: C.white, fontSize: 13, fontWeight: '800' },

  // ── Stats summary ────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: C.white, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  summaryBox: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
  },
  summaryVal: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.terra, marginBottom: 2,
  },
  summaryLbl: { fontSize: 10, fontWeight: '700', color: C.inkLight, letterSpacing: 0.5 },

  // ── Dashboard list ───────────────────────────────────────────────
  dashContent: { paddingHorizontal: 20, paddingBottom: 48 },

  listCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  listCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  listCardIconBg: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.terra + '14',
    justifyContent: 'center', alignItems: 'center',
  },
  listCardName: { flex: 1, fontSize: 16, fontWeight: '700', color: C.ink },
  listCardDelete: { padding: 4 },

  miniProgressTrack: {
    height: 4, backgroundColor: C.parchment, borderRadius: 2, marginBottom: 12, overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%', backgroundColor: C.sage, borderRadius: 2,
  },

  listCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  listCardDate: { fontSize: 11, fontWeight: '600', color: C.inkLight },
  listCardCount: { fontSize: 12, fontWeight: '700', color: C.terra },

  // ── Active list — progress bar ───────────────────────────────────
  progressWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, marginBottom: 12,
  },
  progressTrack: {
    flex: 1, height: 6, backgroundColor: C.parchment, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: C.sage, borderRadius: 3,
  },
  progressLabel: { fontSize: 11, fontWeight: '700', color: C.inkLight, minWidth: 55, textAlign: 'right' },

  // ── Input card ───────────────────────────────────────────────────
  inputCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: C.white, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    padding: 16,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ingredientInput: {
    flex: 1, height: 44, fontSize: 15, fontWeight: '600', color: C.ink,
    backgroundColor: C.parchment, borderRadius: 12, paddingHorizontal: 14,
  },
  qtyInput: {
    width: 58, height: 44, fontSize: 15, fontWeight: '700', color: C.ink,
    backgroundColor: C.parchment, borderRadius: 12, textAlign: 'center',
  },
  unitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    height: 44, paddingHorizontal: 10,
    backgroundColor: C.parchment, borderRadius: 12,
  },
  unitBtnText: { fontSize: 13, fontWeight: '800', color: C.terra },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: C.terra, justifyContent: 'center', alignItems: 'center',
    shadowColor: C.terra, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },

  fractionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  fractionHint: { fontSize: 10, fontWeight: '700', color: C.inkLight, letterSpacing: 0.5 },
  fractionChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    backgroundColor: C.parchment, borderWidth: 1, borderColor: C.border,
  },
  fractionChipText: { fontSize: 13, fontWeight: '800', color: C.terra },

  // ── Ingredient rows ──────────────────────────────────────────────
  itemsContent: { paddingHorizontal: 20, paddingBottom: 60 },

  ingredientRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  ingredientRowDone: { opacity: 0.6 },
  checkBtn: { marginRight: 12 },
  ingredientTextBlock: { flex: 1 },
  ingredientName: { fontSize: 15, fontWeight: '600', color: C.ink },
  strikeName: { textDecorationLine: 'line-through', color: C.inkLight },
  ingredientQty: { fontSize: 12, fontWeight: '600', color: C.inkLight, marginTop: 2 },
  deleteBtn: { padding: 6 },

  // ── Empty state ──────────────────────────────────────────────────
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingBottom: 60,
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

  // ── New List Modal ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(44,26,14,0.45)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: C.cream, borderRadius: 28, padding: 28,
    width: '100%', maxWidth: 340, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  modalIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.terra + '14',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700',
    color: C.ink, marginBottom: 18,
  },
  modalInput: {
    width: '100%', height: 50, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, backgroundColor: C.white,
    paddingHorizontal: 18, fontSize: 15, fontWeight: '600', color: C.ink,
    marginBottom: 24,
  },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1, height: 48, borderRadius: 14, backgroundColor: C.parchment,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: C.inkLight },
  modalConfirmBtn: {
    flex: 1, height: 48, borderRadius: 14, backgroundColor: C.terra,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.terra, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: C.white },

  // ── Unit sheet ───────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(44,26,14,0.45)', justifyContent: 'flex-end',
  },
  unitSheet: {
    backgroundColor: C.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: C.border,
  },
  sheetHandle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700',
    color: C.ink, textAlign: 'center', marginBottom: 20,
  },
  unitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  unitChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    minWidth: 64, alignItems: 'center',
  },
  unitChipActive: { backgroundColor: C.terra, borderColor: C.terra },
  unitChipText: { fontSize: 13, fontWeight: '700', color: C.ink },
  unitChipTextActive: { color: C.white },
  sheetCloseBtn: {
    marginTop: 20, height: 50, borderRadius: 14,
    backgroundColor: C.parchment, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  sheetCloseBtnText: { fontSize: 14, fontWeight: '700', color: C.inkLight },
});