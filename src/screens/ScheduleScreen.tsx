import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TeamHeader } from '../components/TeamHeader';
import { Event, RSVPStatus } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../utils/theme';

const rsvpOptions: RSVPStatus[] = ['Going', 'Maybe', 'No'];

export const ScheduleScreen: React.FC = () => {
  const { events, setRsvp, currentMemberId } = useAppContext();
  const [selected, setSelected] = useState<Event | null>(null);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [events]
  );

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Schedule" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {sortedEvents.map((event) => {
          const counts = getCounts(event);
          return (
            <TouchableOpacity key={event.id} onPress={() => setSelected(event)}>
              <Card style={styles.card}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.meta}>{event.location}</Text>
                <Text style={styles.meta}>{new Date(event.startsAt).toLocaleString()}</Text>
                <View style={styles.rsvpRow}>
                  {rsvpOptions.map((status) => (
                    <Text key={status} style={styles.meta}>
                      {status}: {counts[status]}
                    </Text>
                  ))}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.meta}>{selected.location}</Text>
                <Text style={styles.meta}>{new Date(selected.startsAt).toLocaleString()}</Text>
                {selected.notes && <Text style={styles.notes}>{selected.notes}</Text>}
                <Text style={styles.sectionTitle}>RSVP</Text>
                <View style={styles.rsvpButtons}>
                  {rsvpOptions.map((status) => (
                    <Button
                      key={status}
                      label={status}
                      onPress={() => setRsvp(selected.id, status)}
                      variant={currentStatus(selected) === status ? 'secondary' : 'ghost'}
                      style={styles.rsvpButton}
                    />
                  ))}
                </View>
                <Button label="Close" onPress={() => setSelected(null)} />
              </>
            )}
          </View>
        </View>
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
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: theme.colors.muted,
  },
  rsvpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  notes: {
    marginVertical: theme.spacing.sm,
  },
  sectionTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  rsvpButtons: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  rsvpButton: {
    marginRight: theme.spacing.sm,
  },
});
