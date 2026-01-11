import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { useFocusEffect } from '@react-navigation/native';
import { ChannelPills } from '../components/ChannelPills';
import { MessageItem } from '../components/MessageItem';
import { ThreadModal } from '../components/ThreadModal';
import { AnnouncementMessage } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { TeamHeader } from '../components/ui/TeamHeader';
import { Toast } from '../components/ui/Toast';
import { LockedAction } from '../components/ui/LockedAction';

export const ChatScreen: React.FC = () => {
  const {
    channels,
    messages,
    replies,
    members,
    role,
    currentMemberId,
    postAnnouncement,
    postMessage,
    addReply,
    confirmAnnouncement,
  } = useAppContext();

  const [activeChannelId, setActiveChannelId] = useState(channels[0]?.id ?? '');
  const [composer, setComposer] = useState('');
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [pinned, setPinned] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(true);
  const [attachments, setAttachments] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const isOfficialChannel = channels.find((c) => c.id === activeChannelId)?.isOfficial;
  const currentMember = members.find((member) => member.id === currentMemberId);
  const canPostAnnouncement =
    role === 'coach' || (role === 'staff' && currentMember?.authorized);

  const filteredMessages = useMemo(
    () => messages.filter((message) => message.channelId === activeChannelId),
    [messages, activeChannelId]
  );

  const activeMessage = messages.find((message) => message.id === threadMessageId);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Team chat" />
      <ChannelPills channels={channels} activeId={activeChannelId} onSelect={setActiveChannelId} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
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
            currentMemberId={currentMemberId}
            totalMembers={members.length}
            onQuickAction={(item, action) => handleQuickAction(item.id, action)}
          />
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {isOfficialChannel ? (
          canPostAnnouncement ? (
            <Card style={styles.announcementComposer}>
              <Text style={styles.sectionTitle}>Create announcement</Text>
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

      <ThreadModal
        visible={!!threadMessageId}
        onClose={() => setThreadMessageId(null)}
        replies={replies.filter((reply) => reply.messageId === threadMessageId)}
        members={members}
        message={activeMessage}
        totalMembers={members.length}
        onSend={(content) => {
          if (threadMessageId) {
            addReply(threadMessageId, content);
          }
        }}
      />

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
  announcementComposer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
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
});
