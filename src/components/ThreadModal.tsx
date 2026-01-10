import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AnnouncementMessage, Member, Message, Reply } from '../models/types';
import { theme } from '../theme';
import { Button } from './ui/Button';

interface ThreadModalProps {
  visible: boolean;
  onClose: () => void;
  replies: Reply[];
  members: Member[];
  message?: Message;
  totalMembers?: number;
  onSend: (content: string) => void;
}

export const ThreadModal: React.FC<ThreadModalProps> = ({
  visible,
  onClose,
  replies,
  members,
  message,
  totalMembers,
  onSend,
}) => {
  const [text, setText] = useState('');

  const header = useMemo(() => {
    if (!message) {
      return { title: 'Thread', confirmations: null };
    }
    if (message.type === 'announcement') {
      const announcement = message as AnnouncementMessage;
      const confirmationTotal = totalMembers ? `/${totalMembers}` : '';
      return {
        title: announcement.title,
        confirmations: `Confirmations ${announcement.confirmations.length}${confirmationTotal}`,
      };
    }
    return { title: 'Thread', confirmations: null };
  }, [message, totalMembers]);

  const handleSend = () => {
    if (!text.trim()) {
      return;
    }
    onSend(text.trim());
    setText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{header.title}</Text>
              {header.confirmations && (
                <Text style={styles.confirmations}>{header.confirmations}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {replies.length === 0 ? (
              <Text style={styles.empty}>No replies yet.</Text>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} style={styles.reply}>
                  <Text style={styles.replyAuthor}>
                    {members.find((m) => m.id === reply.authorId)?.name ?? 'Member'}
                  </Text>
                  <View style={styles.replyBubble}>
                    <Text style={styles.replyText}>{reply.content}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Write a reply"
                value={text}
                onChangeText={setText}
              />
              <Button label="Send" onPress={handleSend} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.radius.large,
    borderTopRightRadius: theme.radius.large,
    maxHeight: '80%',
  },
  dragHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  confirmations: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  close: {
    color: theme.colors.nearBlack,
    fontWeight: '600',
  },
  body: {
    marginTop: theme.spacing.md,
  },
  bodyContent: {
    paddingBottom: theme.spacing.lg,
  },
  empty: {
    color: theme.colors.textSecondary,
  },
  reply: {
    marginBottom: theme.spacing.md,
  },
  replyAuthor: {
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  replyBubble: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.medium,
    marginLeft: theme.spacing.md,
  },
  replyText: {
    color: theme.colors.textPrimary,
  },
  inputRow: {
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
});
