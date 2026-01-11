import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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
  const [tooltip, setTooltip] = useState<{ title: string; description: string } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const coaches = members.filter((member) => member.role === 'coach');
  const staff = members.filter((member) => member.role === 'staff');
  const parents = members.filter((member) => member.role === 'parent');

  const permissionMap = useMemo(
    () => ({
      post_updates: {
        label: 'Authorized to post official updates',
        description: 'Can post official announcements to the team channel.',
      },
      review_updates: {
        label: 'Can review updates',
        description: 'Can review confirmations and manage official updates.',
      },
      volunteer_lead: {
        label: 'Volunteer coordinator',
        description: 'Can organize volunteers and assign coverage.',
      },
      check_in_support: {
        label: 'Check-in support',
        description: 'Can help with attendance check-ins.',
      },
      carpool: {
        label: 'Carpool helper',
        description: 'Can offer carpool or transportation support.',
      },
      volunteer: {
        label: 'Volunteer helper',
        description: 'Can help with volunteer tasks when needed.',
      },
    }),
    []
  );

  const renderPermissions = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0 || role !== 'coach') {
      return null;
    }
    return (
      <View style={styles.permissionRow}>
        {permissions.map((permission) => {
          const info = permissionMap[permission as keyof typeof permissionMap];
          if (!info) {
            return null;
          }
          return (
            <Pressable
              key={permission}
              onPress={() => setTooltip({ title: info.label, description: info.description })}
            >
              <Chip label={info.label} tone="gold" style={styles.permissionChip} />
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderMember = (
    memberId: string,
    name: string,
    memberRole: keyof typeof roleLabelMap,
    authorized?: boolean,
    permissions?: string[],
    emergencyContactOnFile?: boolean
  ) => (
    <Card key={memberId} style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{roleLabelMap[memberRole]}</Text>
          {role === 'coach' && (
            <Text style={styles.contactIndicator}>
              {emergencyContactOnFile ? '✅ Emergency contact on file' : '⚠️ Missing emergency contact'}
            </Text>
          )}
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
      {memberRole !== 'coach' && renderPermissions(permissions)}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Roster" />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <SectionHeader title="Coaches" />
        {coaches.map((member) =>
          renderMember(
            member.id,
            member.name,
            'coach',
            member.authorized,
            member.permissions,
            member.emergencyContactOnFile
          )
        )}

        <SectionHeader title="Staff" />
        {staff.map((member) =>
          renderMember(
            member.id,
            member.name,
            'staff',
            member.authorized,
            member.permissions,
            member.emergencyContactOnFile
          )
        )}

        <SectionHeader title="Parents" />
        {parents.map((member) =>
          renderMember(
            member.id,
            member.name,
            'parent',
            member.authorized,
            member.permissions,
            member.emergencyContactOnFile
          )
        )}
      </ScrollView>

      <Modal transparent visible={!!tooltip} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setTooltip(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{tooltip?.title}</Text>
            <Text style={styles.modalBody}>{tooltip?.description}</Text>
            <Pressable style={styles.modalButton} onPress={() => setTooltip(null)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  contactIndicator: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  permissionRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.large,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalBody: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  modalButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.medium,
  },
  modalButtonText: {
    fontWeight: '600',
    color: theme.colors.primaryTextOnPrimary,
  },
});
