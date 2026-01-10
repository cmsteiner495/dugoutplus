import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { TeamHeader } from '../components/TeamHeader';
import { useAppContext } from '../store/AppContext';
import { theme } from '../utils/theme';

export const HomeScreen: React.FC = () => {
  const { events, messages, currentMemberId } = useAppContext();

  const nextEvent = useMemo(() => {
    return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  }, [events]);

  const pinnedAnnouncement = useMemo(() => {
    return messages.find(
      (message) => message.type === 'announcement' && message.pinned
    );
  }, [messages]);

  const pendingConfirmations = useMemo(() => {
    return messages.filter(
      (message) =>
        message.type === 'announcement' &&
        message.requiresConfirmation &&
        !message.confirmations.includes(currentMemberId)
    ).length;
  }, [messages, currentMemberId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Home dashboard" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Official updates</Text>
          <Text style={styles.count}>{pendingConfirmations} pending confirmations</Text>
        </Card>

        <Card style={styles.card}>
          <TeamHeader subtitle="Next event" compact showRoleSwitcher={false} />
          {nextEvent ? (
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>{nextEvent.title}</Text>
              <Text style={styles.eventMeta}>{nextEvent.location}</Text>
              <Text style={styles.eventMeta}>{new Date(nextEvent.startsAt).toLocaleString()}</Text>
            </View>
          ) : (
            <Text>No events scheduled.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Pinned announcement</Text>
          <Text style={styles.eventMeta}>{pinnedAnnouncement?.content ?? 'No pinned posts yet.'}</Text>
        </Card>
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
    paddingBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  eventBody: {
    marginTop: theme.spacing.sm,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventMeta: {
    color: theme.colors.muted,
  },
});
