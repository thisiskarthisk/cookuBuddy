import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function Button({
  title,
  loading,
  variant = 'primary',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors: theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.accent,
          shadowColor: theme.accent,
        };
      case 'secondary':
        return {
          backgroundColor: theme.accentSecondary,
          shadowColor: theme.accentSecondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.accent,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return { color: '#FFFFFF' };
      case 'outline':
      case 'ghost':
        return { color: theme.accent };
      default:
        return { color: theme.text };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading || disabled}
      style={[
        styles.button,
        getVariantStyle(),
        (variant === 'primary' || variant === 'secondary') && styles.shadow,
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? theme.accent : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
