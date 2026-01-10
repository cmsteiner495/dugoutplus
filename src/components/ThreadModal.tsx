import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Member, Reply } from '../models/types';
import { theme } from '../utils/theme';
import { Button } from './Button';

interface ThreadModalProps {
  visible: boolean;
  onClose: () => void;
  replies: Reply[];
  members: Member[];
  onSend: (content: string) => void;
}

export const ThreadModal: React.FC<ThreadModalProps> = ({
  visible,
  onClose,
  replies,
  members,
  onSend,
}) => {
  const [text, setText] = useState('');

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
          <View style={styles.header}>
            <Text style={styles.title}>Thread</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body}>
            {replies.length === 0 ? (
              <Text style={styles.empty}>No replies yet.</Text>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} style={styles.reply}>
                  <Text style={styles.replyAuthor}>
                    {members.find((m) => m.id === reply.authorId)?.name ?? 'Member'}
                  </Text>
                  <Text style={styles.replyText}>{reply.content}</Text>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a reply"
              value={text}
              onChangeText={setText}
            />
            <Button label="Send" onPress={handleSend} />
          </View>
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
    padding: theme.spacing.md,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  close: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  body: {
    marginTop: theme.spacing.md,
  },
  empty: {
    color: theme.colors.muted,
  },
  reply: {
    marginBottom: theme.spacing.md,
  },
  replyAuthor: {
    fontWeight: '600',
  },
  replyText: {
    color: theme.colors.text,
  },
  inputRow: {
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});
