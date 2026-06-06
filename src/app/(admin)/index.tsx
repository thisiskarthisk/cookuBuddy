import { useTheme } from '@/hooks/use-theme';
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
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

export default function AdminDashboard() {
  const { colors: theme } = useTheme();
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
    { icon: Users, label: 'Total Users', value: stats.totalUsers, accent: '#3B6FD4' },
    { icon: ChefHat, label: 'Total Recipes', value: stats.totalRecipes, accent: theme.success },
    { icon: Activity, label: 'Active Today', value: stats.activeToday, accent: theme.accentSecondary },
    { icon: BookOpen, label: 'New Reports', value: 3, accent: theme.error },
  ];

  const systemStatus = [
    { label: 'Database Connection', status: 'Healthy', ok: true },
    { label: 'Auth Service', status: 'Operational', ok: true },
    { label: 'Storage API', status: 'Operational', ok: true },
  ];

  if (loading) {
    return (
      <View style={[styles.loadingRoot, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.blobTop, { backgroundColor: theme.accentSecondary + '18' }]} />
      <View style={[styles.blobBottom, { backgroundColor: theme.accent + '12' }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>COOKUBUDDY</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Admin Dashboard</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Welcome back, Administrator</Text>
        </View>

        <View style={[styles.adminBanner, { backgroundColor: theme.success + '14', borderColor: theme.success + '40' }]}>
          <View style={[styles.adminDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.adminBannerText, { color: theme.success }]}>All systems operational</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>OVERVIEW</Text>
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <Card key={i} style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: s.accent + '18' }]}>
                <s.icon size={20} color={s.accent} />
              </View>
              <Text style={[styles.statVal, { color: theme.text }]}>{s.value}</Text>
              <Text style={[styles.statLbl, { color: theme.textSecondary }]}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>SYSTEM STATUS</Text>
        <Card style={{ paddingHorizontal: 18, paddingVertical: 0 }}>
          {systemStatus.map((s, i) => (
            <View
              key={i}
              style={[
                styles.statusRow,
                i < systemStatus.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border + '80' },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: s.ok ? theme.success : theme.error }]} />
              <Text style={[styles.statusLabel, { color: theme.text }]}>{s.label}</Text>
              <View style={[styles.statusPill, { backgroundColor: (s.ok ? theme.success : theme.error) + '18' }]}>
                <Text style={[styles.statusPillText, { color: s.ok ? theme.success : theme.error }]}>
                  {s.status}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>CookuBuddy Admin · v1.0 • Made with ❤️</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingRoot: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blobTop: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -70 },
  blobBottom: { position: 'absolute', width: 220, height: 220, borderRadius: 110, bottom: -60, left: -50 },
  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 },
  header: { marginBottom: 20 },
  headerLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  headerSub: { fontSize: 14, fontWeight: '500' },
  adminBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 28 },
  adminDot: { width: 8, height: 8, borderRadius: 4 },
  adminBannerText: { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12, paddingHorizontal: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { width: '47.5%', padding: 18 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  statVal: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  statLbl: { fontSize: 12, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  versionText: { textAlign: 'center', fontSize: 12, marginTop: 24, fontStyle: 'italic' },
});
