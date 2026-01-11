import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { theme } from '../theme';
import { Button } from './ui/Button';

interface ReplyComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder ?? 'Write a reply'}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.textSecondary}
      />
      <Button label="Send" onPress={onSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
});
