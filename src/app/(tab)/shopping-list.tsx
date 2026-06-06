import { useLanguage, LANGUAGE_NAMES } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { translateObject } from '@/lib/google-translate';
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
  View,
  ActivityIndicator,
} from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

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
  const { t, language, isLanguageLoading } = useLanguage();
  const { user } = useAuth();
  const { colors: theme } = useTheme();

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

  const addIngredient = async () => {
    if (!itemName.trim() || !activeList) return;
    
    let finalName = itemName.trim();
    if (language !== 'en') {
      try {
        finalName = await translateObject(finalName, LANGUAGE_NAMES[language] || language);
      } catch (e) {
        console.error('Translation failed for ingredient:', e);
      }
    }
    
    const newItem: IngredientItem = {
      id: Date.now().toString(),
      name: finalName,
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
        body{font-family:Helvetica;padding:40px;color:${theme.text};}
        h1{color:${theme.accent};border-bottom:2px solid ${theme.accent};padding-bottom:10px;}
        .date{color:${theme.textSecondary};font-size:13px;margin-bottom:28px;}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;background:${theme.backgroundElement};padding:10px;border-bottom:2px solid ${theme.border};color:${theme.accent};}
        td{padding:10px;border-bottom:1px solid ${theme.border};}
        .done{color:#aaa;text-decoration:line-through;}
        .footer{margin-top:50px;font-size:11px;color:#aaa;text-align:center;}
      </style></head><body>
        <h1>${list.recipeName}</h1>
        <div class="date">Generated on ${list.createdAt}</div>
        <table>
          <thead><tr><th>Ingredient</th><th>Qty</th><th>Unit</th></tr></thead>
          <tbody>${list.items.map(i => `<tr class="${i.completed ? 'done' : ''}"><td>${i.name}</td><td>${i.amount}</td><td>${i.unit}</td></tr>`).join('')}</tbody>
        </table>
        <div class="footer">CookuBuddy · Made with ❤️</div>
      </body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch { Alert.alert('Error', t('pdf_error')); }
  };

  if (isLanguageLoading) {
    return (
      <View style={[styles.loadingOverlay, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Switching Language...</Text>
      </View>
    );
  }

  if (activeList) {
    const done  = activeList.items.filter(i => i.completed).length;
    const total = activeList.items.length;

    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <View style={[styles.blobTop, { backgroundColor: theme.accentSecondary + '18' }]} />
        <View style={[styles.blobBottom, { backgroundColor: theme.accent + '12' }]} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveList(null)} style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ArrowLeft size={20} color={theme.accent} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>{t('cooking_list')}</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{activeList.recipeName}</Text>
          </View>
          <TouchableOpacity onPress={() => generatePDF(activeList)} style={[styles.iconActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Download size={18} color={theme.accent} />
          </TouchableOpacity>
        </View>

        {total > 0 && (
          <View style={styles.progressWrapper}>
            <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
              <View style={[styles.progressFill, { backgroundColor: theme.success, width: `${(done / total) * 100}%` as any }]} />
            </View>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>{done}/{total} done</Text>
          </View>
        )}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Card style={styles.inputCard}>
            <View style={styles.inputRow}>
              <TextInput
                ref={nameInputRef}
                style={[styles.ingredientInput, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                placeholder="Add ingredient…"
                placeholderTextColor={theme.textSecondary + '80'}
                value={itemName}
                onChangeText={setItemName}
                returnKeyType="next"
                onSubmitEditing={() => amountInputRef.current?.focus()}
              />
              <TextInput
                ref={amountInputRef}
                style={[styles.qtyInput, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                placeholder="Qty"
                placeholderTextColor={theme.textSecondary + '80'}
                value={amount}
                onChangeText={setAmount}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                returnKeyType="done"
                onSubmitEditing={addIngredient}
              />
              <TouchableOpacity onPress={() => setUnitSheet(true)} style={[styles.unitBtn, { backgroundColor: theme.backgroundElement }]}>
                <Text style={[styles.unitBtnText, { color: theme.accent }]}>{unit}</Text>
                <ChevronDown size={12} color={theme.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={addIngredient} style={[styles.addBtn, { backgroundColor: theme.accent }]}>
                <Plus size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.fractionRow}>
              <Text style={[styles.fractionHint, { color: theme.textSecondary }]}>Quick:</Text>
              {FRACTIONS.map(f => (
                <TouchableOpacity key={f} onPress={() => appendFraction(f)} style={[styles.fractionChip, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <Text style={[styles.fractionChipText, { color: theme.accent }]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <FlatList
            data={activeList.items}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.itemsContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.ingredientRow, { backgroundColor: theme.surface, borderColor: theme.border }, item.completed && styles.ingredientRowDone]}>
                <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.checkBtn}>
                  {item.completed
                    ? <CheckCircle2 size={22} color={theme.success} />
                    : <Circle size={22} color={theme.border} />}
                </TouchableOpacity>
                <View style={styles.ingredientTextBlock}>
                  <Text style={[styles.ingredientName, { color: theme.text }, item.completed && styles.strikeName]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.ingredientQty, { color: theme.textSecondary }]}>{item.amount} {item.unit}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteIngredient(item.id)} style={styles.deleteBtn}>
                  <Trash2 size={16} color={theme.error + 'AA'} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <Notebook size={32} color={theme.border} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing here yet</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Add your first ingredient above</Text>
              </View>
            }
          />
        </KeyboardAvoidingView>

        <Modal visible={isUnitSheetVisible} transparent animationType="slide">
          <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setUnitSheet(false)}>
            <Card style={styles.unitSheet}>
              <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Unit</Text>
              <View style={styles.unitGrid}>
                {COMMON_UNITS.map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, { backgroundColor: theme.surface, borderColor: theme.border }, unit === u && { backgroundColor: theme.accent, borderColor: theme.accent }]}
                    onPress={() => { setUnit(u); setUnitSheet(false); }}
                  >
                    <Text style={[styles.unitChipText, { color: theme.text }, unit === u && { color: '#FFFFFF' }]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button variant="outline" title="Close" onPress={() => setUnitSheet(false)} style={{ marginTop: 20 }} />
            </Card>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.blobTop, { backgroundColor: theme.accentSecondary + '18' }]} />
      <View style={[styles.blobBottom, { backgroundColor: theme.accent + '12' }]} />

      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>CHEF'S WORKSPACE</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('cooking_list')}</Text>
        </View>
        <TouchableOpacity onPress={() => setNewListModal(true)} style={[styles.newListPill, { backgroundColor: theme.accent }]}>
          <Plus size={14} color="#FFFFFF" />
          <Text style={styles.newListPillText}>{t('new_list')}</Text>
        </TouchableOpacity>
      </View>

      {lists.length > 0 && (
        <Card style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryVal, { color: theme.accent }]}>{lists.length}</Text>
            <Text style={[styles.summaryLbl, { color: theme.textSecondary }]}>Lists</Text>
          </View>
          <View style={[styles.summaryBox, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
            <Text style={[styles.summaryVal, { color: theme.accent }]}>{lists.reduce((acc, l) => acc + l.items.length, 0)}</Text>
            <Text style={[styles.summaryLbl, { color: theme.textSecondary }]}>Ingredients</Text>
          </View>
          <View style={[styles.summaryBox, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
            <Text style={[styles.summaryVal, { color: theme.accent }]}>{lists.reduce((acc, l) => acc + l.items.filter(i => i.completed).length, 0)}</Text>
            <Text style={[styles.summaryLbl, { color: theme.textSecondary }]}>Checked off</Text>
          </View>
        </Card>
      )}

      <FlatList
        data={lists}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.dashContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const pct = item.items.length > 0 ? item.items.filter(i => i.completed).length / item.items.length : 0;
          return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => setActiveList(item)} style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.listCardTop}>
                <View style={[styles.listCardIconBg, { backgroundColor: theme.accent + '14' }]}>
                  <Notebook size={18} color={theme.accent} />
                </View>
                <Text style={[styles.listCardName, { color: theme.text }]} numberOfLines={1}>{item.recipeName}</Text>
                <TouchableOpacity onPress={() => deleteList(item.id)} style={styles.listCardDelete}>
                  <Trash2 size={15} color={theme.error} />
                </TouchableOpacity>
              </View>
              {item.items.length > 0 && (
                <View style={[styles.miniProgressTrack, { backgroundColor: theme.backgroundElement }]}>
                  <View style={[styles.miniProgressFill, { backgroundColor: theme.success, width: `${pct * 100}%` as any }]} />
                </View>
              )}
              <View style={styles.listCardBottom}>
                <View style={styles.listCardMeta}>
                  <Calendar size={11} color={theme.textSecondary} />
                  <Text style={[styles.listCardDate, { color: theme.textSecondary }]}>{item.createdAt.split(',')[0]}</Text>
                </View>
                <Text style={[styles.listCardCount, { color: theme.accent }]}>{item.items.length} {t('ingredients_plural')}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Notebook size={36} color={theme.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('no_lists_yet')}</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Tap "+ New List" to get started</Text>
          </View>
        }
      />

      <Modal visible={isNewListModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={[styles.modalIconCircle, { backgroundColor: theme.accent + '14' }]}>
              <Notebook size={24} color={theme.accent} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('start_purchase')}</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
              placeholder={t('enter_recipe_name')}
              placeholderTextColor={theme.textSecondary + '80'}
              value={recipeName}
              onChangeText={setRecipeName}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Button variant="outline" title={t('cancel')} onPress={() => setNewListModal(false)} style={{ flex: 1 }} />
              <Button title={t('create_notepad')} onPress={createNewList} style={{ flex: 1.5 }} />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blobTop: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -70 },
  blobBottom: { position: 'absolute', width: 220, height: 220, borderRadius: 110, bottom: -60, left: -50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  iconActionBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, paddingHorizontal: 14 },
  headerLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  newListPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  newListPillText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, padding: 0, overflow: 'hidden' },
  summaryBox: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  summaryLbl: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  dashContent: { paddingHorizontal: 20, paddingBottom: 48 },
  listCard: { borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1 },
  listCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  listCardIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  listCardName: { flex: 1, fontSize: 16, fontWeight: '700' },
  listCardDelete: { padding: 4 },
  miniProgressTrack: { height: 4, borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  miniProgressFill: { height: '100%', borderRadius: 2 },
  listCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  listCardDate: { fontSize: 11, fontWeight: '600' },
  listCardCount: { fontSize: 12, fontWeight: '700' },
  progressWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 12 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, fontWeight: '700', minWidth: 55, textAlign: 'right' },
  inputCard: { marginHorizontal: 20, marginBottom: 16, padding: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ingredientInput: { flex: 1, height: 44, fontSize: 15, fontWeight: '600', borderRadius: 12, paddingHorizontal: 14 },
  qtyInput: { width: 58, height: 44, fontSize: 15, fontWeight: '700', borderRadius: 12, textAlign: 'center' },
  unitBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 44, paddingHorizontal: 10, borderRadius: 12 },
  unitBtnText: { fontSize: 13, fontWeight: '800' },
  addBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  fractionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  fractionHint: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  fractionChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  fractionChipText: { fontSize: 13, fontWeight: '800' },
  itemsContent: { paddingHorizontal: 20, paddingBottom: 60 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  ingredientRowDone: { opacity: 0.6 },
  checkBtn: { marginRight: 12 },
  ingredientTextBlock: { flex: 1 },
  ingredientName: { fontSize: 15, fontWeight: '600' },
  strikeName: { textDecorationLine: 'line-through' },
  ingredientQty: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  deleteBtn: { padding: 6 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingBottom: 60 },
  emptyIconCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  modalCard: { padding: 28, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalIconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 18 },
  modalInput: { width: '100%', height: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 18, fontSize: 15, fontWeight: '600', marginBottom: 24 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  unitSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, width: '100%' },
  sheetHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  unitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  unitChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, minWidth: 64, alignItems: 'center' },
  unitChipText: { fontSize: 13, fontWeight: '700' },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  loadingText: { fontSize: 16, fontWeight: '600' },
});
