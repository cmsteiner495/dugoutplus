import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Event, Message } from '../models/types';
import { theme } from '../theme';

interface SmartSummaryStripProps {
  events: Event[];
  messages: Message[];
  currentMemberId: string;
}

const isWithinNextWeek = (date: Date) => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 7;
};

export const SmartSummaryStrip: React.FC<SmartSummaryStripProps> = ({
  events,
  messages,
  currentMemberId,
}) => {
  const { summaryLines, hasUpdates } = useMemo(() => {
    const eventsThisWeek = events.filter((event) =>
      isWithinNextWeek(new Date(event.startsAt))
    );
    const awaitingRsvp = eventsThisWeek.filter(
      (event) => !event.rsvps.some((rsvp) => rsvp.memberId === currentMemberId)
    );
    const pendingUpdates = messages.filter(
      (message) =>
        message.type === 'announcement' &&
        message.requiresConfirmation &&
        !message.confirmations.includes(currentMemberId)
    );

    const lines: string[] = [];
    if (eventsThisWeek.length > 0) {
      const rsvpPart =
        awaitingRsvp.length > 0 ? ` · ${awaitingRsvp.length} awaiting RSVP` : '';
      lines.push(`📅 ${eventsThisWeek.length} events this week${rsvpPart}`);
    }
    if (pendingUpdates.length > 0) {
      lines.push(`⚠️ ${pendingUpdates.length} updates need review`);
    }

    return { summaryLines: lines, hasUpdates: pendingUpdates.length > 0 };
  }, [events, messages, currentMemberId]);

  if (summaryLines.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.neutralText}>All caught up.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, hasUpdates && styles.alertContainer]}>
      {summaryLines.map((line) => (
        <Text key={line} style={styles.summaryText}>
          {line}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.medium,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertContainer: {
    backgroundColor: theme.colors.warningBg,
    borderColor: theme.colors.warningBorder,
  },
  summaryText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  neutralText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
});
