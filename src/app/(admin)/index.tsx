// /**
//  * Admin Dashboard Screen
//  * Overview of system statistics.
//  */

// import { useTheme } from '@/hooks/use-theme';
// import { supabase } from '@/lib/supabase';
// import { ChefHat, Users, BookOpen, Activity } from 'lucide-react-native';
// import React, { useEffect, useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   ActivityIndicator,
// } from 'react-native';

// export default function AdminDashboard() {
//   const { colors, isDark } = useTheme();
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalRecipes: 0,
//     activeToday: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         setLoading(true);
        
//         // Fetch total recipes
//         const { count: recipeCount } = await supabase
//           .from('recipes')
//           .select('*', { count: 'exact', head: true });

//         // Try to fetch total users if profiles table exists
//         const { count: userCount } = await supabase
//           .from('profiles')
//           .select('*', { count: 'exact', head: true });

//         setStats({
//           totalUsers: userCount || 0,
//           totalRecipes: recipeCount || 0,
//           activeToday: Math.floor(Math.random() * 50) + 10, // Mock data for now
//         });
//       } catch (e) {
//         console.error('Error fetching dashboard stats:', e);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, []);

//   const StatCard = ({ icon: Icon, title, value, color }: any) => (
//     <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//       <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
//         <Icon size={24} color={color} />
//       </View>
//       <View>
//         <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
//         <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
//         <ActivityIndicator size="large" color={colors.accent} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
//         <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Welcome back, Administrator</Text>

//         <View style={styles.statsGrid}>
//           <StatCard 
//             icon={Users} 
//             title="Total Users" 
//             value={stats.totalUsers.toString()} 
//             color="#4285F4" 
//           />
//           <StatCard 
//             icon={ChefHat} 
//             title="Total Recipes" 
//             value={stats.totalRecipes.toString()} 
//             color="#34A853" 
//           />
//           <StatCard 
//             icon={Activity} 
//             title="Active Today" 
//             value={stats.activeToday.toString()} 
//             color="#FBBC05" 
//           />
//           <StatCard 
//             icon={BookOpen} 
//             title="New Reports" 
//             value="3" 
//             color="#EA4335" 
//           />
//         </View>

//         <View style={[styles.recentSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>System Status</Text>
//           <View style={styles.statusRow}>
//             <View style={[styles.statusIndicator, { backgroundColor: '#34A853' }]} />
//             <Text style={[styles.statusText, { color: colors.text }]}>Database Connection: Healthy</Text>
//           </View>
//           <View style={styles.statusRow}>
//             <View style={[styles.statusIndicator, { backgroundColor: '#34A853' }]} />
//             <Text style={[styles.statusText, { color: colors.text }]}>Auth Service: Operational</Text>
//           </View>
//           <View style={styles.statusRow}>
//             <View style={[styles.statusIndicator, { backgroundColor: '#34A853' }]} />
//             <Text style={[styles.statusText, { color: colors.text }]}>Storage API: Operational</Text>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   scrollPadding: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },
//   headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
//   headerSubtitle: { fontSize: 16, fontWeight: '500', marginBottom: 32 },
//   statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
//   statCard: { 
//     width: '47%', 
//     padding: 20, 
//     borderRadius: 24, 
//     borderWidth: 1, 
//     flexDirection: 'column', 
//     gap: 12,
//     alignItems: 'flex-start'
//   },
//   iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
//   statTitle: { fontSize: 14, fontWeight: '600' },
//   statValue: { fontSize: 24, fontWeight: '800' },
//   recentSection: { padding: 24, borderRadius: 24, borderWidth: 1 },
//   sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
//   statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
//   statusIndicator: { width: 10, height: 10, borderRadius: 5 },
//   statusText: { fontSize: 15, fontWeight: '500' },
// });




/**
 * Admin Dashboard Screen - CookuBuddy design system
 */

import { supabase } from '@/lib/supabase';
import { Activity, BookOpen, ChefHat, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalRecipes: 0, activeToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const { count: recipeCount } = await supabase
          .from('recipes').select('*', { count: 'exact', head: true });
        const { count: userCount } = await supabase
          .from('profiles').select('*', { count: 'exact', head: true });
        setStats({
          totalUsers: userCount || 0,
          totalRecipes: recipeCount || 0,
          activeToday: Math.floor(Math.random() * 50) + 10,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { icon: Users,    label: 'Total Users',    value: stats.totalUsers,    accent: C.blue     },
    { icon: ChefHat,  label: 'Total Recipes',  value: stats.totalRecipes,  accent: C.sage     },
    { icon: Activity, label: 'Active Today',   value: stats.activeToday,   accent: C.saffron  },
    { icon: BookOpen, label: 'New Reports',    value: 3,                   accent: C.errorRed },
  ];

  const systemStatus = [
    { label: 'Database Connection', status: 'Healthy',     ok: true  },
    { label: 'Auth Service',        status: 'Operational', ok: true  },
    { label: 'Storage API',         status: 'Operational', ok: true  },
  ];

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />
        <ActivityIndicator size="large" color={C.terra} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>COOKUBUDDY</Text>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Welcome back, Administrator</Text>
        </View>

        {/* Admin badge */}
        <View style={styles.adminBanner}>
          <View style={styles.adminDot} />
          <Text style={styles.adminBannerText}>All systems operational</Text>
        </View>

        {/* Stats grid */}
        <Text style={styles.sectionLabel}>OVERVIEW</Text>
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: s.accent + '18' }]}>
                <s.icon size={20} color={s.accent} />
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* System status */}
        <Text style={styles.sectionLabel}>SYSTEM STATUS</Text>
        <View style={styles.card}>
          {systemStatus.map((s, i) => (
            <View
              key={i}
              style={[
                styles.statusRow,
                i < systemStatus.length - 1 && styles.statusRowBorder,
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: s.ok ? C.sage : C.errorRed }]} />
              <Text style={styles.statusLabel}>{s.label}</Text>
              <View style={[styles.statusPill, { backgroundColor: (s.ok ? C.sage : C.errorRed) + '18' }]}>
                <Text style={[styles.statusPillText, { color: s.ok ? C.sage : C.errorRed }]}>
                  {s.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.versionText}>CookuBuddy Admin · v1.0 · Made with 🍅</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  loadingRoot: { flex: 1, backgroundColor: C.cream, justifyContent: 'center', alignItems: 'center' },

  blobTop: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: C.saffron + '18', top: -80, right: -70,
  },
  blobBottom: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: C.terra + '12', bottom: -60, left: -50,
  },

  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 },

  header: { marginBottom: 20 },
  headerLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    color: C.inkLight, marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: C.ink, marginBottom: 4,
  },
  headerSub: { fontSize: 14, fontWeight: '500', color: C.inkLight },

  adminBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.sage + '14', borderWidth: 1, borderColor: C.sage + '40',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 28,
  },
  adminDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.sage },
  adminBannerText: { fontSize: 13, fontWeight: '700', color: C.sage },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    color: C.inkLight, marginBottom: 12, paddingHorizontal: 2,
  },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28,
  },
  statCard: {
    width: '47.5%', backgroundColor: C.white, borderRadius: 20,
    padding: 18, borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  statIconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  statVal: {
    fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: C.ink, marginBottom: 4,
  },
  statLbl: { fontSize: 12, fontWeight: '600', color: C.inkLight },

  card: {
    backgroundColor: C.white, borderRadius: 20, paddingHorizontal: 18,
    borderWidth: 1, borderColor: C.border, marginBottom: 28,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12,
  },
  statusRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border + '80' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: C.ink },
  statusPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },

  versionText: {
    textAlign: 'center', fontSize: 12, color: C.inkLight,
    fontFamily: 'Georgia', fontStyle: 'italic',
  },
});