import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnnouncementMessage } from '../models/types';
import { theme } from '../theme';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';

interface AnnouncementCardProps {
  announcement: AnnouncementMessage;
  authorName?: string;
  currentMemberId: string;
  totalMembers?: number;
  isNew?: boolean;
  canPin?: boolean;
  onTogglePin?: (messageId: string) => void;
  onConfirm?: (messageId: string) => void;
  onAcknowledge?: (messageId: string) => void;
  onOpenThread?: (messageId: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  authorName,
  currentMemberId,
  totalMembers,
  isNew,
  canPin,
  onTogglePin,
  onConfirm,
  onAcknowledge,
  onOpenThread,
}) => {
  const hasConfirmed = announcement.confirmations.includes(currentMemberId);
  const acknowledgements = announcement.acknowledgedBy ?? [];
  const hasAcknowledged = acknowledgements.includes(currentMemberId);
  const confirmationTotal = totalMembers ? `/${totalMembers}` : '';

  return (
    <View
      style={[
        styles.announcement,
        announcement.pinned && styles.pinnedAnnouncement,
        announcement.isOfficial && styles.officialHighlight,
      ]}
    >
      <View style={styles.announcementHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{announcement.title}</Text>
          <View style={styles.titleBadges}>
            {announcement.pinned && <Chip label="PINNED" tone="gold" />}
            {announcement.resolved && <Chip label="Resolved" tone="neutral" />}
            {isNew && <Chip label="NEW" tone="gold" />}
          </View>
        </View>
        <View style={styles.officialRow}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, styles.typeBadgeSpacing, styles.toneAnnouncement]}>
              <Text style={[styles.typeBadgeText, styles.toneAnnouncementText]}>Announcement</Text>
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
        <Text style={styles.metaText}>By {authorName ?? 'Coach'}</Text>
        <Text style={styles.metaText}>{new Date(announcement.createdAt).toLocaleString()}</Text>
      </View>
      <View style={styles.confirmRow}>
        <Text style={styles.confirmText}>
          Confirmations {announcement.confirmations.length}
          {confirmationTotal}
        </Text>
        {hasConfirmed && <Text style={styles.confirmedText}>Confirmed</Text>}
      </View>
      <View style={styles.seenRow}>
        <Text style={styles.seenText}>
          Seen by {acknowledgements.length}
          {totalMembers ? `/${totalMembers}` : ''}
        </Text>
        {hasAcknowledged && <Text style={styles.acknowledgedText}>Acknowledged</Text>}
      </View>
      <View style={styles.actionRow}>
        {announcement.requiresConfirmation && onConfirm && (
          <Button
            label={hasConfirmed ? 'Confirmed' : 'Confirm received'}
            onPress={() => onConfirm?.(announcement.id)}
            disabled={hasConfirmed}
          />
        )}
        {onAcknowledge && (
          <Button
            label={hasAcknowledged ? 'Acknowledged' : 'Mark as read'}
            onPress={() => onAcknowledge(announcement.id)}
            disabled={hasAcknowledged}
            variant="secondary"
          />
        )}
      </View>
      <View style={styles.footerRow}>
        {canPin && (
          <TouchableOpacity onPress={() => onTogglePin?.(announcement.id)}>
            <Text style={styles.pinToggle}>{announcement.pinned ? 'Unpin' : 'Pin'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onOpenThread?.(announcement.id)}>
          <Text style={styles.threadLink}>View thread</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  titleBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontSize: 16,
    flex: 1,
    marginRight: theme.spacing.sm,
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
  seenRow: {
    marginTop: theme.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seenText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  acknowledgedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
  actionRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  footerRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadLink: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  pinToggle: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.round,
  },
  typeBadgeSpacing: {
    marginRight: theme.spacing.sm,
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
});
