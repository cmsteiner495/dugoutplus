import React, { useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';

interface EventDetailsScreenProps {
  eventId: string;
  onClose: () => void;
}

const toIcsDate = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ eventId, onClose }) => {
  const { events, members, role, eventChecklist, toggleChecklistItem } = useAppContext();
  const [exporting, setExporting] = useState(false);
  const event = events.find((item) => item.id === eventId);

  const attendance = useMemo(() => {
    if (!event) {
      return null;
    }
    const going = event.rsvps
      .filter((rsvp) => rsvp.status === 'Going')
      .map((rsvp) => members.find((member) => member.id === rsvp.memberId)?.name ?? 'Member');
    const maybe = event.rsvps
      .filter((rsvp) => rsvp.status === 'Maybe')
      .map((rsvp) => members.find((member) => member.id === rsvp.memberId)?.name ?? 'Member');
    const no = event.rsvps
      .filter((rsvp) => rsvp.status === 'No')
      .map((rsvp) => members.find((member) => member.id === rsvp.memberId)?.name ?? 'Member');
    const missing = event.missingResponses ?? [];
    const noResponse = missing
      .filter((entry) => entry.status === 'Not responded')
      .map((entry) => entry.name);
    const declined = missing
      .filter((entry) => entry.status === 'No')
      .map((entry) => entry.name);
    return {
      going,
      maybe,
      no: [...no, ...declined],
      noResponse,
    };
  }, [event, members]);

  if (!event || !attendance) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <Button label="Back" onPress={onClose} variant="secondary" />
        </View>
        <Text style={styles.title}>Event not found</Text>
      </SafeAreaView>
    );
  }

  const checklist = eventChecklist[event.id] ?? {};

  const handleDirections = () => {
    const destination = encodeURIComponent(event.location);
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${destination}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${event.title} at ${event.location} on ${new Date(event.startsAt).toLocaleString()}.`,
    });
  };

  const handleAddToCalendar = async () => {
    if (exporting) {
      return;
    }
    setExporting(true);
    const start = new Date(event.startsAt);
    const end = new Date(start.getTime() + 1000 * 60 * 90);
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DugoutPlus//EN\nBEGIN:VEVENT\nUID:${event.id}\nDTSTAMP:${toIcsDate(new Date())}\nDTSTART:${toIcsDate(start)}\nDTEND:${toIcsDate(end)}\nSUMMARY:${event.title}\nLOCATION:${event.location}\nDESCRIPTION:${event.notes ?? ''}\nEND:VEVENT\nEND:VCALENDAR`;
    const fileUri = `${FileSystem.cacheDirectory}event-${event.id}.ics`;
    await FileSystem.writeAsStringAsync(fileUri, icsContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Share.share({
      url: fileUri,
      message: `Calendar invite for ${event.title}`,
    });
    setExporting(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Button label="Back" onPress={onClose} variant="secondary" />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{new Date(event.startsAt).toLocaleString()}</Text>
        <Text style={styles.meta}>{event.location}</Text>
        <Chip label={event.type} tone="gold" style={styles.typeChip} />

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.bodyText}>{event.notes ?? 'No notes yet.'}</Text>
        </Card>

        {role !== 'parent' && event.coachNotes && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Coach notes</Text>
            <Text style={styles.bodyText}>{event.coachNotes}</Text>
          </Card>
        )}

        {event.whatToBring && event.whatToBring.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>What to bring</Text>
            {event.whatToBring.map((item) => (
              <View key={item} style={styles.checkRow}>
                <Chip
                  label={checklist[item] ? '✓' : ''}
                  tone={checklist[item] ? 'gold' : 'neutral'}
                  style={styles.checkChip}
                  onPress={() => toggleChecklistItem(event.id, item)}
                />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Attendance breakdown</Text>
          <View style={styles.groupBlock}>
            <Text style={styles.groupTitle}>Going</Text>
            {attendance.going.length === 0 ? (
              <Text style={styles.bodyText}>No responses yet.</Text>
            ) : (
              attendance.going.map((name) => (
                <Text key={name} style={styles.bodyText}>
                  {name}
                </Text>
              ))
            )}
          </View>
          <View style={styles.groupBlock}>
            <Text style={styles.groupTitle}>Maybe</Text>
            {attendance.maybe.length === 0 ? (
              <Text style={styles.bodyText}>None yet.</Text>
            ) : (
              attendance.maybe.map((name) => (
                <Text key={name} style={styles.bodyText}>
                  {name}
                </Text>
              ))
            )}
          </View>
          <View style={styles.groupBlock}>
            <Text style={styles.groupTitle}>No</Text>
            {attendance.no.length === 0 ? (
              <Text style={styles.bodyText}>None yet.</Text>
            ) : (
              attendance.no.map((name) => (
                <Text key={name} style={styles.bodyText}>
                  {name}
                </Text>
              ))
            )}
          </View>
          <View style={styles.groupBlock}>
            <Text style={styles.groupTitle}>No response</Text>
            {attendance.noResponse.length === 0 ? (
              <Text style={styles.bodyText}>Everyone has replied.</Text>
            ) : (
              attendance.noResponse.map((name) => (
                <Text key={name} style={styles.bodyText}>
                  {name}
                </Text>
              ))
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionRow}>
            <Button label="Directions" onPress={handleDirections} />
            <Button label="Share" onPress={handleShare} variant="secondary" />
            <Button
              label={exporting ? 'Exporting…' : 'Add to calendar'}
              onPress={handleAddToCalendar}
              variant="secondary"
            />
          </View>
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
  headerRow: {
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  meta: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  typeChip: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  card: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  bodyText: {
    color: theme.colors.textSecondary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  checkChip: {
    width: 32,
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  checkText: {
    color: theme.colors.textPrimary,
  },
  groupBlock: {
    marginBottom: theme.spacing.md,
  },
  groupTitle: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  actionRow: {
    gap: theme.spacing.sm,
  },
});
