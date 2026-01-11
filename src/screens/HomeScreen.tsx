import React, { useCallback, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';
import { RSVPStatus } from '../models/types';
import { SmartSummaryStrip } from '../components/SmartSummaryStrip';
import { AttendanceMeter } from '../components/AttendanceMeter';
import { LockedAction } from '../components/ui/LockedAction';
import { useFocusEffect } from '@react-navigation/native';

const rsvpOptions: RSVPStatus[] = ['Going', 'Maybe', 'No'];

export const HomeScreen: React.FC = () => {
  const { events, messages, currentMemberId, setRsvp, role, members } = useAppContext();
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

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
  const currentMember = members.find((member) => member.id === currentMemberId);
  const canReviewUpdates =
    role === 'coach' || (role === 'staff' && currentMember?.authorized);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Home dashboard" />
      <SmartSummaryStrip events={events} messages={messages} currentMemberId={currentMemberId} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Official updates</Text>
          {pendingConfirmations > 0 ? (
            <View style={styles.pendingCallout}>
              <Text style={styles.pendingText}>
                {pendingConfirmations} updates awaiting confirmation
              </Text>
              {canReviewUpdates ? (
                <Button label="Review updates" onPress={() => {}} />
              ) : (
                <LockedAction label="Review updates" />
              )}
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
              <AttendanceMeter rsvps={nextEvent.rsvps} />
              <View style={styles.rsvpRow}>
                {rsvpOptions.map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    active={currentStatus === status}
                    onPress={() => {
                      setRsvp(nextEvent.id, status);
                      Vibration.vibrate(10);
                    }}
                    style={styles.rsvpChip}
                    enablePressAnimation
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
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  pinnedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
});
