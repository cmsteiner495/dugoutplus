import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Toast } from '../components/ui/Toast';
import { Event, RSVPStatus } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';
import { EventCard } from '../components/EventCard';
import { useFocusEffect } from '@react-navigation/native';

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
  const { events, setRsvp, currentMemberId, role } = useAppContext();
  const [toastMessage, setToastMessage] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'all'>('week');
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const { groupedEvents, filteredEvents } = useMemo(() => {
    const now = new Date();
    const filtered =
      viewMode === 'week'
        ? events.filter((event) => {
            const diff = new Date(event.startsAt).getTime() - now.getTime();
            return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 7;
          })
        : events;
    const sorted = [...filtered].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const grouped = sorted.reduce<Record<string, Event[]>>((acc, event) => {
      const label = getGroupLabel(new Date(event.startsAt));
      acc[label] = acc[label] ? [...acc[label], event] : [event];
      return acc;
    }, {});
    return { groupedEvents: grouped, filteredEvents: filtered };
  }, [events, viewMode]);

  const groupLabels = Object.keys(groupedEvents);

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
      <View style={styles.toggleRow}>
        <Chip
          label="This Week"
          active={viewMode === 'week'}
          onPress={() => setViewMode('week')}
          tone={viewMode === 'week' ? 'gold' : 'neutral'}
          style={styles.toggleChip}
        />
        <Chip
          label="All"
          active={viewMode === 'all'}
          onPress={() => setViewMode('all')}
          tone={viewMode === 'all' ? 'gold' : 'neutral'}
        />
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        {filteredEvents.length === 0 && (
          <EmptyState
            title="No events yet"
            message="Upcoming practices and games will appear here."
          />
        )}
        {groupLabels.map((label) => (
          <View key={label} style={styles.group}>
            <Text style={styles.groupLabel}>{label}</Text>
            {groupedEvents[label].map((event) => {
              const status = currentStatus(event);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  currentStatus={status}
                  onRsvp={(option) => handleRsvp(event.id, option)}
                  role={role}
                />
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
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  toggleChip: {
    marginRight: theme.spacing.sm,
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
});
