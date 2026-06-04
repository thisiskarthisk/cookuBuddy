/**
 * Admin Recipe Management Screen
 * List and manage all recipes in the system.
 */

import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { ChefHat, Search, Plus, MoreVertical, Clock, Flame } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Recipe {
  srno: number;
  recipe_name: string;
  translated_recipe_name?: string;
  image_url: string;
  prep_time_in_mins?: number;
  diet?: string;
}

export default function RecipeManagement() {
  const { colors, isDark } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('srno', { ascending: true })
        .limit(50); // Limit for performance

      console.log('Admin fetch recipes:', { dataLength: data?.length, error });

      if (error) throw error;
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

  const filteredRecipes = recipes.filter(r => 
    r.recipe_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.translated_recipe_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={[styles.recipeCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <Image source={{ uri: item.image_url }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <View style={styles.recipeHeader}>
          <Text style={[styles.recipeName, { color: colors.text }]} numberOfLines={1}>
            {item.translated_recipe_name || item.recipe_name}
          </Text>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.prep_time_in_mins || 30}m</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.diet || 'Medium'}</Text>
          </View>
        </View>

        <View style={styles.recipeFooter}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            SR No: {item.srno}
          </Text>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.editButtonText, { color: colors.accent }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Recipes</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent }]}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search all recipes..."
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
          keyExtractor={item => item.srno.toString()}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          onRefresh={() => { setRefreshing(true); fetchRecipes(); }}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recipes found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 16, marginBottom: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    height: 50, 
    borderRadius: 14, 
    borderWidth: 1,
    gap: 12
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  listPadding: { paddingHorizontal: 16, paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  recipeCard: { flexDirection: 'row', borderRadius: 20, borderWidth: 1, padding: 12, marginBottom: 12, gap: 12 },
  recipeImage: { width: 80, height: 80, borderRadius: 12 },
  recipeInfo: { flex: 1, justifyContent: 'space-between' },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recipeName: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  moreButton: { padding: 4 },
  recipeMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '500' },
  recipeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  dateText: { fontSize: 11, fontWeight: '500' },
  editButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  editButtonText: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: '500' },
});
