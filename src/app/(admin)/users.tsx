// /**
//  * Admin User Management Screen
//  * List and manage registered users.
//  */

// import { useTheme } from '@/hooks/use-theme';
// import { supabase } from '@/lib/supabase';
// import { Mail, Search, User, MoreVertical, Shield } from 'lucide-react-native';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// interface Profile {
//   id: string;
//   email?: string;
//   name?: string;
//   user_type?: 'admin' | 'user';
//   created_at: string;
// }

// export default function UserManagement() {
//   const { colors, isDark } = useTheme();
//   const [users, setUsers] = useState<Profile[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setUsers(data || []);
//     } catch (e) {
//       console.error('Error fetching users:', e);
//       // Fallback to mock data for demonstration
//       setUsers([
//         { id: '1', email: 'admin@cookubuddy.com', name: 'System Admin', user_type: 'admin', created_at: new Date().toISOString() },
//         { id: '2', email: 'user1@example.com', name: 'John Doe', user_type: 'user', created_at: new Date().toISOString() },
//         { id: '3', email: 'user2@example.com', name: 'Jane Smith', user_type: 'user', created_at: new Date().toISOString() },
//       ]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const filteredUsers = users.filter(u => 
//     u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
//     u.name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const renderUserItem = ({ item }: { item: Profile }) => (
//     <View style={[styles.userCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//       <View style={styles.userHeader}>
//         <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
//           <User size={20} color={colors.textSecondary} />
//         </View>
//         <View style={styles.userInfo}>
//           <Text style={[styles.userName, { color: colors.text }]}>{item.name || 'Anonymous User'}</Text>
//           <View style={styles.emailRow}>
//             <Mail size={12} color={colors.textSecondary} />
//             <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
//           </View>
//         </View>
//         <TouchableOpacity style={styles.moreButton}>
//           <MoreVertical size={20} color={colors.textSecondary} />
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.userFooter}>
//         <View style={[styles.roleBadge, { backgroundColor: item.user_type === 'admin' ? '#4285F4' + '20' : colors.border }]}>
//           {item.user_type === 'admin' && <Shield size={12} color="#4285F4" style={{ marginRight: 4 }} />}
//           <Text style={[styles.roleText, { color: item.user_type === 'admin' ? '#4285F4' : colors.textSecondary }]}>
//             {item.user_type?.toUpperCase() || 'USER'}
//           </Text>
//         </View>
//         <Text style={[styles.dateText, { color: colors.textSecondary }]}>
//           Joined {new Date(item.created_at).toLocaleDateString()}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>User Management</Text>
        
//         <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//           <Search size={20} color={colors.textSecondary} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.text }]}
//             placeholder="Search users..."
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
//           data={filteredUsers}
//           renderItem={renderUserItem}
//           keyExtractor={item => item.id}
//           contentContainerStyle={styles.listPadding}
//           showsVerticalScrollIndicator={false}
//           onRefresh={() => { setRefreshing(true); fetchUsers(); }}
//           refreshing={refreshing}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text>
//             </View>
//           }
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: { paddingTop: 60, paddingHorizontal: 16, marginBottom: 16 },
//   headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
//   searchContainer: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     paddingHorizontal: 16, 
//     height: 50, 
//     borderRadius: 14, 
//     borderWidth: 1,
//     gap: 12
//   },
//   searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
//   listPadding: { paddingHorizontal: 16, paddingBottom: 30 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   userCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12 },
//   userHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
//   avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
//   userInfo: { flex: 1 },
//   userName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
//   emailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   userEmail: { fontSize: 13, fontWeight: '500' },
//   moreButton: { padding: 4 },
//   userFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
//   roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
//   roleText: { fontSize: 11, fontWeight: '800' },
//   dateText: { fontSize: 12, fontWeight: '500' },
//   emptyContainer: { alignItems: 'center', marginTop: 100 },
//   emptyText: { fontSize: 16, fontWeight: '500' },
// });



/**
 * Admin User Management Screen - CookuBuddy design system
 */

import { supabase } from '@/lib/supabase';
import { Mail, MoreVertical, Search, Shield, User } from 'lucide-react-native';
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
  blue:       '#3B6FD4',
};

interface Profile {
  id: string;
  email?: string;
  name?: string;
  user_type?: 'admin' | 'user';
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers]           = useState<Profile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearch]    = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch {
      setUsers([
        { id: '1', email: 'admin@cookubuddy.com', name: 'System Admin', user_type: 'admin', created_at: new Date().toISOString() },
        { id: '2', email: 'user1@example.com',    name: 'John Doe',     user_type: 'user',  created_at: new Date().toISOString() },
        { id: '3', email: 'user2@example.com',    name: 'Jane Smith',   user_type: 'user',  created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUser = ({ item }: { item: Profile }) => {
    const isAdmin = item.user_type === 'admin';
    // Derive avatar initials
    const initials = (item.name || 'U')
      .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
      <View style={styles.userCard}>
        {/* Avatar */}
        <View style={[styles.avatarCircle, { backgroundColor: isAdmin ? C.terra + '18' : C.parchment }]}>
          <Text style={[styles.avatarInitials, { color: isAdmin ? C.terra : C.inkLight }]}>
            {initials}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{item.name || 'Anonymous User'}</Text>
            {isAdmin && (
              <View style={styles.adminPill}>
                <Shield size={10} color={C.terra} />
                <Text style={styles.adminPillText}>ADMIN</Text>
              </View>
            )}
          </View>
          <View style={styles.emailRow}>
            <Mail size={11} color={C.inkLight} />
            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          </View>
          <Text style={styles.joinedDate}>
            Joined {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical size={18} color={C.inkLight} />
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={styles.countPill}>
            <User size={12} color={C.terra} />
            <Text style={styles.countPillText}>{users.length}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={16} color={C.inkLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users…"
            placeholderTextColor={C.inkLight + '80'}
            value={searchQuery}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={C.terra} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderUser}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => { setRefreshing(true); fetchUsers(); }}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <User size={32} color={C.border} />
              </View>
              <Text style={styles.emptyTitle}>No users found</Text>
            </View>
          }
        />
      )}
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

  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
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
  countPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  countPillText: { fontSize: 13, fontWeight: '700', color: C.ink },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, height: 48,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', color: C.ink },

  listContent: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },

  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.white, borderRadius: 20, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  avatarInitials: { fontSize: 16, fontWeight: '800' },

  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  userName: { fontSize: 15, fontWeight: '700', color: C.ink },
  adminPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.terra + '14', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: C.terra + '30',
  },
  adminPillText: { fontSize: 9, fontWeight: '900', color: C.terra, letterSpacing: 0.5 },

  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  userEmail: { fontSize: 12, fontWeight: '500', color: C.inkLight, flex: 1 },
  joinedDate: { fontSize: 11, fontWeight: '600', color: C.inkLight + 'AA' },

  moreBtn: { padding: 6 },

  emptyState: {
    alignItems: 'center', justifyContent: 'center', marginTop: 80,
  },
  emptyIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.parchment, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.ink,
  },
});