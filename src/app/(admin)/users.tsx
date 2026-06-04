/**
 * Admin User Management Screen
 * List and manage registered users.
 */

import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { Mail, Search, User, MoreVertical, Shield } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Profile {
  id: string;
  email?: string;
  name?: string;
  user_type?: 'admin' | 'user';
  created_at: string;
}

export default function UserManagement() {
  const { colors, isDark } = useTheme();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      console.error('Error fetching users:', e);
      // Fallback to mock data for demonstration
      setUsers([
        { id: '1', email: 'admin@cookubuddy.com', name: 'System Admin', user_type: 'admin', created_at: new Date().toISOString() },
        { id: '2', email: 'user1@example.com', name: 'John Doe', user_type: 'user', created_at: new Date().toISOString() },
        { id: '3', email: 'user2@example.com', name: 'Jane Smith', user_type: 'user', created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: Profile }) => (
    <View style={[styles.userCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.userHeader}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
          <User size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name || 'Anonymous User'}</Text>
          <View style={styles.emailRow}>
            <Mail size={12} color={colors.textSecondary} />
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userFooter}>
        <View style={[styles.roleBadge, { backgroundColor: item.user_type === 'admin' ? '#4285F4' + '20' : colors.border }]}>
          {item.user_type === 'admin' && <Shield size={12} color="#4285F4" style={{ marginRight: 4 }} />}
          <Text style={[styles.roleText, { color: item.user_type === 'admin' ? '#4285F4' : colors.textSecondary }]}>
            {item.user_type?.toUpperCase() || 'USER'}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          Joined {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>User Management</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
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
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          onRefresh={() => { setRefreshing(true); fetchUsers(); }}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text>
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
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
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
  userCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12 },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userEmail: { fontSize: 13, fontWeight: '500' },
  moreButton: { padding: 4 },
  userFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '800' },
  dateText: { fontSize: 12, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: '500' },
});
