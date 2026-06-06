import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors: theme } = useTheme();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const isTablet = width > 768;
  const contentW = isTablet ? 460 : '100%';

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <View style={[styles.bgCircleTop, { backgroundColor: theme.accentSecondary + '1A' }]} />
      <View style={[styles.bgCircleBottom, { backgroundColor: theme.accent + '12' }]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { width: contentW as any }]}>
          <TouchableOpacity 
            onPress={() => router.replace('/(tab)')} 
            style={styles.backToHome}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={theme.textSecondary} />
            <Text style={[styles.backToHomeText, { color: theme.textSecondary }]}>Back to Recipes</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconPlate}>
  <Image
    source={require('../../../assets/images/app-logo/icon4.png')}
    style={styles.logoImage}
    contentFit="contain"
  />
</View>
            <Text style={[styles.brand, { color: theme.text }]}>CookuBuddy</Text>
            <Text style={[styles.headline, { color: theme.text }]}>Welcome back, Chef</Text>
            <Text style={[styles.subline, { color: theme.textSecondary }]}>Sign in to continue cooking</Text>
          </View>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <Card>
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
                placeholder="Your secret recipe key"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                icon={<Lock size={18} color={theme.textSecondary} />}
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotRow}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotText, { color: theme.accent }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In →"
                onPress={handleSignIn}
                loading={loading}
              />

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or continue with</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <Button
                variant="outline"
                title="Continue with Google"
                onPress={() => Alert.alert('Google Auth', 'OAuth pipeline initiated.')}
              />
            </Card>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
              <Text style={[styles.footerLink, { color: theme.accent }]}>Sign Up</Text>
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
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -100,
    right: -80,
  },
  bgCircleBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
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
  backToHome: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, alignSelf: 'flex-start' },
  backToHomeText: { fontSize: 14, fontWeight: '700' },
  // header: { alignItems: 'center', marginBottom: 28 },
  // iconPlate: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 24,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginBottom: 14,
  //   shadowOffset: { width: 0, height: 8 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 16,
  //   elevation: 10,
  //   overflow: 'hidden',
  // },
  // logoImage: { width: 110, height: 110 , backgroundColor: 'none' },
  header: {
  alignItems: 'center',
  marginBottom: 28,
},

iconPlate: {
  width: 100,
  height: 100,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,

  // Remove background
  backgroundColor: 'transparent',

  // Optional: remove shadow too
  elevation: 0,
  shadowOpacity: 0,
},

logoImage: {
  width: 100,
  height: 100,
},
  brand: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5 },
  headline: { fontSize: 20, fontWeight: '700', marginTop: 16, letterSpacing: 0.3 },
  subline: { fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -Spacing.one, marginBottom: Spacing.four },
  forgotText: { fontSize: 13, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800' },
});
