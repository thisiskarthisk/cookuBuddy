import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
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
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { colors: theme } = useTheme();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <View style={[styles.bgCircleTop, { backgroundColor: theme.accentSecondary + '1A' }]} />
      <View style={[styles.bgCircleBottom, { backgroundColor: theme.accent + '12' }]} />

      <View style={[styles.inner, { width: contentW as any, alignSelf: 'center' }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>

        {sent ? (
          <View style={styles.successWrap}>
            <View style={[styles.iconPlate, { backgroundColor: theme.success }]}>
              <Mail size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>Check Your Inbox</Text>
            <Text style={[styles.successBody, { color: theme.textSecondary }]}>
              We&apos;ve sent a recovery link to{'\n'}
              <Text style={{ color: theme.accent, fontWeight: '700' }}>{email}</Text>
            </Text>
            <Button
              title="Back to Sign In →"
              onPress={() => router.replace('/(auth)/login')}
              style={{ width: '100%' }}
            />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={[styles.iconPlate, { backgroundColor: theme.accent, shadowColor: theme.accent }]}>
                <Image 
                  source={require('../../../assets/images/app-logo/icon4.png')} 
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
              <Text style={[styles.brand, { color: theme.text }]}>CookuBuddy</Text>
              <Text style={[styles.headline, { color: theme.text }]}>Recover Access</Text>
              <Text style={[styles.subline, { color: theme.textSecondary }]}>
                Enter your email and we&apos;ll send{'\n'}a recovery link right away
              </Text>
            </View>

            <Card>
              <Input
                label="Email Address"
                placeholder="Your registered email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                icon={<Mail size={18} color={theme.textSecondary} />}
              />

              <View style={[styles.hintRow, { backgroundColor: theme.accentSecondary + '18' }]}>
                <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                  💡 Check your spam folder if the email doesn&apos;t arrive within a few minutes.
                </Text>
              </View>

              <Button
                title="Send Reset Link →"
                onPress={handleReset}
                loading={loading}
                style={{ marginTop: 18 }}
              />
            </Card>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Remembered it? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: theme.accent }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  bgCircleTop: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    top: -70, right: -50,
  },
  bgCircleBottom: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    bottom: -50, left: -40,
  },
  inner: { backgroundColor: 'transparent' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 28, alignSelf: 'flex-start',
    paddingVertical: 6, paddingHorizontal: 4,
  },
  backText: { fontSize: 14, fontWeight: '700' },
  header: { alignItems: 'center', marginBottom: 24 },
  iconPlate: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
    overflow: 'hidden',
  },
  logoImage: { width: 110, height: 110 },
  brand: { fontSize: 22, fontWeight: '700', letterSpacing: 0.5 },
  headline: { fontSize: 22, fontWeight: '700', marginTop: 14 },
  subline: { fontSize: 14, fontStyle: 'italic', marginTop: 6, textAlign: 'center', lineHeight: 20 },
  hintRow: { borderRadius: 12, padding: 12, marginTop: 14, marginBottom: 4 },
  hintText: { fontSize: 12, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800' },
  successWrap: { alignItems: 'center', paddingVertical: 20 },
  successTitle: { fontSize: 24, fontWeight: '700', marginTop: 16 },
  successBody: { fontSize: 15, fontStyle: 'italic', textAlign: 'center', marginTop: 12, lineHeight: 22, marginBottom: 32 },
});
