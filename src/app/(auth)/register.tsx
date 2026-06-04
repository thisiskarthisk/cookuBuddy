/**
 * CookuBuddy - Responsive Register Screen
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { ChefHat, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signUp } = useAuth();
  const { width } = useWindowDimensions();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isTablet = width > 768;
  const contentWidth = isTablet ? 460 : '100%';

  async function handleRegister() {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please complete all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Passes parameters safely down to your global auth hook setup
      const data = await signUp(email, password, { full_name: fullName });
      
      if (data?.session) {
        // If email confirmation is OFF, we get a session immediately
        router.replace('/');
      } else {
        // If email confirmation is ON
        Alert.alert('Verify Email', 'Please check your inbox to confirm registration.');
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, isTablet && styles.tabletCenter]} keyboardShouldPersistTaps="handled">
        
        <View style={[styles.innerContainer, { width: contentWidth }]}>
          <View style={styles.headerSection}>
            <View style={[styles.iconCircle, { backgroundColor: '#208AEF' + '15' }]}>
              <ChefHat size={36} color="#208AEF" />
            </View>
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>Join us to find elite cooking metrics</ThemedText>
          </View>

          <ThemedView style={styles.form}>
            {/* Full Name */}
            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Full Name</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                onChangeText={setFullName}
                value={fullName}
                placeholder="Chef Name"
                placeholderTextColor={theme.textSecondary || '#A0A0A0'}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            {/* Email */}
            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email Address</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="chef@cookubuddy.com"
                placeholderTextColor={theme.textSecondary || '#A0A0A0'}
                autoCapitalize='none'
                keyboardType='email-address'
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            {/* Password */}
            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Password</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="Min 6 characters"
                placeholderTextColor={theme.textSecondary || '#A0A0A0'}
                secureTextEntry
                autoCapitalize='none'
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            {/* Confirm Password */}
            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Confirm Password</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                placeholder="Repeat password"
                placeholderTextColor={theme.textSecondary || '#A0A0A0'}
                secureTextEntry
                autoCapitalize='none'
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            <TouchableOpacity
              disabled={loading}
              onPress={handleRegister}
              activeOpacity={0.8}
              style={[styles.button, styles.shadow, { backgroundColor: '#208AEF' }]}>
              {loading ? <ActivityIndicator color="white" /> : <ThemedText style={styles.buttonText}>Sign Up</ThemedText>}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <ThemedText style={[styles.footerLink, { color: '#208AEF' }]}>Sign In</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.five, paddingVertical: Spacing.six },
  tabletCenter: { alignItems: 'center' },
  innerContainer: { backgroundColor: 'transparent' },
  headerSection: { alignItems: 'center', marginBottom: Spacing.four },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.three },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { textAlign: 'center', fontSize: 16, fontWeight: '500', marginTop: Spacing.one },
  form: { width: '100%', backgroundColor: 'transparent' },
  fieldLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.one, marginTop: Spacing.two },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 54, borderWidth: 1.5, borderRadius: Spacing.three, paddingHorizontal: Spacing.three, marginBottom: Spacing.one },
  inputIcon: { marginRight: Spacing.two },
  input: { flex: 1, height: '100%', fontSize: 16, fontWeight: '500' },
  button: { height: 54, borderRadius: Spacing.three, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.four },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.five },
  footerText: { fontSize: 15, fontWeight: '500' },
  footerLink: { fontSize: 15, fontWeight: '700' },
  shadow: { shadowColor: '#208AEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
});