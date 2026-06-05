// /**
//  * CookuBuddy - Responsive Forgot Password Recovery Screen
//  */

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Spacing } from '@/constants/theme';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from 'expo-router';
// import { ArrowLeft, ChefHat, Mail } from 'lucide-react-native';
// import React, { useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   useWindowDimensions,
//   View,
// } from 'react-native';

// export default function ForgotPasswordScreen() {
//   const router = useRouter();
//   const theme = useTheme();
//   const { resetPassword } = useAuth();
//   const { width } = useWindowDimensions();

//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);

//   const isTablet = width > 768;
//   const contentWidth = isTablet ? 460 : '100%';

//   async function handleReset() {
//     if (!email) {
//       Alert.alert('Error', 'Please enter your registered email address.');
//       return;
//     }
//     setLoading(true);
//     try {
//       await resetPassword(email);
//       Alert.alert('Link Dispatched', 'Check your account inbox for recovery instructions.');
//       router.replace('/(auth)/login');
//     } catch (error: any) {
//       Alert.alert('Reset Failed', error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={[styles.container, { backgroundColor: theme.background }]}>
//       <ScrollView contentContainerStyle={[styles.scrollContainer, isTablet && styles.tabletCenter]} keyboardShouldPersistTaps="handled">
        
//         <View style={[styles.innerContainer, { width: contentWidth }]}>
//           {/* Header Back Button Arrow Link */}
//           <TouchableOpacity 
//             onPress={() => router.back()} 
//             style={styles.backButton}
//             activeOpacity={0.7}>
//             <ArrowLeft size={24} color={theme.text} />
//           </TouchableOpacity>

//           <View style={styles.headerSection}>
//             <View style={[styles.iconCircle, { backgroundColor: '#208AEF' + '15' }]}>
//               <ChefHat size={36} color="#208AEF" />
//             </View>
//             <ThemedText type="title" style={styles.title}>Recover Access</ThemedText>
//             <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>Enter your account email to receive a recovery link</ThemedText>
//           </View>

//           <ThemedView style={styles.form}>
//             <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email Address</ThemedText>
//             <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
//               <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
//               <TextInput
//                 onChangeText={setEmail}
//                 value={email}
//                 placeholder="email@address.com"
//                 placeholderTextColor={theme.textSecondary || '#A0A0A0'}
//                 autoCapitalize='none'
//                 keyboardType='email-address'
//                 style={[styles.input, { color: theme.text }]}
//               />
//             </View>

//             <TouchableOpacity
//               disabled={loading}
//               onPress={handleReset}
//               activeOpacity={0.8}
//               style={[styles.button, styles.shadow, { backgroundColor: '#208AEF' }]}>
//               {loading ? <ActivityIndicator color="white" /> : <ThemedText style={styles.buttonText}>Send Reset Link</ThemedText>}
//             </TouchableOpacity>
//           </ThemedView>
//         </View>

//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.five, paddingVertical: Spacing.six },
//   tabletCenter: { alignItems: 'center' },
//   innerContainer: { backgroundColor: 'transparent', width: '100%' },
//   backButton: { position: 'absolute', top: 0, left: 0, padding: Spacing.two, zIndex: 10 },
//   headerSection: { alignItems: 'center', marginBottom: Spacing.five, marginTop: Spacing.five },
//   iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.three },
//   title: { fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
//   subtitle: { textAlign: 'center', fontSize: 16, fontWeight: '500', marginTop: Spacing.one, paddingHorizontal: Spacing.three },
//   form: { width: '100%', backgroundColor: 'transparent' },
//   fieldLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.one, marginTop: Spacing.two },
//   inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 54, borderWidth: 1.5, borderRadius: Spacing.three, paddingHorizontal: Spacing.three, marginBottom: Spacing.four },
//   inputIcon: { marginRight: Spacing.two },
//   input: { flex: 1, height: '100%', fontSize: 16, fontWeight: '500' },
//   button: { height: 54, borderRadius: Spacing.three, justifyContent: 'center', alignItems: 'center' },
//   buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
//   shadow: { shadowColor: '#208AEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
// });




/**
 * CookuBuddy – Forgot Password Screen
 * Warm editorial aesthetic: cream + terracotta + saffron gold
 */

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

// ─── Design Tokens ────────────────────────────────────────────────
const C = {
  cream:      '#FDF6ED',
  parchment:  '#F5EBD8',
  terra:      '#C1440E',
  saffron:    '#E8A020',
  sage:       '#6B7C5C',
  ink:        '#2C1A0E',
  inkLight:   '#7A5C46',
  white:      '#FFFFFF',
  border:     '#E2CEB0',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [focused, setFocused] = useState(false);

  const isTablet = width > 768;
  const contentW = isTablet ? 460 : '100%';

  async function handleReset() {
    if (!email) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error: any) {
      Alert.alert('Reset Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <View style={[styles.inner, { width: contentW as any, alignSelf: 'center' }]}>

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={C.ink} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {sent ? (
          // ── Success state ──
          <View style={styles.successWrap}>
            <View style={[styles.iconPlate, { backgroundColor: C.sage }]}>
              <Text style={styles.iconEmoji}>📬</Text>
            </View>
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successBody}>
              We've sent a recovery link to{'\n'}
              <Text style={{ color: C.terra, fontWeight: '700' }}>{email}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.primaryBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Back to Sign In →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ── Form state ──
          <>
            <View style={styles.header}>
              <View style={styles.iconPlate}>
                <Text style={styles.iconEmoji}>🔑</Text>
              </View>
              <Text style={styles.brand}>CookuBuddy</Text>
              <Text style={styles.headline}>Recover Access</Text>
              <Text style={styles.subline}>
                Enter your email and we'll send{'\n'}a recovery link right away
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
                <Mail size={18} color={focused ? C.terra : C.inkLight} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Your registered email"
                  placeholderTextColor={C.inkLight + '80'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={styles.input}
                />
              </View>

              <View style={styles.hintRow}>
                <Text style={styles.hintText}>
                  💡 Check your spam folder if the email doesn't arrive within a few minutes.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
                style={styles.primaryBtn}
              >
                {loading ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link →</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remembered it? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream, justifyContent: 'center', paddingHorizontal: 20 },
  bgCircleTop: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: C.saffron + '1A', top: -70, right: -50,
  },
  bgCircleBottom: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: C.terra + '12', bottom: -50, left: -40,
  },
  inner: { backgroundColor: 'transparent' },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 28, alignSelf: 'flex-start',
    paddingVertical: 6, paddingHorizontal: 4,
  },
  backText: { fontSize: 14, fontWeight: '700', color: C.ink },

  header: { alignItems: 'center', marginBottom: 24 },
  iconPlate: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: C.terra,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: C.terra, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  iconEmoji: { fontSize: 40 },
  brand: {
    fontFamily: 'Georgia', fontSize: 22, fontWeight: '700',
    color: C.ink, letterSpacing: 0.5,
  },
  headline: {
    fontFamily: 'Georgia', fontSize: 22, fontWeight: '700',
    color: C.ink, marginTop: 14,
  },
  subline: {
    fontFamily: 'Georgia', fontSize: 14, color: C.inkLight,
    fontStyle: 'italic', marginTop: 6, textAlign: 'center', lineHeight: 20,
  },

  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 24,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
    borderWidth: 1, borderColor: C.border,
  },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    color: C.inkLight, marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', height: 52,
    backgroundColor: C.parchment, borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: C.border, gap: 10,
  },
  inputRowFocused: { borderColor: C.terra, backgroundColor: C.white },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: C.ink, height: '100%' },

  hintRow: {
    backgroundColor: C.saffron + '18', borderRadius: 12,
    padding: 12, marginTop: 14, marginBottom: 4,
  },
  hintText: { fontSize: 12, color: C.inkLight, lineHeight: 18 },

  primaryBtn: {
    height: 54, borderRadius: 16, backgroundColor: C.terra,
    justifyContent: 'center', alignItems: 'center', marginTop: 18,
    shadowColor: C.terra, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  footerText: { fontSize: 14, color: C.inkLight, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800', color: C.terra },

  // Success state
  successWrap: { alignItems: 'center', paddingVertical: 20 },
  successTitle: {
    fontFamily: 'Georgia', fontSize: 24, fontWeight: '700',
    color: C.ink, marginTop: 16,
  },
  successBody: {
    fontFamily: 'Georgia', fontSize: 15, color: C.inkLight,
    fontStyle: 'italic', textAlign: 'center', marginTop: 12,
    lineHeight: 22, marginBottom: 32,
  },
});