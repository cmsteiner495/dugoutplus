import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface ModeBannerToastProps {
  message: string;
  visible: boolean;
}

export const ModeBannerToast: React.FC<ModeBannerToastProps> = ({ message, visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.medium,
    backgroundColor: theme.colors.warningBg,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
