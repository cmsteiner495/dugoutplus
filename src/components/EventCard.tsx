import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Event, Role, RSVPStatus } from '../models/types';
import { theme } from '../theme';
import { AttendanceMeter } from './AttendanceMeter';
import { Chip } from './ui/Chip';
import { Card } from './ui/Card';

interface EventCardProps {
  event: Event;
  currentStatus?: RSVPStatus;
  onRsvp: (status: RSVPStatus) => void;
  role: Role;
  onPressDetails?: () => void;
  onSendReminder?: () => void;
}

const rsvpOptions: RSVPStatus[] = ['Going', 'Maybe', 'No'];

export const EventCard: React.FC<EventCardProps> = ({
  event,
  currentStatus,
  onRsvp,
  role,
  onPressDetails,
  onSendReminder,
}) => {
  const counts = useMemo(
    () =>
      rsvpOptions.reduce(
        (acc, status) => ({
          ...acc,
          [status]: event.rsvps.filter((rsvp) => rsvp.status === status).length,
        }),
        {} as Record<RSVPStatus, number>
      ),
    [event.rsvps]
  );

  return (
    <TouchableOpacity activeOpacity={0.94} onPress={onPressDetails}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.meta}>{event.location}</Text>
            <Text style={styles.meta}>{new Date(event.startsAt).toLocaleString()}</Text>
            <Chip label={event.type} tone="neutral" style={styles.typeChip} />
          </View>
          <Text style={styles.expandLabel}>Details</Text>
        </View>

        <AttendanceMeter rsvps={event.rsvps} />

        <View style={styles.rsvpRow}>
          {rsvpOptions.map((option) => (
            <Chip
              key={option}
              label={`${option} • ${counts[option]}`}
              active={currentStatus === option}
              onPress={() => onRsvp(option)}
              style={styles.rsvpChip}
              enablePressAnimation
            />
          ))}
        </View>
        <Text style={styles.youStatus}>You: {currentStatus ?? 'No response yet'}</Text>

        {role === 'coach' && onSendReminder && (
          <TouchableOpacity onPress={onSendReminder} style={styles.reminderButton}>
            <Text style={styles.reminderText}>Send reminder</Text>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  expandLabel: {
    color: theme.colors.accent,
    fontWeight: '600',
    fontSize: 12,
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
  typeChip: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  reminderButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  reminderText: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
