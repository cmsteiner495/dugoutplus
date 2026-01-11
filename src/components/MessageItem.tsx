import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnnouncementMessage, Member, Message } from '../models/types';
import { theme } from '../theme';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';

interface MessageItemProps {
  message: Message;
  author?: Member;
  onOpenThread: (messageId: string) => void;
  onConfirm?: (messageId: string) => void;
  currentMemberId: string;
  totalMembers?: number;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  author,
  onOpenThread,
  onConfirm,
  currentMemberId,
  totalMembers,
}) => {
  const timestamp = new Date(message.createdAt).toLocaleString();

  if (message.type === 'announcement') {
    const announcement = message as AnnouncementMessage;
    const hasConfirmed = announcement.confirmations.includes(currentMemberId);
    const confirmationTotal = totalMembers ? `/${totalMembers}` : '';

    return (
      <View
        style={[
          styles.announcement,
          announcement.pinned && styles.pinnedAnnouncement,
        ]}
      >
        <View style={styles.announcementHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{announcement.title}</Text>
            {announcement.pinned && <Chip label="PINNED" tone="gold" />}
          </View>
          <View style={styles.officialRow}>
            <Text style={styles.officialText}>🔒 Official</Text>
            {announcement.tag && <Text style={styles.tag}>{announcement.tag}</Text>}
          </View>
        </View>
        <Text style={styles.body}>{announcement.content}</Text>
        {announcement.attachments && announcement.attachments.length > 0 && (
          <Text style={styles.attachments}>
            Attachments: {announcement.attachments.join(', ')}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>By {author?.name ?? 'Coach'}</Text>
          <Text style={styles.metaText}>{timestamp}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmText}>
            Confirmations {announcement.confirmations.length}
            {confirmationTotal}
          </Text>
          {hasConfirmed && <Text style={styles.confirmedText}>Confirmed</Text>}
        </View>
        <View style={styles.actionRow}>
          {announcement.requiresConfirmation && (
            <Button
              label={hasConfirmed ? 'Confirmed' : 'Confirm received'}
              onPress={() => onConfirm?.(announcement.id)}
              disabled={hasConfirmed}
            />
          )}
          <TouchableOpacity onPress={() => onOpenThread(announcement.id)}>
            <Text style={styles.threadLink}>View thread</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.message} onPress={() => onOpenThread(message.id)}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageAuthor}>{author?.name ?? 'Member'}</Text>
        <Text style={styles.metaText}>{timestamp}</Text>
      </View>
      <Text style={styles.messageBody}>{message.content}</Text>
      <Text style={styles.threadHint}>View thread</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  announcement: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pinnedAnnouncement: {
    backgroundColor: theme.colors.warningBg,
    borderColor: theme.colors.warningBorder,
  },
  announcementHeader: {
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  officialRow: {
    marginTop: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  officialText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  tag: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  attachments: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 12,
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
  confirmRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  confirmedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
  actionRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadLink: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  message: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.medium,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  messageAuthor: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  messageBody: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  threadHint: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
