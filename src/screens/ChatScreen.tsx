import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ChannelPills } from '../components/ChannelPills';
import { MessageItem } from '../components/MessageItem';
import { TeamHeader } from '../components/TeamHeader';
import { ThreadModal } from '../components/ThreadModal';
import { AnnouncementMessage } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../utils/theme';

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

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [pinned, setPinned] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(true);
  const [attachments, setAttachments] = useState('');

  const isOfficialChannel = channels.find((c) => c.id === activeChannelId)?.isOfficial;
  const currentMember = members.find((member) => member.id === currentMemberId);
  const canPostAnnouncement =
    role === 'Coach' || (role === 'Staff' && currentMember?.authorized);

  const filteredMessages = useMemo(
    () => messages.filter((message) => message.channelId === activeChannelId),
    [messages, activeChannelId]
  );

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
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Team chat" />
      <ChannelPills channels={channels} activeId={activeChannelId} onSelect={setActiveChannelId} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {isOfficialChannel && (
          <View style={styles.identityBar}>
            <Text style={styles.identityText}>Official announcements</Text>
          </View>
        )}

        {filteredMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            author={members.find((member) => member.id === message.authorId)}
            onOpenThread={setThreadMessageId}
            onConfirm={confirmAnnouncement}
            currentMemberId={currentMemberId}
          />
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {isOfficialChannel && canPostAnnouncement && (
          <View style={styles.announcementComposer}>
            <Text style={styles.sectionTitle}>Create announcement</Text>
            <TextInput
              style={styles.input}
              placeholder="Title (required)"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Tag"
              value={tag}
              onChangeText={setTag}
            />
            <TextInput
              style={styles.input}
              placeholder="Body"
              value={composer}
              onChangeText={setComposer}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Attachments placeholder (comma separated)"
              value={attachments}
              onChangeText={setAttachments}
            />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Pinned</Text>
              <Switch value={pinned} onValueChange={setPinned} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Require confirmation</Text>
              <Switch value={requiresConfirmation} onValueChange={setRequiresConfirmation} />
            </View>
            <Button label="Post announcement" onPress={handleAnnouncement} />
          </View>
        )}
        {!isOfficialChannel && (
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Message"
              value={composer}
              onChangeText={setComposer}
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
        onSend={(content) => {
          if (threadMessageId) {
            addReply(threadMessageId, content);
          }
        }}
      />
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
    paddingBottom: theme.spacing.xl,
  },
  identityBar: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  identityText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  announcementComposer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  toggleLabel: {
    fontWeight: '600',
  },
  composer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
});
