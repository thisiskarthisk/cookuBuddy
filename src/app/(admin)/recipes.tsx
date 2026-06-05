// /**
//  * Admin Recipe Management Screen
//  * List and manage all recipes in the system.
//  * Updated to use GitHub as the data source with local Edit/Delete capability.
//  */

// import { useTheme } from '@/hooks/use-theme';
// import { getRecipeImageUrl } from '@/lib/images';
// import { fetchAllRecipes, Recipe } from '@/lib/github-data';
// import { Search, Plus, MoreVertical, Clock, Flame, Edit2, Trash2, X } from 'lucide-react-native';
// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Alert,
//   Modal,
//   ScrollView,
// } from 'react-native';

// export default function RecipeManagement() {
//   const { colors } = useTheme();
//   const [recipes, setRecipes] = useState<Recipe[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Edit Modal State
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
//   const [editTitle, setEditTitle] = useState('');
//   const [editDesc, setEditDescription] = useState('');

//   const fetchRecipes = async (force = false) => {
//     try {
//       setLoading(true);
//       const data = await fetchAllRecipes(force);
//       setRecipes(data || []);
//     } catch (e) {
//       console.error('Error fetching recipes:', e);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchRecipes();
//   }, []);

//   const filteredRecipes = useMemo(() => {
//     return recipes.filter(r => 
//       r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//       r.description.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [recipes, searchQuery]);

//   const handleDelete = (sr_no: number) => {
//     Alert.alert(
//       'Delete Recipe',
//       'Are you sure you want to remove this recipe from the list? (Note: This only affects the current session)',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Delete', 
//           style: 'destructive',
//           onPress: () => {
//             setRecipes(prev => prev.filter(r => r.sr_no !== sr_no));
//           }
//         }
//       ]
//     );
//   };

//   const handleEdit = (recipe: Recipe) => {
//     setEditingRecipe(recipe);
//     setEditTitle(recipe.title);
//     setEditDescription(recipe.description);
//     setEditModalVisible(true);
//   };

//   const saveEdit = () => {
//     if (!editingRecipe) return;
    
//     setRecipes(prev => prev.map(r => 
//       r.sr_no === editingRecipe.sr_no 
//         ? { ...r, title: editTitle, description: editDesc } 
//         : r
//     ));
//     setEditModalVisible(false);
//     setEditingRecipe(null);
//   };

//   const renderRecipeItem = ({ item }: { item: Recipe }) => (
//     <View style={[styles.recipeCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//       <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.recipeImage} />
//       <View style={styles.recipeInfo}>
//         <View style={styles.recipeHeader}>
//           <Text style={[styles.recipeName, { color: colors.text }]} numberOfLines={1}>
//             {item.title}
//           </Text>
//           <View style={styles.actionButtons}>
//             <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
//               <Edit2 size={16} color={colors.accent} />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleDelete(item.sr_no)} style={styles.iconBtn}>
//               <Trash2 size={16} color="#EF4444" />
//             </TouchableOpacity>
//           </View>
//         </View>
        
//         <View style={styles.recipeMeta}>
//           <View style={styles.metaItem}>
//             <Clock size={12} color={colors.textSecondary} />
//             <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.cooking_time}m</Text>
//           </View>
//           <View style={styles.metaItem}>
//             <Flame size={12} color={colors.textSecondary} />
//             <Text style={[styles.metaText, { color: colors.textSecondary }]}>
//               {item.tags['special-consideration']?.includes('Vegetarian') ? 'Veg' : 'Non-Veg'}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.recipeFooter}>
//           <Text style={[styles.dateText, { color: colors.textSecondary }]}>
//             SR No: {item.sr_no}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <View style={styles.titleRow}>
//           <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Recipes</Text>
//           <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent }]} onPress={() => fetchRecipes(true)}>
//             <Text style={styles.addButtonText}>Refresh GitHub</Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//           <Search size={20} color={colors.textSecondary} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.text }]}
//             placeholder="Search recipes..."
//             placeholderTextColor={colors.textSecondary}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>
//       </View>

//       {loading && !refreshing ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={colors.accent} />
//         </View>
//       ) : (
//         <FlatList
//           data={filteredRecipes}
//           renderItem={renderRecipeItem}
//           keyExtractor={item => item.sr_no.toString()}
//           contentContainerStyle={styles.listPadding}
//           showsVerticalScrollIndicator={false}
//           onRefresh={() => { setRefreshing(true); fetchRecipes(true); }}
//           refreshing={refreshing}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recipes found</Text>
//             </View>
//           }
//         />
//       )}

//       {/* Edit Modal */}
//       <Modal visible={editModalVisible} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Recipe</Text>
//               <TouchableOpacity onPress={() => setEditModalVisible(false)}>
//                 <X size={24} color={colors.text} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalBody}>
//               <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
//               <TextInput
//                 style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
//                 value={editTitle}
//                 onChangeText={setEditTitle}
//               />
//               <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
//               <TextInput
//                 style={[styles.modalInput, { color: colors.text, borderColor: colors.border, height: 100 }]}
//                 value={editDesc}
//                 onChangeText={setEditDescription}
//                 multiline
//               />
//             </ScrollView>
//             <TouchableOpacity 
//               style={[styles.saveButton, { backgroundColor: colors.accent }]} 
//               onPress={saveEdit}
//             >
//               <Text style={styles.saveButtonText}>Save Changes (Local)</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: { padding: 16, paddingTop: 50 },
//   titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   headerTitle: { fontSize: 24, fontWeight: '800' },
//   addButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
//   addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
//   searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 48, borderRadius: 12, borderWidth: 1 },
//   searchInput: { flex: 1, height: '100%', fontSize: 14 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   listPadding: { padding: 16, paddingBottom: 100 },
//   recipeCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
//   recipeImage: { width: 100, height: '100%' },
//   recipeInfo: { flex: 1, padding: 12 },
//   recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
//   recipeName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
//   actionButtons: { flexDirection: 'row', gap: 10 },
//   iconBtn: { padding: 4 },
//   recipeMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
//   metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   metaText: { fontSize: 12, fontWeight: '500' },
//   recipeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   dateText: { fontSize: 11, fontWeight: '500' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
//   emptyText: { fontSize: 16, fontWeight: '500' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
//   modalContent: { width: '100%', maxHeight: '80%', borderRadius: 24, padding: 20 },
//   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
//   modalTitle: { fontSize: 20, fontWeight: '800' },
//   modalBody: { marginBottom: 20 },
//   label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
//   modalInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
//   saveButton: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
// });



/**
 * Admin Recipe Management Screen - CookuBuddy design system
 */

import { fetchAllRecipes, Recipe } from '@/lib/github-data';
import { getRecipeImageUrl } from '@/lib/images';
import {
  Clock,
  Edit2,
  Flame,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  errorRed:   '#D94040',
};

export default function RecipeManagement() {
  const [recipes, setRecipes]             = useState<Recipe[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [searchQuery, setSearch]          = useState('');

  const [editVisible, setEditVisible]     = useState(false);
  const [editing, setEditing]             = useState<Recipe | null>(null);
  const [editTitle, setEditTitle]         = useState('');
  const [editDesc, setEditDesc]           = useState('');

  const fetchRecipes = async (force = false) => {
    try {
      setLoading(true);
      const data = await fetchAllRecipes(force);
      setRecipes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const filtered = useMemo(() =>
    recipes.filter(r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [recipes, searchQuery]);

  const handleDelete = (sr_no: number) => {
    Alert.alert(
      'Delete Recipe',
      'Remove this recipe from the session list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive',
          onPress: () => setRecipes(p => p.filter(r => r.sr_no !== sr_no)) },
      ]
    );
  };

  const openEdit = (r: Recipe) => {
    setEditing(r);
    setEditTitle(r.title);
    setEditDesc(r.description);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!editing) return;
    setRecipes(p => p.map(r =>
      r.sr_no === editing.sr_no ? { ...r, title: editTitle, description: editDesc } : r
    ));
    setEditVisible(false);
    setEditing(null);
  };

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isVeg = item.tags['special-consideration']?.includes('Vegetarian');
    return (
      <View style={styles.recipeCard}>
        <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.recipeImage} />
        <View style={styles.recipeBody}>
          <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.recipeMeta}>
            <View style={styles.metaItem}>
              <Clock size={11} color={C.inkLight} />
              <Text style={styles.metaText}>{item.cooking_time}m</Text>
            </View>
            <View style={styles.metaItem}>
              <Flame size={11} color={C.inkLight} />
              <Text style={styles.metaText}>{isVeg ? 'Veg' : 'Non-Veg'}</Text>
            </View>
            <View style={styles.srPill}>
              <Text style={styles.srText}>#{item.sr_no}</Text>
            </View>
          </View>

          <View style={styles.recipeActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
              <Edit2 size={14} color={C.terra} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.sr_no)} style={styles.deleteBtn}>
              <Trash2 size={14} color={C.errorRed} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>ADMIN PANEL</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Recipe Management</Text>
          <TouchableOpacity
            onPress={() => { setRefreshing(true); fetchRecipes(true); }}
            style={styles.refreshBtn}
          >
            <RefreshCw size={16} color={C.terra} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={16} color={C.inkLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes…"
            placeholderTextColor={C.inkLight + '80'}
            value={searchQuery}
            onChangeText={setSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={C.inkLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Count row */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing <Text style={styles.countAccent}>{filtered.length}</Text> of {recipes.length} recipes
          </Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={C.terra} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderRecipe}
          keyExtractor={i => i.sr_no.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => { setRefreshing(true); fetchRecipes(true); }}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Search size={32} color={C.border} />
              </View>
              <Text style={styles.emptyTitle}>No recipes found</Text>
            </View>
          }
        />
      )}

      {/* Edit modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Recipe</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color={C.inkLight} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholderTextColor={C.inkLight + '80'}
              />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                value={editDesc}
                onChangeText={setEditDesc}
                multiline
                placeholderTextColor={C.inkLight + '80'}
              />
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>Save Changes</Text>
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

  // Header
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  headerLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    color: C.inkLight, marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: C.ink,
  },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, height: 48, marginBottom: 10,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', color: C.ink },

  countRow: { paddingHorizontal: 2 },
  countText: { fontSize: 12, fontWeight: '600', color: C.inkLight },
  countAccent: { color: C.terra, fontWeight: '800' },

  // Recipe cards
  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 60 },

  recipeCard: {
    flexDirection: 'row', backgroundColor: C.white, borderRadius: 20,
    marginBottom: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  recipeImage: { width: 96, height: '100%' },
  recipeBody: { flex: 1, padding: 14, justifyContent: 'space-between' },
  recipeTitle: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 8, lineHeight: 20 },

  recipeMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600', color: C.inkLight },
  srPill: {
    marginLeft: 'auto', backgroundColor: C.parchment,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
  },
  srText: { fontSize: 10, fontWeight: '800', color: C.inkLight },

  recipeActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: C.terra + '14', borderWidth: 1, borderColor: C.terra + '30',
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: C.terra },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: C.errorRed + '12', borderWidth: 1, borderColor: C.errorRed + '30',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: C.errorRed },

  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.parchment, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.ink,
  },

  // Edit modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(44,26,14,0.45)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: C.cream, borderRadius: 28, padding: 24,
    width: '100%', maxWidth: 380, maxHeight: '80%',
    borderWidth: 1, borderColor: C.border,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: C.ink,
  },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.parchment, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  modalBody: { marginBottom: 20 },
  inputLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    color: C.inkLight, marginBottom: 8, marginTop: 8,
  },
  modalInput: {
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, fontWeight: '600', color: C.ink,
  },
  modalTextarea: { height: 100, textAlignVertical: 'top' },

  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, height: 48, borderRadius: 14, backgroundColor: C.parchment,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: C.inkLight },
  modalConfirmBtn: {
    flex: 1, height: 48, borderRadius: 14, backgroundColor: C.terra,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.terra, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: C.white },
});