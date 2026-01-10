import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnnouncementMessage, Member, Message } from '../models/types';
import { theme } from '../utils/theme';
import { Button } from './Button';

interface MessageItemProps {
  message: Message;
  author?: Member;
  onOpenThread: (messageId: string) => void;
  onConfirm?: (messageId: string) => void;
  currentMemberId: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  author,
  onOpenThread,
  onConfirm,
  currentMemberId,
}) => {
  if (message.type === 'announcement') {
    const announcement = message as AnnouncementMessage;
    const hasConfirmed = announcement.confirmations.includes(currentMemberId);
    return (
      <View style={styles.announcement}>
        <View style={styles.announcementHeader}>
          <Text style={styles.title}>{announcement.title}</Text>
          {announcement.pinned && <Text style={styles.pill}>PINNED</Text>}
        </View>
        {announcement.tag && <Text style={styles.tag}>{announcement.tag}</Text>}
        <Text style={styles.body}>{announcement.content}</Text>
        {announcement.attachments && announcement.attachments.length > 0 && (
          <Text style={styles.attachments}>Attachments: {announcement.attachments.join(', ')}</Text>
        )}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>By {author?.name ?? 'Coach'}</Text>
          <Text style={styles.metaText}>
            Confirmations {announcement.confirmations.length}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <Button
            label={announcement.requiresConfirmation ? (hasConfirmed ? 'Confirmed' : 'Confirm received') : 'Acknowledge'}
            onPress={() => onConfirm?.(announcement.id)}
            disabled={hasConfirmed || !announcement.requiresConfirmation}
          />
          <TouchableOpacity onPress={() => onOpenThread(announcement.id)}>
            <Text style={styles.threadLink}>View thread</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.message} onPress={() => onOpenThread(message.id)}>
      <Text style={styles.messageBody}>{message.content}</Text>
      <Text style={styles.metaText}>By {author?.name ?? 'Member'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  announcement: {
    backgroundColor: '#FFF4E5',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  pill: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  tag: {
    marginTop: 4,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
  },
  attachments: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontSize: 12,
  },
  metaRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  actionRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadLink: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  message: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageBody: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
});
