import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ChannelPills } from '../components/ChannelPills';
import { MessageItem } from '../components/MessageItem';
import { AnnouncementMessage } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Toast } from '../components/ui/Toast';
import { LockedAction } from '../components/ui/LockedAction';
import { ThreadScreen } from './ThreadScreen';
import { VolunteerBoardScreen } from './VolunteerBoardScreen';

interface ChatRouteParams {
  channelId?: string;
  threadMessageId?: string;
}

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    channels,
    messages,
    members,
    role,
    currentMemberId,
    postAnnouncement,
    postMessage,
    confirmAnnouncement,
    acknowledgeAnnouncement,
    toggleAnnouncementPin,
    draftMessages,
    clearDraftMessage,
    lastSeenByChannel,
    markChannelSeen,
    markAllChannelsSeen,
  } = useAppContext();

  const [activeChannelId, setActiveChannelId] = useState(channels[0]?.id ?? '');
  const [composer, setComposer] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);
  const [showVolunteerBoard, setShowVolunteerBoard] = useState(false);

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [pinned, setPinned] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(true);
  const [attachments, setAttachments] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      if (activeChannelId) {
        markChannelSeen(activeChannelId);
      }
    }, [activeChannelId, markChannelSeen])
  );

  useEffect(() => {
    if (activeChannelId) {
      markChannelSeen(activeChannelId);
    }
  }, [activeChannelId, markChannelSeen]);

  useEffect(() => {
    const params = route.params as ChatRouteParams | undefined;
    if (params?.channelId && params.channelId !== activeChannelId) {
      setActiveChannelId(params.channelId);
    }
    if (params?.threadMessageId) {
      setThreadMessageId(params.threadMessageId);
      navigation.setParams({ threadMessageId: undefined } as never);
    }
  }, [route.params, activeChannelId, navigation]);

  const isOfficialChannel = channels.find((c) => c.id === activeChannelId)?.isOfficial;
  const currentMember = members.find((member) => member.id === currentMemberId);
  const canPostAnnouncement =
    role === 'coach' || (role === 'staff' && currentMember?.authorized);

  const filteredMessages = useMemo(() => {
    const channelMessages = messages.filter((message) => message.channelId === activeChannelId);
    if (!isOfficialChannel) {
      return channelMessages;
    }
    return [...channelMessages].sort((a, b) => {
      const aPinned = a.type === 'announcement' && (a as AnnouncementMessage).pinned;
      const bPinned = b.type === 'announcement' && (b as AnnouncementMessage).pinned;
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [messages, activeChannelId, isOfficialChannel]);

  const lastSeen = lastSeenByChannel[activeChannelId] ?? '';

  const handleSend = () => {
    if (!composer.trim()) {
      return;
    }
    postMessage(activeChannelId, composer.trim());
    setComposer('');
  };

  const handleAnnouncement = () => {
    if (!title.trim()) {
      return;
    }
    postAnnouncement({
      channelId: activeChannelId,
      authorId: currentMemberId,
      content: composer.trim() || 'New announcement',
      title: title.trim(),
      tag: tag.trim() || undefined,
      pinned,
      requiresConfirmation,
      attachments: attachments ? attachments.split(',').map((item) => item.trim()) : [],
    } as Omit<AnnouncementMessage, 'id' | 'createdAt' | 'confirmations' | 'type'>);
    setTitle('');
    setTag('');
    setPinned(false);
    setRequiresConfirmation(true);
    setAttachments('');
    setComposer('');
    setToastMessage('Announcement posted');
    setTimeout(() => setToastMessage(''), 1800);
  };

  const handleConfirm = (messageId: string) => {
    confirmAnnouncement(messageId);
    Vibration.vibrate(10);
    setToastMessage('Confirmation recorded');
    setTimeout(() => setToastMessage(''), 1800);
  };

  const handleQuickAction = (messageId: string, action: string) => {
    const message = messages.find((item) => item.id === messageId);
    if (!message) {
      return;
    }
    const authorName = currentMember?.name ?? 'Member';
    postMessage(message.channelId, `✅ ${authorName}: ${action}`);
  };

  useEffect(() => {
    const draft = draftMessages[activeChannelId];
    if (draft) {
      if (isOfficialChannel) {
        setTitle((prev) => prev || 'RSVP Reminder');
        setComposer(draft);
      } else {
        setComposer(draft);
      }
      clearDraftMessage(activeChannelId);
    }
  }, [activeChannelId, draftMessages, clearDraftMessage, isOfficialChannel]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Team chat" />
      <ChannelPills channels={channels} activeId={activeChannelId} onSelect={setActiveChannelId} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <Card style={styles.volunteerCard}>
          <Text style={styles.sectionTitle}>Volunteer board</Text>
          <Text style={styles.helperText}>Check the latest needs and sign up quickly.</Text>
          <Button label="Open volunteer board" onPress={() => setShowVolunteerBoard(true)} />
        </Card>

        {isOfficialChannel && (
          <View style={styles.identityBar}>
            <Text style={styles.identityText}>Official announcements channel</Text>
            <Text style={styles.identitySubtext}>Staff and coaches can post updates.</Text>
          </View>
        )}

        {filteredMessages.length === 0 && (
          <EmptyState
            title="No messages yet"
            message={
              isOfficialChannel
                ? 'Official announcements will appear here once posted.'
                : 'Kick off the conversation with your team.'
            }
          />
        )}

        {filteredMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            author={members.find((member) => member.id === message.authorId)}
            onOpenThread={setThreadMessageId}
            onConfirm={handleConfirm}
            onAcknowledge={role !== 'coach' ? acknowledgeAnnouncement : undefined}
            onTogglePin={role === 'coach' ? toggleAnnouncementPin : undefined}
            canPin={role === 'coach'}
            currentMemberId={currentMemberId}
            totalMembers={members.length}
            onQuickAction={(item, action) => handleQuickAction(item.id, action)}
            isNew={message.createdAt > lastSeen}
          />
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {isOfficialChannel ? (
          canPostAnnouncement ? (
            <Card style={styles.announcementComposer}>
              <View style={styles.composerHeader}>
                <Text style={styles.sectionTitle}>Create announcement</Text>
                <Button
                  label="Mark all read"
                  onPress={markAllChannelsSeen}
                  variant="secondary"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Title (required)"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Tag"
                value={tag}
                onChangeText={setTag}
                placeholderTextColor={theme.colors.textSecondary}
              />
              <TextInput
                style={[styles.input, styles.inputBody]}
                placeholder="Body"
                value={composer}
                onChangeText={setComposer}
                multiline
                placeholderTextColor={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Attachments placeholder (comma separated)"
                value={attachments}
                onChangeText={setAttachments}
                placeholderTextColor={theme.colors.textSecondary}
              />
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Pinned</Text>
                <Switch
                  value={pinned}
                  onValueChange={setPinned}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.primary}
                  ios_backgroundColor={theme.colors.border}
                />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Require confirmation</Text>
                <Switch
                  value={requiresConfirmation}
                  onValueChange={setRequiresConfirmation}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.primary}
                  ios_backgroundColor={theme.colors.border}
                />
              </View>
              <Button label="Post announcement" onPress={handleAnnouncement} />
            </Card>
          ) : (
            <Card style={styles.restrictedCard}>
              <Text style={styles.sectionTitle}>Create announcement</Text>
              <Text style={styles.restrictedText}>
                Only coaches/authorized staff can post official updates.
              </Text>
              <View style={styles.lockedAction}>
                <LockedAction label="Post official update" message="Coach access only" />
              </View>
            </Card>
          )
        ) : (
          <View style={styles.composer}>
            <View style={styles.composerHeader}>
              <Text style={styles.sectionTitle}>Message</Text>
              <Button
                label="Mark all read"
                onPress={markAllChannelsSeen}
                variant="secondary"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Message"
              value={composer}
              onChangeText={setComposer}
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Button label="Send" onPress={handleSend} />
          </View>
        )}
      </KeyboardAvoidingView>

      <Modal
        visible={!!threadMessageId}
        animationType="slide"
        onRequestClose={() => setThreadMessageId(null)}
      >
        {threadMessageId ? (
          <ThreadScreen messageId={threadMessageId} onClose={() => setThreadMessageId(null)} />
        ) : null}
      </Modal>

      <Modal
        visible={showVolunteerBoard}
        animationType="slide"
        onRequestClose={() => setShowVolunteerBoard(false)}
      >
        <VolunteerBoardScreen onClose={() => setShowVolunteerBoard(false)} />
      </Modal>

      <Toast message={toastMessage} visible={!!toastMessage} />
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
  identityBar: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warningBg,
    borderRadius: theme.radius.medium,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  identityText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  identitySubtext: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  volunteerCard: {
    marginBottom: theme.spacing.lg,
  },
  announcementComposer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  helperText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  toggleLabel: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  composer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  restrictedCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  restrictedText: {
    color: theme.colors.textSecondary,
  },
  lockedAction: {
    marginTop: theme.spacing.md,
  },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
