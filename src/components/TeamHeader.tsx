import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../store/AppContext';
import { theme } from '../utils/theme';
import { Chip } from './Chip';
import { TeamLogo } from './TeamLogo';

interface TeamHeaderProps {
  subtitle?: string;
  compact?: boolean;
  showRoleSwitcher?: boolean;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({
  subtitle,
  compact,
  showRoleSwitcher = true,
}) => {
  const { role, switchRole } = useAppContext();

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.identityRow}>
        <TeamLogo size={compact ? 44 : 52} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>Springfield Tigers</Text>
          <Text style={styles.subtitle}>{subtitle ?? 'Youth Baseball • Spring 2025'}</Text>
        </View>
      </View>
      {showRoleSwitcher && (
        <View style={styles.roleRow}>
          {(['Coach', 'Staff', 'Parent'] as const).map((item) => (
            <Chip
              key={item}
              label={item}
              active={role === item}
              onPress={() => switchRole(item)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  compact: {
    paddingVertical: theme.spacing.sm,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    marginLeft: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
  },
  roleRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
});
