import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
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
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors: theme } = useTheme();
  const { width } = useWindowDimensions();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isTablet = width > 768;
  const contentW = isTablet ? 460 : '100%';

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = [theme.border, theme.error, theme.accentSecondary, theme.success];

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
        router.replace('/(tab)');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <View style={[styles.bgCircleTop, { backgroundColor: theme.accent + '14' }]} />
      <View style={[styles.bgCircleBottom, { backgroundColor: theme.accentSecondary + '18' }]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { width: contentW as any }]}>
          <View style={styles.header}>
            <View style={[styles.iconPlate, { backgroundColor: theme.accentSecondary, shadowColor: theme.accentSecondary }]}>
              <Image 
                source={require('../../../assets/images/app-logo/icon4.png')} 
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
            <Text style={[styles.brand, { color: theme.text }]}>CookuBuddy</Text>
            <Text style={[styles.headline, { color: theme.text }]}>Create Your Account</Text>
            <Text style={[styles.subline, { color: theme.textSecondary }]}>Join thousands of home chefs</Text>
          </View>

          <Card>
            <Input
              label="Full Name"
              placeholder="Your chef name"
              value={fullName}
              onChangeText={setFullName}
              icon={<User size={18} color={theme.textSecondary} />}
            />
            <Input
              label="Email Address"
              placeholder="chef@cookubuddy.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail size={18} color={theme.textSecondary} />}
            />
            <Input
              label="Password"
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              icon={<Lock size={18} color={theme.textSecondary} />}
            />
            <Input
              label="Confirm Password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              icon={<Lock size={18} color={theme.textSecondary} />}
            />

            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: strength >= i ? strengthColors[strength] : theme.border },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
                  {strengthLabels[strength]}
                </Text>
              </View>
            )}

            <Button
              title="Create Account →"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <Text style={[styles.termsText, { color: theme.textSecondary }]}>
              By signing up you agree to our{' '}
              <Text style={{ color: theme.accent, fontWeight: '700' }}>Terms</Text> &{' '}
              <Text style={{ color: theme.accent, fontWeight: '700' }}>Privacy Policy</Text>
            </Text>
          </Card>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
              <Text style={[styles.footerLink, { color: theme.accent }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgCircleTop: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    top: -70, right: -60,
  },
  bgCircleBottom: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    bottom: -60, left: -50,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 48 },
  scrollTablet: { alignItems: 'center' },
  inner: { backgroundColor: 'transparent' },
  header: { alignItems: 'center', marginBottom: 24 },
  iconPlate: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
    overflow: 'hidden',
  },
  logoImage: { width: 110, height: 110 },
  brand: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5 },
  headline: { fontSize: 20, fontWeight: '700', marginTop: 14, letterSpacing: 0.3 },
  subline: { fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: -8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 44, textAlign: 'right' },
  termsText: { fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800' },
});
