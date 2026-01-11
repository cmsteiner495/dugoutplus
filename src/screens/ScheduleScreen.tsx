import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { EmptyState } from '../components/ui/EmptyState';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Toast } from '../components/ui/Toast';
import { Event, EventType, RSVPStatus } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';
import { EventCard } from '../components/EventCard';
import { ScheduleFiltersRow, RsvpFilter, SortOption } from '../components/ScheduleFiltersRow';
import { getAttendanceConfidence } from '../lib/attendance';
import { EventDetailsScreen } from './EventDetailsScreen';

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
  const navigation = useNavigation();
  const route = useRoute();
  const { events, setRsvp, currentMemberId, role, channels, setDraftMessage } = useAppContext();
  const [toastMessage, setToastMessage] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'All'>('All');
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>('All');
  const [sortOption, setSortOption] = useState<SortOption>('Date');
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const params = route.params as { needsAttention?: boolean } | undefined;
      if (params?.needsAttention && role === 'coach') {
        setNeedsAttentionOnly(true);
      }
    }, [route.params, role])
  );

  const { groupedEvents, filteredEvents } = useMemo(() => {
    const filtered = events.filter((event) => {
      if (typeFilter !== 'All' && event.type !== typeFilter) {
        return false;
      }
      if (rsvpFilter === 'Needs response') {
        return !event.rsvps.some((rsvp) => rsvp.memberId === currentMemberId);
      }
      if (rsvpFilter === 'My RSVP: Maybe') {
        return event.rsvps.some(
          (rsvp) => rsvp.memberId === currentMemberId && rsvp.status === 'Maybe'
        );
      }
      if (needsAttentionOnly && role === 'coach') {
        return getAttendanceConfidence(event.rsvps) < 0.6;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === 'Lowest confidence') {
        return getAttendanceConfidence(a.rsvps) - getAttendanceConfidence(b.rsvps);
      }
      return a.startsAt.localeCompare(b.startsAt);
    });

    const grouped = sorted.reduce<Record<string, Event[]>>((acc, event) => {
      const label = getGroupLabel(new Date(event.startsAt));
      acc[label] = acc[label] ? [...acc[label], event] : [event];
      return acc;
    }, {});
    return { groupedEvents: grouped, filteredEvents: filtered };
  }, [events, typeFilter, rsvpFilter, currentMemberId, needsAttentionOnly, role, sortOption]);

  const groupLabels = Object.keys(groupedEvents);

  const currentStatus = (event: Event) =>
    event.rsvps.find((rsvp) => rsvp.memberId === currentMemberId)?.status;

  const handleRsvp = (eventId: string, status: RSVPStatus) => {
    setRsvp(eventId, status);
    Vibration.vibrate(10);
    setToastMessage(`RSVP set to ${status}`);
    setTimeout(() => setToastMessage(''), 1800);
  };

  const handleSendReminder = (event: Event) => {
    const logisticsChannel = channels.find((channel) => channel.type === 'Logistics');
    const announcementsChannel = channels.find((channel) => channel.type === 'Announcements');
    const targetChannel = event.type === 'Other' ? announcementsChannel : logisticsChannel;
    if (!targetChannel) {
      return;
    }
    setDraftMessage(
      targetChannel.id,
      `Reminder: Please update your RSVP for ${event.title} on ${new Date(
        event.startsAt
      ).toLocaleDateString()}.`
    );
    navigation.navigate('Chat' as never, { channelId: targetChannel.id } as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Schedule" />
      <ScheduleFiltersRow
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        rsvpFilter={rsvpFilter}
        onRsvpChange={setRsvpFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        showNeedsAttention={needsAttentionOnly}
        onToggleNeedsAttention={() => setNeedsAttentionOnly((prev) => !prev)}
        isCoach={role === 'coach'}
      />
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
                  onPressDetails={() => setSelectedEventId(event.id)}
                  onSendReminder={role === 'coach' ? () => handleSendReminder(event) : undefined}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
      <Toast message={toastMessage} visible={!!toastMessage} />

      <Modal
        visible={!!selectedEventId}
        animationType="slide"
        onRequestClose={() => setSelectedEventId(null)}
      >
        {selectedEventId ? (
          <EventDetailsScreen
            eventId={selectedEventId}
            onClose={() => setSelectedEventId(null)}
          />
        ) : null}
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
});
