import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';

interface EmptyStateProps {
  title: string;
  message: string;
  ctaLabel?: string;
  onPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  ctaLabel,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>SB</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {ctaLabel && onPress && (
        <TouchableOpacity onPress={onPress} style={styles.cta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.medium,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconText: {
    fontWeight: '700',
    color: theme.colors.primaryTextOnPrimary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cta: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.buttonPrimaryBg,
  },
  ctaText: {
    fontWeight: '600',
    color: theme.colors.buttonPrimaryText,
  },
});
