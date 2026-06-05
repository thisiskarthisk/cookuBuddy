// /**
//  * CookuBuddy - Profile & Settings Workspace
//  * Features: Localization, Dark Mode Toggle, Auth Integration.
//  */

// import { useTheme } from '@/hooks/use-theme';
// import { useLanguage } from '@/hooks/use-language';
// import { useAuth } from '@/hooks/useAuth';
// import { 
//   Award, 
//   BookOpen, 
//   ChevronRight, 
//   CircleHelp, 
//   Heart, 
//   LogOut, 
//   Moon, 
//   ShieldCheck, 
//   User, 
//   Globe 
// } from 'lucide-react-native';
// import React, { useState } from 'react';
// import {
//   Image,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// export default function ProfileScreen() {
//   const { user, profile, signOut } = useAuth();
//   const { colors, isDark, toggleTheme } = useTheme();
//   const { t, setLanguage, language } = useLanguage();
//   const [isModalVisible, setIsModalVisible] = useState(false);

//   async function handleConfirmLogout() {
//     setIsModalVisible(false);
//     try { await signOut(); } catch (e) { console.error(e); }
//   }

//   const SettingRow = ({ icon: Icon, title, rightElement, onPress }: any) => (
//     <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
//       <View style={styles.settingLeft}>
//         <View style={[styles.settingIconWrapper, { backgroundColor: isDark ? '#2D3748' : '#F1F5F9' }]}>
//           <Icon size={20} color={colors.textSecondary} />
//         </View>
//         <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
//       </View>
//       {rightElement ? rightElement : <ChevronRight size={18} color="#A0A0A0" />}
//     </TouchableOpacity>
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
//         {/* Profile Card Header */}
//         <View style={[styles.profileHeaderCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//           <Image
//             source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' }}
//             style={[styles.avatarImage, { borderColor: colors.accent }]}
//           />
//           <Text style={[styles.profileName, { color: colors.text }]}>{profile?.name || 'Chef Master'}</Text>
//           <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profile?.email || user?.email || 'chef@cookubuddy.com'}</Text>
//         </View>

//         {/* Stats Matrix Deck Row */}
//         <View style={styles.statsContainer}>
//           { [ { icon: BookOpen, val: '42', label: 'Cooked', col: colors.accent },
//               { icon: Heart, val: '128', label: 'Favorites', col: '#EA4335' },
//               { icon: Award, val: 'Lvl 5', label: 'Rank', col: '#34A853' } ].map((stat, i) => (
//             <View key={i} style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//               <stat.icon size={20} color={stat.col} />
//               <Text style={[styles.statValue, { color: colors.text }]}>{stat.val}</Text>
//               <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Account Settings Section */}
//         <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t('account_settings')}</Text>
//         <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//           <SettingRow icon={User} title="Edit Profile Details" />
//           <SettingRow 
//             icon={Moon} 
//             title={t('dark_mode')} 
//             rightElement={
//               <Switch
//                 value={isDark}
//                 onValueChange={toggleTheme}
//                 trackColor={{ false: '#CBD5E1', true: colors.accent }}
//                 thumbColor="#FFFFFF"
//               />
//             }
//           />
//         </View>

//         {/* Support Section */}
//         <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t('support')}</Text>
//         <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
//           <SettingRow icon={ShieldCheck} title="Privacy Policy" />
//           <SettingRow icon={CircleHelp} title="Help Center" />
//         </View>

//         {/* Logout Action Button */}
//         <TouchableOpacity activeOpacity={0.8} onPress={() => setIsModalVisible(true)} style={styles.logoutButton}>
//           <LogOut size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
//           <Text style={styles.logoutButtonText}>{t('sign_out')}</Text>
//         </TouchableOpacity>

//       </ScrollView>

//       {/* Logout Confirmation Modal */}
//       <Modal visible={isModalVisible} transparent={true} animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
//             <View style={styles.modalIconCircle}><LogOut size={28} color="#EA4335" /></View>
//             <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Logout</Text>
//             <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>Are you sure you want to log out of CookuBuddy?</Text>
//             <View style={styles.modalActionRow}>
//               <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.modalBtn, styles.cancelBtn]}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
//               <TouchableOpacity onPress={handleConfirmLogout} style={[styles.modalBtn, styles.confirmBtn]}><Text style={styles.confirmBtnText}>Log Out</Text></TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollPadding: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },
//   profileHeaderCard: { alignItems: 'center', borderRadius: 24, paddingVertical: 28, borderWidth: 1, marginBottom: 20 },
//   avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, marginBottom: 14 },
//   profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
//   profileEmail: { fontSize: 14, fontWeight: '500' },
//   statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, gap: 12 },
//   statBox: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
//   statValue: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 2 },
//   statLabel: { fontSize: 12, fontWeight: '500' },
//   sectionHeading: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 4 },
//   settingsGroupCard: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, marginBottom: 24 },
//   settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
//   settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   settingIconWrapper: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
//   settingTitle: { fontSize: 15, fontWeight: '500' },
//   logoutButton: { flexDirection: 'row', height: 50, backgroundColor: '#EA4335', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
//   logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
//   modalContent: { borderRadius: 28, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
//   modalIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
//   modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
//   modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
//   modalActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
//   modalBtn: { flex: 1, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
//   cancelBtn: { backgroundColor: '#E2E8F0' },
//   cancelBtnText: { color: '#475569', fontSize: 15, fontWeight: '600' },
//   confirmBtn: { backgroundColor: '#EA4335' },
//   confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
// });



/**
 * CookuBuddy – Profile & Settings Screen
 * Warm editorial aesthetic: cream + terracotta + saffron gold
 */

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
};

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();

  // Local dark mode toggle (wire to your useTheme if needed)
  const [darkMode, setDarkMode]           = useState(false);
  const [logoutModal, setLogoutModal]     = useState(false);

  async function handleConfirmLogout() {
    setLogoutModal(false);
    try { await signOut(); } catch (e) { console.error(e); }
  }

  const SettingRow = ({ icon: Icon, label, right, onPress, iconBg }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.settingRow}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, { backgroundColor: iconBg || C.parchment }]}>
          <Icon size={18} color={C.terra} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {right ?? <ChevronRight size={16} color={C.inkLight} />}
    </TouchableOpacity>
  );

  const stats = [
    { icon: BookOpen, val: '42',   label: 'Cooked',    color: C.terra   },
    { icon: Heart,    val: '128',  label: 'Favorites', color: C.errorRed },
    { icon: Award,    val: 'Lv 5', label: 'Rank',      color: C.sage    },
  ];

  return (
    <View style={styles.root}>
      {/* Decorative blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Avatar card ── */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarRing}>
            <Image
              source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.profileName}>{profile?.name || 'Chef Master'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email || 'chef@cookubuddy.com'}</Text>
          <View style={styles.chefBadge}>
            <Text style={styles.chefBadgeText}>🍳 Home Chef</Text>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statBox}>
              <s.icon size={20} color={s.color} />
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Account settings ── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.settingsCard}>
          <SettingRow icon={User} label="Edit Profile" />
          <SettingRow
            icon={Moon}
            label="Dark Mode"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: C.border, true: C.terra }}
                thumbColor={C.white}
              />
            }
          />
        </View>

        {/* ── Support ── */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.settingsCard}>
          <SettingRow icon={ShieldCheck} label="Privacy Policy" />
          <SettingRow icon={CircleHelp} label="Help Center" />
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          onPress={() => setLogoutModal(true)}
          activeOpacity={0.85}
          style={styles.logoutBtn}
        >
          <LogOut size={18} color={C.white} />
          <Text style={styles.logoutText}>{t('sign_out')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>CookuBuddy v1.0 · Made with 🍅</Text>
      </ScrollView>

      {/* ── Logout confirmation modal ── */}
      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <LogOut size={26} color={C.errorRed} />
            </View>
            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to sign out of CookuBuddy?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setLogoutModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmLogout}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 },

  // Avatar card
  avatarCard: {
    backgroundColor: C.white, borderRadius: 28, padding: 28,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: C.terra,
    marginBottom: 14, padding: 2,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 46 },
  profileName: {
    fontFamily: 'Georgia', fontSize: 20, fontWeight: '700',
    color: C.ink, marginBottom: 4,
  },
  profileEmail: { fontSize: 13, color: C.inkLight, fontWeight: '500', marginBottom: 12 },
  chefBadge: {
    backgroundColor: C.terra + '14', paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: C.terra + '30',
  },
  chefBadgeText: { fontSize: 12, fontWeight: '700', color: C.terra },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statBox: {
    flex: 1, backgroundColor: C.white, borderRadius: 20, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statVal: {
    fontFamily: 'Georgia', fontSize: 17, fontWeight: '700',
    color: C.ink, marginTop: 8, marginBottom: 2,
  },
  statLbl: { fontSize: 11, fontWeight: '600', color: C.inkLight },

  // Section
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    color: C.inkLight, marginBottom: 10, paddingHorizontal: 4,
  },
  settingsCard: {
    backgroundColor: C.white, borderRadius: 20, paddingHorizontal: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 24,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border + '80',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  settingLabel: { fontSize: 15, fontWeight: '600', color: C.ink },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 54, borderRadius: 16, backgroundColor: C.terra, marginBottom: 20,
    shadowColor: C.terra, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10, elevation: 5,
  },
  logoutText: { color: C.white, fontSize: 16, fontWeight: '800' },

  versionText: {
    textAlign: 'center', fontSize: 12, color: C.inkLight,
    fontFamily: 'Georgia', fontStyle: 'italic',
  },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(44,26,14,0.45)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: C.cream, borderRadius: 28, padding: 28,
    width: '100%', maxWidth: 340, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  modalIconCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: C.errorRed + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Georgia', fontSize: 20, fontWeight: '700',
    color: C.ink, marginBottom: 8,
  },
  modalBody: {
    fontSize: 14, color: C.inkLight, textAlign: 'center',
    lineHeight: 20, marginBottom: 24,
  },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1, height: 48, borderRadius: 14, backgroundColor: C.parchment,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: C.inkLight },
  modalConfirmBtn: {
    flex: 1, height: 48, borderRadius: 14, backgroundColor: C.errorRed,
    justifyContent: 'center', alignItems: 'center',
  },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: C.white },
});