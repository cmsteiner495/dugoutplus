import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RSVP } from '../models/types';
import { theme } from '../theme';

interface AttendanceMeterProps {
  rsvps: RSVP[];
  requiredPlayers?: number;
}

const DEFAULT_REQUIRED_PLAYERS = 9;

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const AttendanceMeter: React.FC<AttendanceMeterProps> = ({
  rsvps,
  requiredPlayers = DEFAULT_REQUIRED_PLAYERS,
}) => {
  const { confidence, label, color } = useMemo(() => {
    const going = rsvps.filter((rsvp) => rsvp.status === 'Going').length;
    const maybe = rsvps.filter((rsvp) => rsvp.status === 'Maybe').length;
    const attendingScore = going + maybe * 0.5;
    const ratio = clamp(attendingScore / requiredPlayers);

    if (ratio >= 0.9) {
      return { confidence: ratio, label: 'Good', color: theme.colors.success };
    }
    if (ratio >= 0.6) {
      return { confidence: ratio, label: 'Watch', color: theme.colors.warning };
    }
    return { confidence: ratio, label: 'Low', color: theme.colors.danger };
  }, [rsvps, requiredPlayers]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Attendance confidence</Text>
        <Text style={styles.labelValue}>
          {label} · {Math.round(confidence * 100)}%
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${confidence * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  labelValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  track: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.round,
  },
});
