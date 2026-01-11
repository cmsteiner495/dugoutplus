import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../../store/AppContext';
import { theme } from '../../theme';
import { Chip } from './Chip';
import { ModeBannerToast } from './ModeBannerToast';
import { TeamLogo } from './TeamLogo';

interface TeamHeaderProps {
  subtitle?: string;
  compact?: boolean;
  showRoleSwitcher?: boolean;
}

const roleOptions = [
  { label: 'Coach', value: 'coach' },
  { label: 'Staff', value: 'staff' },
  { label: 'Parent', value: 'parent' },
] as const;

export const TeamHeader: React.FC<TeamHeaderProps> = ({
  subtitle,
  compact,
  showRoleSwitcher = true,
}) => {
  const { role, switchRole, team } = useAppContext();
  const [bannerMessage, setBannerMessage] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleRoleSwitch = (nextRole: typeof roleOptions[number]['value']) => {
    if (nextRole === role) {
      return;
    }
    switchRole(nextRole);
    const label = roleOptions.find((item) => item.value === nextRole)?.label ?? 'Member';
    setBannerMessage(`Viewing as ${label} — some tools are hidden`);
    setShowBanner(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setShowBanner(false), 2000);
  };

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.identityRow}>
        <TeamLogo size={compact ? 44 : 56} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>{team.name}</Text>
          <Text style={styles.subtitle}>{subtitle ?? team.season}</Text>
        </View>
      </View>
      {showRoleSwitcher && (
        <View style={styles.roleBlock}>
          <Text style={styles.roleLabel}>View as</Text>
          <View style={styles.roleRow}>
            {roleOptions.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                active={role === item.value}
                onPress={() => handleRoleSwitch(item.value)}
                style={styles.roleChip}
                tone={role === item.value ? 'gold' : 'neutral'}
              />
            ))}
          </View>
          <ModeBannerToast message={bannerMessage} visible={showBanner} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  compact: {
    paddingVertical: theme.spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    marginLeft: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.textSecondary,
  },
  roleBlock: {
    marginTop: theme.spacing.md,
  },
  roleLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  roleRow: {
    flexDirection: 'row',
  },
  roleChip: {
    marginRight: theme.spacing.sm,
  },
});
