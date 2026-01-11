import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnnouncementMessage, Member, Message, MessageCategory } from '../models/types';
import { theme } from '../theme';
import { Chip } from './ui/Chip';
import { AnnouncementCard } from './AnnouncementCard';

interface MessageItemProps {
  message: Message;
  author?: Member;
  onOpenThread: (messageId: string) => void;
  onConfirm?: (messageId: string) => void;
  onAcknowledge?: (messageId: string) => void;
  onTogglePin?: (messageId: string) => void;
  currentMemberId: string;
  totalMembers?: number;
  onQuickAction?: (message: Message, action: string) => void;
  isNew?: boolean;
  canPin?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  author,
  onOpenThread,
  onConfirm,
  onAcknowledge,
  onTogglePin,
  currentMemberId,
  totalMembers,
  onQuickAction,
  isNew,
  canPin,
}) => {
  const timestamp = new Date(message.createdAt).toLocaleString();
  const quickActions = useMemo(() => {
    if (message.type !== 'text') {
      return [];
    }
    const content = message.content.toLowerCase();
    const actions = new Set<string>();
    if (content.includes('carpool') || content.includes('drive')) {
      actions.add('I can drive');
      actions.add('Not available');
    }
    if (content.includes('volunteer') || content.includes('help')) {
      actions.add('I can help');
      actions.add('Not available');
    }
    return Array.from(actions);
  }, [message]);

  const categoryLabel: MessageCategory =
    message.category ?? (message.type === 'announcement' ? 'Announcement' : 'General');
  const badgeTone = categoryToTone(categoryLabel);

  if (message.type === 'announcement') {
    const announcement = message as AnnouncementMessage;
    return (
      <AnnouncementCard
        announcement={announcement}
        authorName={author?.name}
        currentMemberId={currentMemberId}
        totalMembers={totalMembers}
        isNew={isNew}
        canPin={canPin}
        onTogglePin={onTogglePin}
        onConfirm={onConfirm}
        onAcknowledge={onAcknowledge}
        onOpenThread={onOpenThread}
      />
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.message,
        message.isOfficial && styles.officialHighlight,
        message.resolved && styles.resolvedMessage,
      ]}
      onPress={() => onOpenThread(message.id)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.authorRow}>
          <Text style={styles.messageAuthor}>{author?.name ?? 'Member'}</Text>
          <View style={[styles.typeBadge, styles.typeBadgeAfter, styles[badgeTone]]}>
            <Text style={[styles.typeBadgeText, styles[`${badgeTone}Text`]]}>
              {categoryLabel}
            </Text>
          </View>
          {message.resolved && <Chip label="Resolved" tone="neutral" style={styles.resolvedChip} />}
          {isNew && <Chip label="New" tone="gold" style={styles.newChip} />}
        </View>
        <Text style={styles.metaText}>{timestamp}</Text>
      </View>
      <Text style={styles.messageBody}>{message.content}</Text>
      {quickActions.length > 0 && (
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <Chip
              key={action}
              label={action}
              onPress={() => onQuickAction?.(message, action)}
              tone="gold"
              style={styles.quickActionChip}
            />
          ))}
        </View>
      )}
      <Text style={styles.threadHint}>View thread</Text>
    </TouchableOpacity>
  );
};

const categoryToTone = (category: MessageCategory) => {
  switch (category) {
    case 'Logistics':
      return 'toneLogistics';
    case 'Volunteer':
      return 'toneVolunteer';
    case 'Announcement':
      return 'toneAnnouncement';
    default:
      return 'toneGeneral';
  }
};

const styles = StyleSheet.create({
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  messageAuthor: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  messageBody: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  resolvedMessage: {
    opacity: 0.7,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.round,
  },
  typeBadgeAfter: {
    marginLeft: theme.spacing.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  toneAnnouncement: {
    backgroundColor: theme.colors.warningBg,
  },
  toneAnnouncementText: {
    color: theme.colors.warning,
  },
  toneLogistics: {
    backgroundColor: theme.colors.background,
  },
  toneLogisticsText: {
    color: theme.colors.textSecondary,
  },
  toneVolunteer: {
    backgroundColor: theme.colors.goldMuted,
  },
  toneVolunteerText: {
    color: theme.colors.primaryTextOnPrimary,
  },
  toneGeneral: {
    backgroundColor: theme.colors.border,
  },
  toneGeneralText: {
    color: theme.colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  quickActionChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  threadHint: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  resolvedChip: {
    marginLeft: theme.spacing.sm,
  },
  newChip: {
    marginLeft: theme.spacing.sm,
  },
  officialHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.gold,
  },
});
