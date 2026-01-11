import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VolunteerNeed } from '../models/types';
import { theme } from '../theme';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Card } from './ui/Card';

interface VolunteerCardProps {
  need: VolunteerNeed;
  slotsFilled: number;
  isFilled: boolean;
  hasVolunteered: boolean;
  canResolve: boolean;
  onVolunteer: () => void;
  onDecline?: () => void;
  onResolve?: () => void;
}

export const VolunteerCard: React.FC<VolunteerCardProps> = ({
  need,
  slotsFilled,
  isFilled,
  hasVolunteered,
  canResolve,
  onVolunteer,
  onDecline,
  onResolve,
}) => {
  const statusLabel = need.status === 'Resolved' ? 'Resolved' : isFilled ? 'Filled' : 'Open';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{need.title}</Text>
        <Chip label={statusLabel} tone={statusLabel === 'Open' ? 'neutral' : 'gold'} />
      </View>
      <Text style={styles.body}>{need.description}</Text>
      <Text style={styles.meta}>
        Slots filled {slotsFilled}/{need.slotsNeeded}
      </Text>
      <View style={styles.actionRow}>
        <Button
          label={hasVolunteered ? 'Volunteered' : 'Volunteer'}
          onPress={onVolunteer}
          disabled={hasVolunteered || isFilled || need.status === 'Resolved'}
        />
        {onDecline && (
          <Button
            label="Can't"
            onPress={onDecline}
            variant="secondary"
            disabled={need.status === 'Resolved'}
          />
        )}
        {canResolve && (
          <Button
            label="Resolve"
            onPress={onResolve}
            variant="secondary"
            disabled={need.status === 'Resolved'}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  meta: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  actionRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
