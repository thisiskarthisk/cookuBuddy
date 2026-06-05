// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Spacing } from '@/constants/theme';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';

// export default function LoginScreen() {
//   const router = useRouter();
//   const theme = useTheme();
//   const { signIn, signUp } = useAuth();
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function signInWithEmail() {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please fill in all layout fields.');
//       return;
//     }
//     setLoading(true);
//     try {
//       await signIn(email, password);
//     } catch (error: any) {
//       Alert.alert('Login Failed', error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function signUpWithEmail() {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please fill in all layout fields.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const data = await signUp(email, password);
//       if (!data?.session) {
//         Alert.alert('Success', 'Please check your inbox for email verification!');
//       }
//     } catch (error: any) {
//       Alert.alert('Registration Failed', error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const inputStyle = [
//     styles.input,
//     {
//       backgroundColor: theme.backgroundElement,
//       color: theme.text,
//       borderColor: theme.backgroundSelected,
//     },
//   ];

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={[styles.container, { backgroundColor: theme.background }]}>
//       <ThemedView style={styles.innerContainer}>
//         <ThemedText type="title" style={styles.title}>CookuBuddy</ThemedText>
//         <ThemedText type="subtitle" style={styles.subtitle}>Sign in to continue cooking</ThemedText>

//         <ThemedView style={styles.form}>
//           <TextInput
//             onChangeText={setEmail}
//             value={email}
//             placeholder="email@address.com"
//             placeholderTextColor={theme.textSecondary}
//             autoCapitalize='none'
//             keyboardType='email-address'
//             style={inputStyle}
//           />
//           <TextInput
//             onChangeText={setPassword}
//             value={password}
//             placeholder="Password"
//             placeholderTextColor={theme.textSecondary}
//             secureTextEntry
//             autoCapitalize='none'
//             style={inputStyle}
//           />

//           <TouchableOpacity
//             disabled={loading}
//             onPress={signInWithEmail}
//             style={[styles.button, { backgroundColor: '#208AEF' }]}>
//             {loading ? <ActivityIndicator color="white" /> : <ThemedText style={styles.buttonText}>Sign In</ThemedText>}
//           </TouchableOpacity>

//           <TouchableOpacity
//             disabled={loading}
//             onPress={signUpWithEmail}
//             style={[styles.buttonOutline, { borderColor: '#208AEF' }]}>
//             <ThemedText style={[styles.buttonOutlineText, { color: '#208AEF' }]}>Sign Up</ThemedText>
//           </TouchableOpacity>
//         </ThemedView>
//       </ThemedView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.five },
//   title: { textAlign: 'center', marginBottom: Spacing.one },
//   subtitle: { textAlign: 'center', fontSize: 18, marginBottom: Spacing.six },
//   form: { gap: Spacing.three },
//   input: { height: 50, borderWidth: 1, borderRadius: Spacing.two, paddingHorizontal: Spacing.three, fontSize: 16 },
//   button: { height: 50, borderRadius: Spacing.two, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two },
//   buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
//   buttonOutline: { height: 50, borderRadius: Spacing.two, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
//   buttonOutlineText: { fontWeight: '600', fontSize: 16 },
// });

/**
 * CookuBuddy - Responsive Login Screen
 */

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Spacing } from '@/constants/theme';
// import { useTheme } from '@/hooks/use-theme';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from 'expo-router';
// import { ChefHat, Lock, Mail } from 'lucide-react-native';
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

// export default function LoginScreen() {
//   const router = useRouter();
//   const { colors: theme } = useTheme();
//   const { signIn } = useAuth();
//   const { width } = useWindowDimensions();
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Responsive UI adjustments based on standard screen breaking widths
//   const isTablet = width > 768;
//   const contentWidth = isTablet ? 460 : '100%';

//   async function signInWithEmail() {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please fill in all fields.');
//       return;
//     }
//     setLoading(true);
//     try {
//       await signIn(email, password);
//     } catch (error: any) {
//       Alert.alert('Login Failed', error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function signInWithGoogle() {
//     Alert.alert('Google Auth', 'OAuth pipeline initiated.');
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={[styles.container, { backgroundColor: theme.background }]}>
//       <ScrollView 
//         contentContainerStyle={[styles.scrollContainer, isTablet && styles.tabletCenter]}
//         keyboardShouldPersistTaps="handled">
        
//         <View style={[styles.innerContainer, { width: contentWidth }]}>
//           {/* Brand Header Section */}
//           <View style={styles.headerSection}>
//             <View style={[styles.iconCircle, { backgroundColor: '#208AEF' + '15' }]}>
//               <ChefHat size={36} color="#208AEF" />
//             </View>
//             <ThemedText type="title" style={[styles.title, { color: theme.text }]}>
//               CookuBuddy
//             </ThemedText>
//             <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
//               Sign in to continue cooking
//             </ThemedText>
//           </View>

//           <ThemedView style={styles.form}>
//             {/* Email input field */}
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

//             {/* Password input field */}
//             <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Password</ThemedText>
//             <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
//               <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
//               <TextInput
//                 onChangeText={setPassword}
//                 value={password}
//                 placeholder="Password"
//                 placeholderTextColor={theme.textSecondary || '#A0A0A0'}
//                 secureTextEntry
//                 autoCapitalize='none'
//                 style={[styles.input, { color: theme.text }]}
//               />
//             </View>

//             {/* Forgot Password Link */}
//             <TouchableOpacity 
//               activeOpacity={0.7} 
//               onPress={() => router.push('/(auth)/forgot-password')}
//               style={styles.forgotPasswordContainer}>
//               <ThemedText style={[styles.forgotPasswordText, { color: '#208AEF' }]}>
//                 Forgot Password?
//               </ThemedText>
//             </TouchableOpacity>

//             {/* Core Sign In Action Button */}
//             <TouchableOpacity
//               disabled={loading}
//               onPress={signInWithEmail}
//               activeOpacity={0.8}
//               style={[styles.button, styles.shadow, { backgroundColor: '#208AEF' }]}>
//               {loading ? <ActivityIndicator color="white" /> : <ThemedText style={styles.buttonText}>Sign In</ThemedText>}
//             </TouchableOpacity>

//             {/* Separation Splitter Line Section */}
//             <View style={styles.dividerRow}>
//               <View style={[styles.dividerLine, { backgroundColor: theme.backgroundSelected || '#E0E0E0' }]} />
//               <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>or continue with</ThemedText>
//               <View style={[styles.dividerLine, { backgroundColor: theme.backgroundSelected || '#E0E0E0' }]} />
//             </View>

//             {/* Social Sign In Button */}
//             <TouchableOpacity
//               disabled={loading}
//               onPress={signInWithGoogle}
//               activeOpacity={0.8}
//               style={[styles.googleButton, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected || '#E0E0E0' }]}>
//               <View style={styles.googleIconPlaceholder} />
//               <ThemedText style={[styles.googleButtonText, { color: theme.text }]}>Sign in with Google</ThemedText>
//             </TouchableOpacity>

//             {/* Navigate to Register */}
//             <View style={styles.footerRow}>
//               <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
//                 Don't have an account?{' '}
//               </ThemedText>
//               <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
//                 <ThemedText style={[styles.footerLink, { color: '#208AEF' }]}>Sign Up</ThemedText>
//               </TouchableOpacity>
//             </View>
//           </ThemedView>
//         </View>

//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// // Global uniform stylesheet shared parameters
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
//   forgotPasswordContainer: { alignSelf: 'flex-end', paddingVertical: Spacing.one, marginBottom: Spacing.two },
//   forgotPasswordText: { fontSize: 14, fontWeight: '600' },
//   button: { height: 54, borderRadius: Spacing.three, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.one },
//   buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
//   dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.four },
//   dividerLine: { flex: 1, height: 1.5 },
//   dividerText: { marginHorizontal: Spacing.three, fontSize: 14, fontWeight: '500' },
//   googleButton: { flexDirection: 'row', height: 54, borderRadius: Spacing.three, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
//   googleButtonText: { fontSize: 16, fontWeight: '600' },
//   googleIconPlaceholder: { width: 12, height: 12, backgroundColor: '#EA4335', borderRadius: 2, marginRight: 6 },
//   footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.five },
//   footerText: { fontSize: 15, fontWeight: '500' },
//   footerLink: { fontSize: 15, fontWeight: '700' },
//   shadow: { shadowColor: '#208AEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
// });



/**
 * CookuBuddy – Login Screen
 * Warm editorial aesthetic: cream + terracotta + saffron gold
 */

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
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
  errorRed:   '#D94040',
};

const { width: SCREEN_W } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const isTablet  = width > 768;
  const contentW  = isTablet ? 460 : '100%';

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 40, useNativeDriver: true }),
    ]).start();
  }

  async function handleSignIn() {
    if (!email || !password) {
      shake();
      Alert.alert('Missing Fields', 'Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      shake();
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    Alert.alert('Google Auth', 'OAuth pipeline initiated.');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      {/* ── Background decorative shapes ── */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <ScrollView
        contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { width: contentW as any }]}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.iconPlate}>
              <Text style={styles.iconEmoji}>🍳</Text>
            </View>
            <Text style={styles.brand}>CookuBuddy</Text>
            <Text style={styles.headline}>Welcome back, Chef</Text>
            <Text style={styles.subline}>Sign in to continue cooking</Text>
          </View>

          {/* ── Card ── */}
          <Animated.View
            style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
          >

            {/* Email */}
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={[styles.inputRow, focused === 'email' && styles.inputRowFocused]}>
              <Mail size={18} color={focused === 'email' ? C.terra : C.inkLight} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="chef@cookubuddy.com"
                placeholderTextColor={C.inkLight + '80'}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={styles.input}
              />
            </View>

            {/* Password */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>PASSWORD</Text>
            <View style={[styles.inputRow, focused === 'pw' && styles.inputRowFocused]}>
              <Lock size={18} color={focused === 'pw' ? C.terra : C.inkLight} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Your secret recipe key"
                placeholderTextColor={C.inkLight + '80'}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setFocused('pw')}
                onBlur={() => setFocused(null)}
                style={styles.input}
              />
            </View>

            {/* Forgot */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotRow}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.primaryBtn}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In →</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              onPress={handleGoogle}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.googleBtn}
            >
              <View style={styles.googleDot} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign Up</Text>
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
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: C.saffron + '1A',
    top: -100,
    right: -80,
  },
  bgCircleBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: C.terra + '12',
    bottom: -80,
    left: -60,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  scrollTablet: { alignItems: 'center' },

  inner: { backgroundColor: 'transparent' },

  // Header
  header: { alignItems: 'center', marginBottom: 28 },
  iconPlate: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.terra,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconEmoji: { fontSize: 40 },
  brand: {
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: C.ink,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  subline: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: C.inkLight,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: C.border,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.inkLight,
    marginBottom: 8,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: C.parchment,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 10,
  },
  inputRowFocused: {
    borderColor: C.terra,
    backgroundColor: C.white,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: C.ink,
    height: '100%',
  },

  forgotRow: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '700', color: C.terra },

  primaryBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: C.terra,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 12, color: C.inkLight, fontWeight: '600' },

  googleBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  googleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4285F4',
    borderWidth: 3,
    borderColor: '#EA4335',
  },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: C.ink },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: { fontSize: 14, color: C.inkLight, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800', color: C.terra },
});