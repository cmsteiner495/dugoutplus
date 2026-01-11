import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.buttonPrimaryBg,
  },
  secondary: {
    backgroundColor: theme.colors.buttonSecondaryBg,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  primaryText: {
    color: theme.colors.buttonPrimaryText,
  },
  secondaryText: {
    color: theme.colors.buttonSecondaryText,
  },
  ghostText: {
    color: theme.colors.buttonSecondaryText,
  },
});
