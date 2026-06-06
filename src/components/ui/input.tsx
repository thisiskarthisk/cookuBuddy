import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, style, ...props }: InputProps) {
  const { colors: theme } = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
          focused && { borderColor: theme.accent, backgroundColor: theme.surface },
          error && { borderColor: theme.error },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textSecondary + '80'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  icon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
});
