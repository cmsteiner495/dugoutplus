import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface CoachToolkitCardProps {
  onPostAnnouncement: () => void;
  onCreateVolunteer: () => void;
  onSendReminder: () => void;
  onReviewLowAttendance: () => void;
}

export const CoachToolkitCard: React.FC<CoachToolkitCardProps> = ({
  onPostAnnouncement,
  onCreateVolunteer,
  onSendReminder,
  onReviewLowAttendance,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Coach toolkit</Text>
      <Text style={styles.body}>Quick actions for your next moves.</Text>
      <View style={styles.actionRow}>
        <Button label="Post announcement" onPress={onPostAnnouncement} />
        <Button label="Create volunteer request" onPress={onCreateVolunteer} variant="secondary" />
        <Button label="Send RSVP reminder" onPress={onSendReminder} variant="secondary" />
        <Button label="Review low attendance" onPress={onReviewLowAttendance} variant="secondary" />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  actionRow: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
});
