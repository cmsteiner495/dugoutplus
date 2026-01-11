import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { ReplyComposer } from '../components/ReplyComposer';
import { AnnouncementMessage } from '../models/types';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';

interface ThreadScreenProps {
  messageId: string;
  onClose: () => void;
}

export const ThreadScreen: React.FC<ThreadScreenProps> = ({ messageId, onClose }) => {
  const { messages, replies, members, addReply, role, toggleThreadResolved } = useAppContext();
  const [text, setText] = useState('');

  const message = messages.find((item) => item.id === messageId);
  const threadReplies = replies.filter((reply) => reply.messageId === messageId);

  const quickReplies = useMemo(() => {
    if (!message || message.type !== 'text') {
      return [] as string[];
    }
    if (message.category === 'Logistics') {
      return ['I can drive', 'Running late', 'Need a ride'];
    }
    if (message.category === 'Volunteer') {
      return ['I can help', "Can't this time", 'Available after 5pm'];
    }
    return ['Thanks!', 'Got it', 'On it'];
  }, [message]);

  const handleSend = (content: string) => {
    if (!content.trim() || !message) {
      return;
    }
    addReply(message.id, content.trim());
    setText('');
  };

  if (!message) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <Button label="Back" onPress={onClose} variant="secondary" />
        </View>
        <Text style={styles.title}>Thread not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Button label="Back" onPress={onClose} variant="secondary" />
        {role === 'coach' && (
          <Button
            label={message.resolved ? 'Mark unresolved' : 'Mark resolved'}
            onPress={() => toggleThreadResolved(message.id)}
            variant="secondary"
          />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          {message.type === 'announcement' ? (
            <>
              <Text style={styles.title}>{(message as AnnouncementMessage).title}</Text>
              <Text style={styles.body}>{message.content}</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Thread starter</Text>
              <Text style={styles.body}>{message.content}</Text>
            </>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {members.find((member) => member.id === message.authorId)?.name ?? 'Member'}
            </Text>
            <Text style={styles.metaText}>{new Date(message.createdAt).toLocaleString()}</Text>
          </View>
          {message.resolved && <Chip label="Resolved" tone="gold" style={styles.resolvedChip} />}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Replies</Text>
          {threadReplies.length === 0 ? (
            <Text style={styles.bodyMuted}>No replies yet.</Text>
          ) : (
            threadReplies.map((reply) => (
              <View key={reply.id} style={styles.replyRow}>
                <Text style={styles.replyAuthor}>
                  {members.find((member) => member.id === reply.authorId)?.name ?? 'Member'}
                </Text>
                <Text style={styles.replyBody}>{reply.content}</Text>
                <Text style={styles.replyMeta}>
                  {new Date(reply.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </Card>

        {quickReplies.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Quick replies</Text>
            <View style={styles.quickRow}>
              {quickReplies.map((reply) => (
                <Chip
                  key={reply}
                  label={reply}
                  tone="gold"
                  onPress={() => handleSend(reply)}
                  style={styles.quickChip}
                />
              ))}
            </View>
          </Card>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          <ReplyComposer
            value={text}
            onChangeText={setText}
            onSend={() => handleSend(text)}
            placeholder="Write a reply"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  bodyMuted: {
    color: theme.colors.textSecondary,
  },
  metaRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  resolvedChip: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  replyRow: {
    marginBottom: theme.spacing.md,
  },
  replyAuthor: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  replyBody: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  replyMeta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  composer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
});
