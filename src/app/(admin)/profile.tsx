import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Themes, ThemeName } from '@/constants/theme';
import {
  Bell,
  ChevronRight,
  Lock,
  LogOut,
  Palette,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Check
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { Card } from '@/components/ui/card';

export default function AdminProfile() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { colors: theme, themeName, setTheme } = useTheme();

  const [logoutModal, setLogoutModal] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);

  async function handleConfirmLogout() {
    setLogoutModal(false);
    try { 
      await signOut(); 
      router.replace('/(auth)/login');
    } catch (e) { 
      console.error(e); 
    }
  }

  const SettingRow = ({ icon: Icon, label, right, onPress, subtitle }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      style={[styles.settingRow, { borderBottomColor: theme.border + '80' }]}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.backgroundElement }]}>
          <Icon size={18} color={theme.accent} />
        </View>
        <View>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {right ?? <ChevronRight size={16} color={theme.textSecondary} />}
    </TouchableOpacity>
  );

  const stats = [
    { label: 'Users', val: '—' },
    { label: 'Recipes', val: '—' },
    { label: 'Reports', val: '3' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.blobTop, { backgroundColor: theme.accentSecondary + '10' }]} />
      <View style={[styles.blobBottom, { backgroundColor: theme.accent + '10' }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Card style={styles.avatarCard}>
          <View style={[styles.adminRibbon, { backgroundColor: theme.accent }]}>
            <Shield size={11} color="#FFFFFF" />
            <Text style={styles.adminRibbonText}>ADMINISTRATOR</Text>
          </View>

          <View style={[styles.avatarRing, { borderColor: theme.accent }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop' }}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>Admin Master</Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email || 'admin@cookubuddy.com'}</Text>

          <View style={[styles.chefBadge, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }]}>
            <ShieldCheck size={12} color={theme.accent} />
            <Text style={[styles.chefBadgeText, { color: theme.accent }]}>Super Admin</Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <Card key={i} style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.text }]}>{s.val}</Text>
              <Text style={[styles.statLbl, { color: theme.textSecondary }]}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ADMIN CONTROLS</Text>
        <Card style={styles.settingsCard}>
          <SettingRow icon={Settings} label="Global System Settings" />
          <SettingRow icon={Bell} label="System Notifications" />
          <SettingRow icon={Lock} label="Security Audit Logs" />
        </Card>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ACCOUNT</Text>
        <Card style={styles.settingsCard}>
          <SettingRow 
            icon={Palette} 
            label="App Theme" 
            subtitle={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            onPress={() => setIsThemeModalVisible(true)} 
          />
          <SettingRow icon={User} label="Edit Profile Details" />
        </Card>

        <TouchableOpacity
          onPress={() => setLogoutModal(true)}
          activeOpacity={0.85}
          style={[styles.logoutBtn, { backgroundColor: theme.error }]}
        >
          <LogOut size={18} color="#FFFFFF" />
          <Text style={styles.logoutText}>{t('sign_out')}</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>CookuBuddy Admin v1.0 • Made with ❤️</Text>
      </ScrollView>

      {/* Theme Modal */}
      <Modal visible={isThemeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={[styles.themeModalCard, { maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Theme</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.themeGrid}>
              {(Object.keys(Themes) as ThemeName[]).map((name) => (
                <TouchableOpacity
                  key={name}
                  onPress={() => {
                    setTheme(name);
                    setIsThemeModalVisible(false);
                  }}
                  style={[
                    styles.themeOption,
                    { backgroundColor: Themes[name].background, borderColor: Themes[name].border },
                    themeName === name && { borderColor: Themes[name].accent, borderWidth: 2 }
                  ]}
                >
                  <View style={[styles.themeColorCircle, { backgroundColor: Themes[name].accent }]}>
                    {themeName === name && <Check size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.themeText, { color: Themes[name].text }]}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setIsThemeModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={{ color: theme.accent, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>

      {/* Logout modal */}
      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={[styles.modalIconCircle, { backgroundColor: theme.error + '15' }]}>
              <LogOut size={26} color={theme.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Out?</Text>
            <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
              Are you sure you want to sign out of the Admin panel?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setLogoutModal(false)} style={[styles.modalCancelBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmLogout} style={[styles.modalConfirmBtn, { backgroundColor: theme.error }]}>
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
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
  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 },

  avatarCard: { alignItems: 'center', paddingVertical: 28, marginBottom: 16 },
  adminRibbon: { position: 'absolute', top: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 5, borderTopRightRadius: 24, borderBottomLeftRadius: 14 },
  adminRibbonText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, marginBottom: 14, padding: 2, marginTop: 8 },
  avatar: { width: '100%', height: '100%', borderRadius: 46 },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  chefBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chefBadgeText: { fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statBox: { flex: 1, paddingVertical: 16, alignItems: 'center', padding: 0 },
  statVal: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  statLbl: { fontSize: 11, fontWeight: '600' },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, paddingHorizontal: 4 },
  settingsCard: { paddingHorizontal: 16, marginBottom: 24, paddingVertical: 0 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 11, marginTop: 1 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 16, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  versionText: { textAlign: 'center', fontSize: 12, marginTop: 10, fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  themeModalCard: { padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 20 },
  themeOption: { width: 80, height: 80, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  themeColorCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeText: { fontSize: 10, fontWeight: '700' },
  modalCloseBtn: { marginTop: 20, padding: 10 },

  modalCard: { borderRadius: 28, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  modalBody: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtn: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  modalCancelText: { fontSize: 14, fontWeight: '700' },
  modalConfirmBtn: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  modalConfirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
