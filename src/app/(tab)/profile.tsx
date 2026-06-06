import { useLanguage, LanguageCode, LANGUAGE_NAMES } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Themes, ThemeName } from '@/constants/theme';
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
  Globe,
  Palette,
  Check,
  LogIn
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { colors, themeName, setTheme } = useTheme();
  const { t, setLanguage, language, isLanguageLoading } = useLanguage();
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const router = useRouter();

  const [favCount, setFavCount] = useState(0);
  const [cookedCount, setCookedCount] = useState(0);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const favKey = user ? `app_favorites_${user.id}` : 'app_favorites_guest';
        const cookedKey = user ? `app_cooked_recipes_${user.id}` : 'app_cooked_recipes_guest';
        
        const [favs, cooked] = await Promise.all([
          AsyncStorage.getItem(favKey),
          AsyncStorage.getItem(cookedKey)
        ]);

        const favArray = favs ? JSON.parse(favs) : [];
        const cookedArray = cooked ? JSON.parse(cooked) : [];

        setFavCount(favArray.length);
        setCookedCount(cookedArray.length);

        // Calculate Level: 10->L1, 30->L2, 60->L3
        const count = cookedArray.length;
        if (count >= 60) setLevel(3);
        else if (count >= 30) setLevel(2);
        else if (count >= 10) setLevel(1);
        else setLevel(0);

      } catch (e) {
        console.error('Failed to load profile stats', e);
      }
    };
    loadStats();
  }, [user?.id]);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of CookuBuddy?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        }}
      ]
    );
  };

  const SettingRow = ({ icon: Icon, title, rightElement, onPress, subtitle }: any) => (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7} 
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrapperStyle}>
          <View style={[styles.settingIconWrapper, { backgroundColor: colors.backgroundElement }]}>
            <Icon size={18} color={colors.accent} />
          </View>
        </View>
        <View>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement ? rightElement : <ChevronRight size={16} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  const stats = [
    { icon: BookOpen, val: user ? cookedCount.toString() : '—', label: 'Cooked', col: colors.accent },
    { icon: Heart, val: user ? favCount.toString() : '—', label: 'Favorites', col: colors.error },
    { icon: Award, val: user ? `Lv ${level}` : '—', label: 'Rank', col: colors.success },
  ];

  const getLevelLabel = () => {
    if (level === 3) return 'Master Chef';
    if (level === 2) return 'Senior Chef';
    if (level === 1) return 'Rising Chef';
    return 'Amateur Chef';
  };

  if (isLanguageLoading) {
    return (
      <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Switching Language...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.blobTop, { backgroundColor: colors.accent + '10' }]} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        <Card style={styles.profileCard}>
          <View style={[styles.avatarRing, { borderColor: colors.accent }]}>
            <Image
              source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' }}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{profile?.name || (user ? 'Chef Master' : 'Guest Chef')}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profile?.email || user?.email || 'Sign in to sync your recipes'}</Text>
          {user && (
            <View style={[styles.badge, { backgroundColor: colors.accent + '20', borderColor: colors.accent + '40' }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>🍳 {getLevelLabel()}</Text>
            </View>
          )}
        </Card>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <Card key={i} style={styles.statBox}>
              <s.icon size={18} color={s.col} />
              <Text style={[styles.statValue, { color: colors.text }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES</Text>
        <Card style={styles.settingsGroup}>
          <SettingRow 
            icon={Palette} 
            title="App Theme" 
            subtitle={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            onPress={() => setIsThemeModalVisible(true)}
          />
          <SettingRow 
            icon={Globe} 
            title="Language" 
            subtitle={LANGUAGE_NAMES[language]}
            onPress={() => setIsLangModalVisible(true)}
          />
        </Card>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</Text>
        <Card style={styles.settingsGroup}>
          <SettingRow icon={User} title="Edit Profile Details" />
          <SettingRow icon={ShieldCheck} title="Privacy Policy" />
          <SettingRow icon={CircleHelp} title="Help Center" />
        </Card>

        {user ? (
          <TouchableOpacity activeOpacity={0.8} onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: colors.error }]}>
            <LogOut size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>{t('sign_out')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(auth)/login')} style={[styles.logoutBtn, { backgroundColor: colors.accent }]}>
            <LogIn size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>Log In to Account</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>CookuBuddy v1.0 • Made with ❤️</Text>
      </ScrollView>

      {/* Theme Modal */}
      <Modal visible={isThemeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
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
              <Text style={{ color: colors.accent, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={isLangModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Language</Text>
            <ScrollView style={{ maxHeight: 300, width: '100%' }}>
              {(Object.keys(LANGUAGE_NAMES) as LanguageCode[]).map((code) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => {
                    setLanguage(code);
                    setIsLangModalVisible(false);
                  }}
                  style={[
                    styles.langOption,
                    { borderBottomColor: colors.border },
                    language === code && { backgroundColor: colors.accent + '15' }
                  ]}
                >
                  <Text style={[
                    styles.langText, 
                    { color: colors.text },
                    language === code && { color: colors.accent, fontWeight: '700' }
                  ]}>
                    {LANGUAGE_NAMES[code]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setIsLangModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobTop: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -70 },
  scrollPadding: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  
  profileCard: { alignItems: 'center', paddingVertical: 28, marginBottom: 20 },
  avatarRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, padding: 2, marginBottom: 14 },
  avatar: { width: '100%', height: '100%', borderRadius: 43 },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statBox: { flex: 1, paddingVertical: 14, alignItems: 'center', padding: 0 },
  statValue: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, paddingHorizontal: 4 },
  settingsGroup: { paddingHorizontal: 16, marginBottom: 24, paddingVertical: 0 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconWrapperStyle: { width: 34, height: 34 },
  settingIconWrapper: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center' },

  logoutBtn: { flexDirection: 'row', height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12, elevation: 2 },
  logoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  versionText: { textAlign: 'center', fontSize: 12, marginTop: 24, fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalTitle: { fontSize: 19, fontWeight: '700', marginBottom: 20 },
  modalCloseBtn: { marginTop: 16, padding: 10 },
  
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  themeOption: { width: 80, height: 80, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  themeColorCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeText: { fontSize: 10, fontWeight: '700' },

  langOption: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  langText: { fontSize: 16, fontWeight: '500' },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  loadingText: { fontSize: 16, fontWeight: '600' },
});
