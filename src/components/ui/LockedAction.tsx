import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface LockedActionProps {
  label: string;
  message?: string;
}

export const LockedAction: React.FC<LockedActionProps> = ({
  label,
  message = 'Coach access only',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable style={styles.lockedButton} onPress={() => setVisible(true)}>
        <Text style={styles.lockedText}>🔒 {label}</Text>
      </Pressable>
      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Restricted</Text>
            <Text style={styles.modalBody}>{message}</Text>
            <Pressable style={styles.modalButton} onPress={() => setVisible(false)}>
              <Text style={styles.modalButtonText}>Okay</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  lockedButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  lockedText: {
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modal: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.large,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  modalBody: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  modalButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-end',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.medium,
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    fontWeight: '600',
    color: theme.colors.primaryTextOnPrimary,
  },
});
