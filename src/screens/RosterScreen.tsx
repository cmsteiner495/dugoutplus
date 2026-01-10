import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { TeamHeader } from '../components/TeamHeader';
import { useAppContext } from '../store/AppContext';
import { theme } from '../utils/theme';

export const RosterScreen: React.FC = () => {
  const { members, role, toggleStaffAuthorized } = useAppContext();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Roster" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {members.map((member) => (
          <Card key={member.id} style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{member.name}</Text>
                <Text style={styles.role}>{member.role}</Text>
              </View>
              {member.role === 'Staff' && role === 'Coach' && (
                <View style={styles.toggle}>
                  <Text style={styles.toggleLabel}>Authorized</Text>
                  <Switch
                    value={!!member.authorized}
                    onValueChange={() => toggleStaffAuthorized(member.id)}
                  />
                </View>
              )}
            </View>
          </Card>
        ))}
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
    padding: theme.spacing.md,
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
  },
  role: {
    color: theme.colors.muted,
  },
  toggle: {
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    color: theme.colors.muted,
  },
});
