import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';
import { RSVPStatus } from '../models/types';

const rsvpOptions: RSVPStatus[] = ['Going', 'Maybe', 'No'];

export const HomeScreen: React.FC = () => {
  const { events, messages, currentMemberId, setRsvp } = useAppContext();

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

  const currentStatus = nextEvent
    ? nextEvent.rsvps.find((rsvp) => rsvp.memberId === currentMemberId)?.status
    : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Home dashboard" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Official updates</Text>
          {pendingConfirmations > 0 ? (
            <View style={styles.pendingCallout}>
              <Text style={styles.pendingText}>
                {pendingConfirmations} updates awaiting confirmation
              </Text>
              <Button label="Review updates" onPress={() => {}} />
            </View>
          ) : (
            <Text style={styles.mutedText}>All caught up on official updates.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Next event</Text>
          {nextEvent ? (
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>{nextEvent.title}</Text>
              <Text style={styles.eventMeta}>{nextEvent.location}</Text>
              <Text style={styles.eventMeta}>
                {new Date(nextEvent.startsAt).toLocaleString()}
              </Text>
              <View style={styles.rsvpRow}>
                {rsvpOptions.map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    active={currentStatus === status}
                    onPress={() => setRsvp(nextEvent.id, status)}
                    style={styles.rsvpChip}
                  />
                ))}
              </View>
            </View>
          ) : (
            <EmptyState
              title="No upcoming events"
              message="Your next practice or game will show up here once scheduled."
            />
          )}
        </Card>

        <Card style={[styles.card, styles.pinnedCard]}>
          <View style={styles.pinnedHeader}>
            <Text style={styles.sectionTitle}>Pinned announcement</Text>
            <Chip label="Pinned" tone="gold" />
          </View>
          {pinnedAnnouncement ? (
            <Text style={styles.eventMeta}>{pinnedAnnouncement.content}</Text>
          ) : (
            <EmptyState
              title="Nothing pinned"
              message="Pin important announcements to keep them top of mind."
            />
          )}
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
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  pendingCallout: {
    backgroundColor: theme.colors.warningBg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  pendingText: {
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  mutedText: {
    color: theme.colors.textSecondary,
  },
  eventBody: {
    marginTop: theme.spacing.sm,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  eventMeta: {
    color: theme.colors.textSecondary,
  },
  rsvpRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  rsvpChip: {
    marginRight: theme.spacing.sm,
  },
  pinnedCard: {
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
    backgroundColor: theme.colors.warningBg,
  },
  pinnedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
});
