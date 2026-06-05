// /**
//  * CookuBuddy - Responsive Register Screen
//  */

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Spacing } from '@/constants/theme';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from 'expo-router';
// import { ChefHat, Lock, Mail, User } from 'lucide-react-native';
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

// export default function RegisterScreen() {
//   const router = useRouter();
//   const theme = useTheme();
//   const { signUp } = useAuth();
//   const { width } = useWindowDimensions();

//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const isTablet = width > 768;
//   const contentWidth = isTablet ? 460 : '100%';

//   async function handleRegister() {
//     if (!fullName || !email || !password || !confirmPassword) {
//       Alert.alert('Error', 'Please complete all fields.');
//       return;
//     }
//     if (password !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match.');
//       return;
//     }
//     if (password.length < 6) {
//       Alert.alert('Error', 'Password must be at least 6 characters.');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Passes parameters safely down to your global auth hook setup
//       const data = await signUp(email, password, { full_name: fullName });
      
//       if (data?.session) {
//         // If email confirmation is OFF, we get a session immediately
//         router.replace('/');
//       } else {
//         // If email confirmation is ON
//         Alert.alert('Verify Email', 'Please check your inbox to confirm registration.');
//         router.replace('/(auth)/login');
//       }
//     } catch (error: any) {
//       Alert.alert('Registration Failed', error.message);
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
//           <View style={styles.headerSection}>
//             <View style={[styles.iconCircle, { backgroundColor: '#208AEF' + '15' }]}>
//               <ChefHat size={36} color="#208AEF" />
//             </View>
//             <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
//             <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>Join us to find elite cooking metrics</ThemedText>
//           </View>

//           <ThemedView style={styles.form}>
//             {/* Full Name */}
//             <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Full Name</ThemedText>
//             <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
//               <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
//               <TextInput
//                 onChangeText={setFullName}
//                 value={fullName}
//                 placeholder="Chef Name"
//                 placeholderTextColor={theme.textSecondary || '#A0A0A0'}
//                 style={[styles.input, { color: theme.text }]}
//               />
//             </View>

//             {/* Email */}
//             <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email Address</ThemedText>
//             <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
//               <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
//               <TextInput
//                 onChangeText={setEmail}
//                 value={email}
//                 placeholder="chef@cookubuddy.com"
//                 placeholderTextColor={theme.textSecondary || '#A0A0A0'}
//                 autoCapitalize='none'
//                 keyboardType='email-address'
//                 style={[styles.input, { color: theme.text }]}
//               />
//             </View>

//             {/* Password */}
//             <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Password</ThemedText>
//             <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
//               <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
//               <TextInput
//                 onChangeText={setPassword}
//                 value={password}
//                 placeholder="Min 6 characters"
//                 placeholderTextColor={theme.textSecondary || '#A0A0A0'}
//                 secureTextEntry
//                 autoCapitalize='none'
//                 style={[styles.input, { color: theme.text }]}
//               />
//             </View>

//             {/* Confirm Password */}
//             <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Confirm Password</ThemedText>
//             <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
//               <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
//               <TextInput
//                 onChangeText={setConfirmPassword}
//                 value={confirmPassword}
//                 placeholder="Repeat password"
//                 placeholderTextColor={theme.textSecondary || '#A0A0A0'}
//                 secureTextEntry
//                 autoCapitalize='none'
//                 style={[styles.input, { color: theme.text }]}
//               />
//             </View>

//             <TouchableOpacity
//               disabled={loading}
//               onPress={handleRegister}
//               activeOpacity={0.8}
//               style={[styles.button, styles.shadow, { backgroundColor: '#208AEF' }]}>
//               {loading ? <ActivityIndicator color="white" /> : <ThemedText style={styles.buttonText}>Sign Up</ThemedText>}
//             </TouchableOpacity>

//             <View style={styles.footerRow}>
//               <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </ThemedText>
//               <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
//                 <ThemedText style={[styles.footerLink, { color: '#208AEF' }]}>Sign In</ThemedText>
//               </TouchableOpacity>
//             </View>
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
//   innerContainer: { backgroundColor: 'transparent' },
//   headerSection: { alignItems: 'center', marginBottom: Spacing.four },
//   iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.three },
//   title: { fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
//   subtitle: { textAlign: 'center', fontSize: 16, fontWeight: '500', marginTop: Spacing.one },
//   form: { width: '100%', backgroundColor: 'transparent' },
//   fieldLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.one, marginTop: Spacing.two },
//   inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 54, borderWidth: 1.5, borderRadius: Spacing.three, paddingHorizontal: Spacing.three, marginBottom: Spacing.one },
//   inputIcon: { marginRight: Spacing.two },
//   input: { flex: 1, height: '100%', fontSize: 16, fontWeight: '500' },
//   button: { height: 54, borderRadius: Spacing.three, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.four },
//   buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
//   footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.five },
//   footerText: { fontSize: 15, fontWeight: '500' },
//   footerLink: { fontSize: 15, fontWeight: '700' },
//   shadow: { shadowColor: '#208AEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
// });



/**
 * CookuBuddy – Register Screen
 * Warm editorial aesthetic: cream + terracotta + saffron gold
 */

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  terraLight: '#E8622A',
  saffron:    '#E8A020',
  sage:       '#6B7C5C',
  ink:        '#2C1A0E',
  inkLight:   '#7A5C46',
  white:      '#FFFFFF',
  border:     '#E2CEB0',
};

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { width } = useWindowDimensions();

  const [fullName, setFullName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]               = useState(false);
  const [focused, setFocused]               = useState<string | null>(null);

  const isTablet = width > 768;
  const contentW = isTablet ? 460 : '100%';

  // Password strength
  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = [C.border, '#E85555', C.saffron, C.sage];

  async function handleRegister() {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Incomplete', 'Please complete all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await signUp(email, password, { full_name: fullName });
      if (data?.session) {
        router.replace('/');
      } else {
        Alert.alert('Verify Email', 'Check your inbox to confirm registration.');
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { id: 'name',    label: 'FULL NAME',        icon: User,  value: fullName,         setter: setFullName,         placeholder: 'Your chef name',       secure: false, keyboard: 'default'       as any },
    { id: 'email',   label: 'EMAIL ADDRESS',     icon: Mail,  value: email,            setter: setEmail,            placeholder: 'chef@cookubuddy.com',  secure: false, keyboard: 'email-address' as any },
    { id: 'pw',      label: 'PASSWORD',          icon: Lock,  value: password,         setter: setPassword,         placeholder: 'Min 6 characters',     secure: true,  keyboard: 'default'       as any },
    { id: 'cpw',     label: 'CONFIRM PASSWORD',  icon: Lock,  value: confirmPassword,  setter: setConfirmPassword,  placeholder: 'Repeat password',      secure: true,  keyboard: 'default'       as any },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <ScrollView
        contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { width: contentW as any }]}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconPlate}>
              <Text style={styles.iconEmoji}>👨‍🍳</Text>
            </View>
            <Text style={styles.brand}>CookuBuddy</Text>
            <Text style={styles.headline}>Create Your Account</Text>
            <Text style={styles.subline}>Join thousands of home chefs</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>

            {fields.map(({ id, label, icon: Icon, value, setter, placeholder, secure, keyboard }) => (
              <View key={id} style={{ marginBottom: id === 'pw' ? 10 : 16 }}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <View style={[styles.inputRow, focused === id && styles.inputRowFocused]}>
                  <Icon size={18} color={focused === id ? C.terra : C.inkLight} />
                  <TextInput
                    value={value}
                    onChangeText={setter}
                    placeholder={placeholder}
                    placeholderTextColor={C.inkLight + '80'}
                    autoCapitalize="none"
                    keyboardType={keyboard}
                    secureTextEntry={secure}
                    onFocus={() => setFocused(id)}
                    onBlur={() => setFocused(null)}
                    style={styles.input}
                  />
                </View>
              </View>
            ))}

            {/* Password strength meter */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: strength >= i ? strengthColors[strength] : C.border },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
                  {strengthLabels[strength]}
                </Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.primaryBtn, { marginTop: password.length > 0 ? 18 : 8 }]}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account →</Text>
              )}
            </TouchableOpacity>

            {/* Terms note */}
            <Text style={styles.termsText}>
              By signing up you agree to our{' '}
              <Text style={{ color: C.terra, fontWeight: '700' }}>Terms</Text> &{' '}
              <Text style={{ color: C.terra, fontWeight: '700' }}>Privacy Policy</Text>
            </Text>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  bgCircleTop: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: C.terra + '14', top: -70, right: -60,
  },
  bgCircleBottom: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: C.saffron + '18', bottom: -60, left: -50,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 48 },
  scrollTablet: { alignItems: 'center' },
  inner: { backgroundColor: 'transparent' },
  header: { alignItems: 'center', marginBottom: 24 },
  iconPlate: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: C.saffron,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: C.saffron, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  iconEmoji: { fontSize: 40 },
  brand: {
    fontFamily: 'Georgia', fontSize: 24, fontWeight: '700',
    color: C.ink, letterSpacing: 0.5,
  },
  headline: {
    fontFamily: 'Georgia', fontSize: 20, fontWeight: '700',
    color: C.ink, marginTop: 14, letterSpacing: 0.3,
  },
  subline: {
    fontFamily: 'Georgia', fontSize: 14, color: C.inkLight,
    fontStyle: 'italic', marginTop: 4,
  },
  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 24,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
    borderWidth: 1, borderColor: C.border,
  },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    color: C.inkLight, marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', height: 52,
    backgroundColor: C.parchment, borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: C.border, gap: 10,
  },
  inputRowFocused: { borderColor: C.terra, backgroundColor: C.white },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: C.ink, height: '100%' },

  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 44, textAlign: 'right' },

  primaryBtn: {
    height: 54, borderRadius: 16, backgroundColor: C.terra,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.terra, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  termsText: {
    fontSize: 11, color: C.inkLight, textAlign: 'center',
    marginTop: 14, lineHeight: 16,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  footerText: { fontSize: 14, color: C.inkLight, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800', color: C.terra },
});