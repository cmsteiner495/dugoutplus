import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TeamHeader } from '../components/ui/TeamHeader';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';

const roleLabelMap = {
  coach: 'Coach',
  staff: 'Staff',
  parent: 'Parent',
};

export const RosterScreen: React.FC = () => {
  const { members, role, toggleStaffAuthorized } = useAppContext();

  const coaches = members.filter((member) => member.role === 'coach');
  const staff = members.filter((member) => member.role === 'staff');
  const parents = members.filter((member) => member.role === 'parent');

  const renderMember = (memberId: string, name: string, memberRole: keyof typeof roleLabelMap, authorized?: boolean) => (
    <Card key={memberId} style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{roleLabelMap[memberRole]}</Text>
        </View>
        {memberRole === 'staff' ? (
          role === 'coach' ? (
            <View style={styles.toggle}>
              <Text style={styles.toggleLabel}>Authorized</Text>
              <Switch
                value={!!authorized}
                onValueChange={() => toggleStaffAuthorized(memberId)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.primary}
                ios_backgroundColor={theme.colors.border}
              />
            </View>
          ) : (
            <View style={styles.badgeColumn}>
              <Chip
                label={
                  authorized
                    ? 'Authorized to post official updates'
                    : 'Not authorized'
                }
                tone={authorized ? 'gold' : 'neutral'}
                style={styles.badge}
              />
              <Text style={styles.readOnly}>Read-only</Text>
            </View>
          )
        ) : null}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Roster" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <SectionHeader title="Coaches" />
        {coaches.map((member) => renderMember(member.id, member.name, 'coach'))}

        <SectionHeader title="Staff" />
        {staff.map((member) => renderMember(member.id, member.name, 'staff', member.authorized))}

        <SectionHeader title="Parents" />
        {parents.map((member) => renderMember(member.id, member.name, 'parent'))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  role: {
    color: theme.colors.textSecondary,
  },
  toggle: {
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  badgeColumn: {
    alignItems: 'flex-end',
  },
  badge: {
    marginBottom: theme.spacing.xs,
  },
  readOnly: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});
