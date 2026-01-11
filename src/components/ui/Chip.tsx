import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: 'neutral' | 'gold' | 'dark';
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active,
  onPress,
  style,
  tone = 'neutral',
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, styles[tone], active && styles.active, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, styles[`${tone}Text`], active && styles.activeText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.round,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: theme.colors.chipInactiveBg,
    borderColor: theme.colors.border,
  },
  gold: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  dark: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  active: {
    backgroundColor: theme.colors.chipActiveBg,
    borderColor: theme.colors.chipActiveBg,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  neutralText: {
    color: theme.colors.chipInactiveText,
  },
  goldText: {
    color: theme.colors.primaryTextOnPrimary,
  },
  darkText: {
    color: theme.colors.primary,
  },
  activeText: {
    color: theme.colors.chipActiveText,
  },
});
