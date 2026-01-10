import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Toast } from '../components/ui/Toast';
import { Event, RSVPStatus } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';

const rsvpOptions: RSVPStatus[] = ['Going', 'Maybe', 'No'];

const getGroupLabel = (date: Date) => {
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) {
    return 'This Week';
  }
  if (diffDays <= 14) {
    return 'Next Week';
  }
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
};

export const ScheduleScreen: React.FC = () => {
  const { events, setRsvp, currentMemberId } = useAppContext();
  const [toastMessage, setToastMessage] = useState('');

  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return sorted.reduce<Record<string, Event[]>>((acc, event) => {
      const label = getGroupLabel(new Date(event.startsAt));
      acc[label] = acc[label] ? [...acc[label], event] : [event];
      return acc;
    }, {});
  }, [events]);

  const groupLabels = Object.keys(groupedEvents);

  const getCounts = (event: Event) => {
    return rsvpOptions.reduce(
      (acc, status) => ({
        ...acc,
        [status]: event.rsvps.filter((rsvp) => rsvp.status === status).length,
      }),
      {} as Record<RSVPStatus, number>
    );
  };

  const currentStatus = (event: Event) =>
    event.rsvps.find((rsvp) => rsvp.memberId === currentMemberId)?.status;

  const handleRsvp = (eventId: string, status: RSVPStatus) => {
    setRsvp(eventId, status);
    Vibration.vibrate(10);
    setToastMessage(`RSVP set to ${status}`);
    setTimeout(() => setToastMessage(''), 1800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Schedule" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {events.length === 0 && (
          <EmptyState
            title="No events yet"
            message="Upcoming practices and games will appear here."
          />
        )}
        {groupLabels.map((label) => (
          <View key={label} style={styles.group}>
            <Text style={styles.groupLabel}>{label}</Text>
            {groupedEvents[label].map((event) => {
              const counts = getCounts(event);
              const status = currentStatus(event);
              return (
                <Card key={event.id} style={styles.card}>
                  <Text style={styles.title}>{event.title}</Text>
                  <Text style={styles.meta}>{event.location}</Text>
                  <Text style={styles.meta}>
                    {new Date(event.startsAt).toLocaleString()}
                  </Text>
                  <View style={styles.rsvpRow}>
                    {rsvpOptions.map((option) => (
                      <Chip
                        key={option}
                        label={`${option} • ${counts[option]}`}
                        active={status === option}
                        onPress={() => handleRsvp(event.id, option)}
                        style={styles.rsvpChip}
                      />
                    ))}
                  </View>
                  <Text style={styles.youStatus}>
                    You: {status ?? 'No response yet'}
                  </Text>
                </Card>
              );
            })}
          </View>
        ))}
      </ScrollView>
      <Toast message={toastMessage} visible={!!toastMessage} />
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
  group: {
    marginBottom: theme.spacing.lg,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  meta: {
    color: theme.colors.textSecondary,
  },
  rsvpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
  },
  rsvpChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  youStatus: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
