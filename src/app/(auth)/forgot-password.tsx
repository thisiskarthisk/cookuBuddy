/**
 * CookuBuddy - Responsive Forgot Password Recovery Screen
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChefHat, Mail } from 'lucide-react-native';
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { resetPassword } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isTablet = width > 768;
  const contentWidth = isTablet ? 460 : '100%';

  async function handleReset() {
    if (!email) {
      Alert.alert('Error', 'Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert('Link Dispatched', 'Check your account inbox for recovery instructions.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Reset Failed', error.message);
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
          {/* Header Back Button Arrow Link */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            activeOpacity={0.7}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={[styles.iconCircle, { backgroundColor: '#208AEF' + '15' }]}>
              <ChefHat size={36} color="#208AEF" />
            </View>
            <ThemedText type="title" style={styles.title}>Recover Access</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>Enter your account email to receive a recovery link</ThemedText>
          </View>

          <ThemedView style={styles.form}>
            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email Address</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="email@address.com"
                placeholderTextColor={theme.textSecondary || '#A0A0A0'}
                autoCapitalize='none'
                keyboardType='email-address'
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            <TouchableOpacity
              disabled={loading}
              onPress={handleReset}
              activeOpacity={0.8}
              style={[styles.button, styles.shadow, { backgroundColor: '#208AEF' }]}>
              {loading ? <ActivityIndicator color="white" /> : <ThemedText style={styles.buttonText}>Send Reset Link</ThemedText>}
            </TouchableOpacity>
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
  innerContainer: { backgroundColor: 'transparent', width: '100%' },
  backButton: { position: 'absolute', top: 0, left: 0, padding: Spacing.two, zIndex: 10 },
  headerSection: { alignItems: 'center', marginBottom: Spacing.five, marginTop: Spacing.five },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.three },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { textAlign: 'center', fontSize: 16, fontWeight: '500', marginTop: Spacing.one, paddingHorizontal: Spacing.three },
  form: { width: '100%', backgroundColor: 'transparent' },
  fieldLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.one, marginTop: Spacing.two },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 54, borderWidth: 1.5, borderRadius: Spacing.three, paddingHorizontal: Spacing.three, marginBottom: Spacing.four },
  inputIcon: { marginRight: Spacing.two },
  input: { flex: 1, height: '100%', fontSize: 16, fontWeight: '500' },
  button: { height: 54, borderRadius: Spacing.three, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  shadow: { shadowColor: '#208AEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
});