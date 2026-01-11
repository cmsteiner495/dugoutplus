import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnnouncementMessage, Member, Message, MessageCategory } from '../models/types';
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
  onQuickAction?: (message: Message, action: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  author,
  onOpenThread,
  onConfirm,
  currentMemberId,
  totalMembers,
  onQuickAction,
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
    const hasConfirmed = announcement.confirmations.includes(currentMemberId);
    const confirmationTotal = totalMembers ? `/${totalMembers}` : '';

    return (
      <View
        style={[
          styles.announcement,
          announcement.pinned && styles.pinnedAnnouncement,
          message.isOfficial && styles.officialHighlight,
        ]}
      >
        <View style={styles.announcementHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{announcement.title}</Text>
            {announcement.pinned && <Chip label="PINNED" tone="gold" />}
          </View>
          <View style={styles.officialRow}>
            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, styles.typeBadgeSpacing, styles[badgeTone]]}>
                <Text style={[styles.typeBadgeText, styles[`${badgeTone}Text`]]}>
                  {categoryLabel}
                </Text>
              </View>
              <Text style={styles.officialText}>🔒 Official</Text>
            </View>
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
    <TouchableOpacity
      style={[styles.message, message.isOfficial && styles.officialHighlight]}
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
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  officialHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.gold,
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageAuthor: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  messageBody: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.round,
  },
  typeBadgeSpacing: {
    marginRight: theme.spacing.sm,
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
});
