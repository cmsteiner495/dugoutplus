import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Card } from '../components/ui/Card';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';
import { AnnouncementMessage, RSVPStatus } from '../models/types';
import { SmartSummaryStrip } from '../components/SmartSummaryStrip';
import { AttendanceMeter } from '../components/AttendanceMeter';
import { LockedAction } from '../components/ui/LockedAction';
import { CoachToolkitCard } from '../components/CoachToolkitCard';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { EventDetailsScreen } from './EventDetailsScreen';
import { VolunteerBoardScreen } from './VolunteerBoardScreen';

const rsvpOptions: RSVPStatus[] = ['Going', 'Maybe', 'No'];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    events,
    messages,
    currentMemberId,
    setRsvp,
    role,
    members,
    postAnnouncement,
    addVolunteerNeed,
    setDraftMessage,
    channels,
  } = useAppContext();
  const scrollRef = useRef<ScrollView>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showVolunteerBoard, setShowVolunteerBoard] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementTag, setAnnouncementTag] = useState('');
  const [volunteerTitle, setVolunteerTitle] = useState('');
  const [volunteerDescription, setVolunteerDescription] = useState('');
  const [volunteerSlots, setVolunteerSlots] = useState('1');

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const nextEvent = useMemo(() => {
    return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  }, [events]);

  const pinnedAnnouncement = useMemo(() => {
    return messages.find(
      (message): message is AnnouncementMessage =>
        message.type === 'announcement' && message.pinned
    );
  }, [messages]);

  const pendingConfirmations = useMemo(() => {
    return messages.filter(
      (message) =>
        message.type === 'announcement' &&
        message.requiresConfirmation &&
        !message.confirmations.includes(currentMemberId)
    ).length;
  }, [messages, currentMemberId]);

  const currentStatus = nextEvent
    ? nextEvent.rsvps.find((rsvp) => rsvp.memberId === currentMemberId)?.status
    : undefined;
  const currentMember = members.find((member) => member.id === currentMemberId);
  const canReviewUpdates =
    role === 'coach' || (role === 'staff' && currentMember?.authorized);

  const handleCoachAnnouncement = () => {
    if (!announcementTitle.trim()) {
      return;
    }
    postAnnouncement({
      channelId: channels.find((channel) => channel.type === 'Announcements')?.id ?? 'c1',
      authorId: currentMemberId,
      title: announcementTitle.trim(),
      content: announcementBody.trim() || 'New announcement',
      tag: announcementTag.trim() || undefined,
      pinned: false,
      requiresConfirmation: true,
      attachments: [],
    });
    setAnnouncementTitle('');
    setAnnouncementBody('');
    setAnnouncementTag('');
    setShowAnnouncementModal(false);
  };

  const handleCoachVolunteer = () => {
    if (!volunteerTitle.trim() || !volunteerDescription.trim()) {
      return;
    }
    addVolunteerNeed({
      title: volunteerTitle.trim(),
      description: volunteerDescription.trim(),
      slotsNeeded: Number(volunteerSlots) || 1,
    });
    setVolunteerTitle('');
    setVolunteerDescription('');
    setVolunteerSlots('1');
    setShowVolunteerModal(false);
  };

  const handleRsvpReminder = () => {
    const logisticsChannel = channels.find((channel) => channel.type === 'Logistics');
    if (!logisticsChannel || !nextEvent) {
      return;
    }
    setDraftMessage(
      logisticsChannel.id,
      `Reminder: Please RSVP for ${nextEvent.title} on ${new Date(
        nextEvent.startsAt
      ).toLocaleDateString()}.`
    );
    navigation.navigate('Chat' as never, { channelId: logisticsChannel.id } as never);
  };

  const handleReviewLowAttendance = () => {
    navigation.navigate('Schedule' as never, { needsAttention: true } as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Home dashboard" />
      <SmartSummaryStrip events={events} messages={messages} currentMemberId={currentMemberId} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Official updates</Text>
          {pendingConfirmations > 0 ? (
            <View style={styles.pendingCallout}>
              <Text style={styles.pendingText}>
                {pendingConfirmations} updates awaiting confirmation
              </Text>
              {canReviewUpdates ? (
                <Button label="Review updates" onPress={() => navigation.navigate('Chat' as never)} />
              ) : (
                <LockedAction label="Review updates" />
              )}
            </View>
          ) : (
            <Text style={styles.mutedText}>All caught up on official updates.</Text>
          )}
        </Card>

        {role === 'coach' && (
          <CoachToolkitCard
            onPostAnnouncement={() => setShowAnnouncementModal(true)}
            onCreateVolunteer={() => setShowVolunteerModal(true)}
            onSendReminder={handleRsvpReminder}
            onReviewLowAttendance={handleReviewLowAttendance}
          />
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Next event</Text>
          {nextEvent ? (
            <View style={styles.eventBody}>
              <View style={styles.eventHeader}>
                <View>
                  <Text style={styles.eventTitle}>{nextEvent.title}</Text>
                  <Text style={styles.eventMeta}>{nextEvent.location}</Text>
                  <Text style={styles.eventMeta}>
                    {new Date(nextEvent.startsAt).toLocaleString()}
                  </Text>
                </View>
                <Button
                  label="Details"
                  onPress={() => setSelectedEventId(nextEvent.id)}
                  variant="secondary"
                />
              </View>
              <AttendanceMeter rsvps={nextEvent.rsvps} />
              <View style={styles.rsvpRow}>
                {rsvpOptions.map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    active={currentStatus === status}
                    onPress={() => {
                      setRsvp(nextEvent.id, status);
                      Vibration.vibrate(10);
                    }}
                    style={styles.rsvpChip}
                    enablePressAnimation
                  />
                ))}
              </View>
            </View>
          ) : (
            <EmptyState
              title="No upcoming events"
              message="Your next practice or game will show up here once scheduled."
            />
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Volunteer board</Text>
          <Text style={styles.mutedText}>
            See where help is needed and claim a slot.
          </Text>
          <Button
            label="View volunteer needs"
            onPress={() => setShowVolunteerBoard(true)}
            style={styles.buttonSpacing}
          />
        </Card>

        <Card style={[styles.card, styles.pinnedCard]}>
          <View style={styles.pinnedHeader}>
            <Text style={styles.sectionTitle}>Pinned announcement</Text>
            <Chip label="Pinned" tone="gold" />
          </View>
          {pinnedAnnouncement ? (
            <AnnouncementCard
              announcement={pinnedAnnouncement}
              authorName={members.find((member) => member.id === pinnedAnnouncement.authorId)?.name}
              currentMemberId={currentMemberId}
              totalMembers={members.length}
              canPin={role === 'coach'}
              onOpenThread={(messageId) =>
                navigation.navigate('Chat' as never, {
                  threadMessageId: messageId,
                  channelId: pinnedAnnouncement.channelId,
                } as never)
              }
            />
          ) : (
            <EmptyState
              title="Nothing pinned"
              message="Pin important announcements to keep them top of mind."
            />
          )}
        </Card>
      </ScrollView>

      <Modal
        visible={showAnnouncementModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAnnouncementModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Post announcement</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={announcementTitle}
              onChangeText={setAnnouncementTitle}
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.inputBody]}
              placeholder="Message"
              value={announcementBody}
              onChangeText={setAnnouncementBody}
              multiline
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Tag"
              value={announcementTag}
              onChangeText={setAnnouncementTag}
              placeholderTextColor={theme.colors.textSecondary}
            />
            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                onPress={() => setShowAnnouncementModal(false)}
                variant="secondary"
              />
              <Button label="Post" onPress={handleCoachAnnouncement} />
            </View>
          </Card>
        </View>
      </Modal>

      <Modal
        visible={showVolunteerModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVolunteerModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Create volunteer request</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={volunteerTitle}
              onChangeText={setVolunteerTitle}
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.inputBody]}
              placeholder="Description"
              value={volunteerDescription}
              onChangeText={setVolunteerDescription}
              multiline
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Slots needed"
              value={volunteerSlots}
              onChangeText={setVolunteerSlots}
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                onPress={() => setShowVolunteerModal(false)}
                variant="secondary"
              />
              <Button label="Create" onPress={handleCoachVolunteer} />
            </View>
          </Card>
        </View>
      </Modal>

      <Modal
        visible={showVolunteerBoard}
        animationType="slide"
        onRequestClose={() => setShowVolunteerBoard(false)}
      >
        <VolunteerBoardScreen onClose={() => setShowVolunteerBoard(false)} />
      </Modal>

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
  card: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  pendingCallout: {
    backgroundColor: theme.colors.warningBg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  pendingText: {
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  mutedText: {
    color: theme.colors.textSecondary,
  },
  eventBody: {
    marginTop: theme.spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  eventMeta: {
    color: theme.colors.textSecondary,
  },
  rsvpRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  rsvpChip: {
    marginRight: theme.spacing.sm,
  },
  pinnedCard: {
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
    backgroundColor: theme.colors.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  pinnedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    padding: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  inputBody: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  buttonSpacing: {
    marginTop: theme.spacing.sm,
  },
});
