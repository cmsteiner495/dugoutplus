import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Event, MissingResponse, Role, RSVPStatus } from '../models/types';
import { theme } from '../theme';
import { AttendanceMeter } from './AttendanceMeter';
import { Chip } from './ui/Chip';
import { Card } from './ui/Card';

interface EventCardProps {
  event: Event;
  currentStatus?: RSVPStatus;
  onRsvp: (status: RSVPStatus) => void;
  role: Role;
}

const rsvpOptions: RSVPStatus[] = ['Going', 'Maybe', 'No'];

const formatMissing = (missing?: MissingResponse[]) => {
  if (!missing || missing.length === 0) {
    return [];
  }
  return missing.map((entry) => `${entry.name} · ${entry.status}`);
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  currentStatus,
  onRsvp,
  role,
}) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

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

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const missingLines = useMemo(() => formatMissing(event.missingResponses), [event.missingResponses]);

  return (
    <TouchableOpacity activeOpacity={0.94} onPress={toggleExpanded}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.meta}>{event.location}</Text>
            <Text style={styles.meta}>
              {new Date(event.startsAt).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.expandLabel}>{expanded ? 'Hide' : 'Details'}</Text>
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

        {expanded && (
          <View style={styles.expandSection}>
            <Text style={styles.expandTitle}>Notes</Text>
            <Text style={styles.expandText}>
              {event.notes ?? 'No extra notes yet.'}
            </Text>
            {role === 'coach' && missingLines.length > 0 && (
              <View style={styles.missingBlock}>
                <Text style={styles.expandTitle}>Who’s missing</Text>
                {missingLines.map((line) => (
                  <Text key={line} style={styles.expandText}>
                    {line}
                  </Text>
                ))}
              </View>
            )}
          </View>
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
  expandSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  expandTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  expandText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  missingBlock: {
    marginTop: theme.spacing.sm,
  },
});
