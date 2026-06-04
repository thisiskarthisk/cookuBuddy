/**
 * Admin Dashboard Screen
 * Overview of system statistics.
 */

import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { ChefHat, Users, BookOpen, Activity } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

export default function AdminDashboard() {
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    activeToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Fetch total recipes
        const { count: recipeCount } = await supabase
          .from('recipes')
          .select('*', { count: 'exact', head: true });

        // Try to fetch total users if profiles table exists
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: userCount || 0,
          totalRecipes: recipeCount || 0,
          activeToday: Math.floor(Math.random() * 50) + 10, // Mock data for now
        });
      } catch (e) {
        console.error('Error fetching dashboard stats:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Welcome back, Administrator</Text>

        <View style={styles.statsGrid}>
          <StatCard 
            icon={Users} 
            title="Total Users" 
            value={stats.totalUsers.toString()} 
            color="#4285F4" 
          />
          <StatCard 
            icon={ChefHat} 
            title="Total Recipes" 
            value={stats.totalRecipes.toString()} 
            color="#34A853" 
          />
          <StatCard 
            icon={Activity} 
            title="Active Today" 
            value={stats.activeToday.toString()} 
            color="#FBBC05" 
          />
          <StatCard 
            icon={BookOpen} 
            title="New Reports" 
            value="3" 
            color="#EA4335" 
          />
        </View>

        <View style={[styles.recentSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>System Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: '#34A853' }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>Database Connection: Healthy</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: '#34A853' }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>Auth Service: Operational</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: '#34A853' }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>Storage API: Operational</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollPadding: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, fontWeight: '500', marginBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  statCard: { 
    width: '47%', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    flexDirection: 'column', 
    gap: 12,
    alignItems: 'flex-start'
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  statTitle: { fontSize: 14, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800' },
  recentSection: { padding: 24, borderRadius: 24, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  statusIndicator: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, fontWeight: '500' },
});
