import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({ label, active, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, active ? styles.active : styles.inactive, style]}
      onPress={onPress}
    >
      <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    marginRight: theme.spacing.xs,
  },
  active: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inactive: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  inactiveText: {
    color: theme.colors.text,
  },
});
