/**
 * CookuBuddy - Profile & Settings Workspace
 * Features: Localization, Dark Mode Toggle, Auth Integration.
 */

import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { 
  Award, 
  BookOpen, 
  ChevronRight, 
  CircleHelp, 
  Heart, 
  LogOut, 
  Moon, 
  ShieldCheck, 
  User, 
  Globe 
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, setLanguage, language } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);

  async function handleConfirmLogout() {
    setIsModalVisible(false);
    try { await signOut(); } catch (e) { console.error(e); }
  }

  const SettingRow = ({ icon: Icon, title, rightElement, onPress }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconWrapper, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
          <Icon size={20} color={colors.textSecondary} />
        </View>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {rightElement ? rightElement : <ChevronRight size={18} color="#A0A0A0" />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        {/* Profile Card Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' }}
            style={[styles.avatarImage, { borderColor: colors.accent }]}
          />
          <Text style={[styles.profileName, { color: colors.text }]}>{profile?.name || 'Chef Master'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profile?.email || user?.email || 'chef@cookubuddy.com'}</Text>
        </View>

        {/* Stats Matrix Deck Row */}
        <View style={styles.statsContainer}>
          { [ { icon: BookOpen, val: '42', label: 'Cooked', col: colors.accent },
              { icon: Heart, val: '128', label: 'Favorites', col: '#EA4335' },
              { icon: Award, val: 'Lvl 5', label: 'Rank', col: '#34A853' } ].map((stat, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <stat.icon size={20} color={stat.col} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.val}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Account Settings Section */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t('account_settings')}</Text>
        <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <SettingRow icon={User} title="Edit Profile Details" />
          <SettingRow 
            icon={Moon} 
            title={t('dark_mode')} 
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Support Section */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t('support')}</Text>
        <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <SettingRow icon={ShieldCheck} title="Privacy Policy" />
          <SettingRow icon={CircleHelp} title="Help Center" />
        </View>

        {/* Logout Action Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => setIsModalVisible(true)} style={styles.logoutButton}>
          <LogOut size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>{t('sign_out')}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalIconCircle}><LogOut size={28} color="#EA4335" /></View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Logout</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>Are you sure you want to log out of CookuBuddy?</Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.modalBtn, styles.cancelBtn]}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmLogout} style={[styles.modalBtn, styles.confirmBtn]}><Text style={styles.confirmBtnText}>Log Out</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollPadding: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },
  profileHeaderCard: { alignItems: 'center', borderRadius: 24, paddingVertical: 28, borderWidth: 1, marginBottom: 20 },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, marginBottom: 14 },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 14, fontWeight: '500' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, gap: 12 },
  statBox: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  sectionHeading: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 4 },
  settingsGroupCard: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, marginBottom: 24 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconWrapper: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', height: 50, backgroundColor: '#EA4335', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalContent: { borderRadius: 28, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtn: { flex: 1, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#475569', fontSize: 15, fontWeight: '600' },
  confirmBtn: { backgroundColor: '#EA4335' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
