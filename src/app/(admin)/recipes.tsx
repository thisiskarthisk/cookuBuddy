/**
 * Admin Recipe Management Screen
 * List and manage all recipes in the system.
 * Updated to use GitHub as the data source with local Edit/Delete capability.
 */

import { useTheme } from '@/hooks/use-theme';
import { getRecipeImageUrl } from '@/lib/images';
import { fetchAllRecipes, Recipe } from '@/lib/github-data';
import { Search, Plus, MoreVertical, Clock, Flame, Edit2, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';

export default function RecipeManagement() {
  const { colors } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDescription] = useState('');

  const fetchRecipes = async (force = false) => {
    try {
      setLoading(true);
      const data = await fetchAllRecipes(force);
      setRecipes(data || []);
    } catch (e) {
      console.error('Error fetching recipes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipes, searchQuery]);

  const handleDelete = (sr_no: number) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to remove this recipe from the list? (Note: This only affects the current session)',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setRecipes(prev => prev.filter(r => r.sr_no !== sr_no));
          }
        }
      ]
    );
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setEditTitle(recipe.title);
    setEditDescription(recipe.description);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (!editingRecipe) return;
    
    setRecipes(prev => prev.map(r => 
      r.sr_no === editingRecipe.sr_no 
        ? { ...r, title: editTitle, description: editDesc } 
        : r
    ));
    setEditModalVisible(false);
    setEditingRecipe(null);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={[styles.recipeCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <Image source={{ uri: getRecipeImageUrl(item.image_filename) }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <View style={styles.recipeHeader}>
          <Text style={[styles.recipeName, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
              <Edit2 size={16} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.sr_no)} style={styles.iconBtn}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.cooking_time}m</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.tags['special-consideration']?.includes('Vegetarian') ? 'Veg' : 'Non-Veg'}
            </Text>
          </View>
        </View>

        <View style={styles.recipeFooter}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            SR No: {item.sr_no}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Recipes</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent }]} onPress={() => fetchRecipes(true)}>
            <Text style={styles.addButtonText}>Refresh GitHub</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search recipes..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.sr_no.toString()}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          onRefresh={() => { setRefreshing(true); fetchRecipes(true); }}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recipes found</Text>
            </View>
          }
        />
      )}

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Recipe</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                value={editTitle}
                onChangeText={setEditTitle}
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, height: 100 }]}
                value={editDesc}
                onChangeText={setEditDescription}
                multiline
              />
            </ScrollView>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.accent }]} 
              onPress={saveEdit}
            >
              <Text style={styles.saveButtonText}>Save Changes (Local)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 50 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  addButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 48, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, height: '100%', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPadding: { padding: 16, paddingBottom: 100 },
  recipeCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  recipeImage: { width: 100, height: '100%' },
  recipeInfo: { flex: 1, padding: 12 },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  recipeName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 4 },
  recipeMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '500' },
  recipeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 11, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '80%', borderRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalBody: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  saveButton: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
