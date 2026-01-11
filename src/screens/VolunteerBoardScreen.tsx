import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VolunteerCard } from '../components/VolunteerCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TeamHeader } from '../components/ui/TeamHeader';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';

interface VolunteerBoardScreenProps {
  onClose: () => void;
}

export const VolunteerBoardScreen: React.FC<VolunteerBoardScreenProps> = ({ onClose }) => {
  const {
    volunteerNeeds,
    currentMemberId,
    role,
    volunteerForNeed,
    declineVolunteerNeed,
    resolveVolunteerNeed,
    addVolunteerNeed,
  } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState('1');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }
    addVolunteerNeed({
      title: title.trim(),
      description: description.trim(),
      slotsNeeded: Number(slots) || 1,
    });
    setTitle('');
    setDescription('');
    setSlots('1');
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="Volunteer board" showRoleSwitcher={false} />
      <View style={styles.headerRow}>
        <Button label="Back" onPress={onClose} variant="secondary" />
        {role === 'coach' && (
          <Button label="Create need" onPress={() => setShowModal(true)} />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {volunteerNeeds.map((need) => {
          const slotsFilled = need.volunteers.length;
          const isFilled = slotsFilled >= need.slotsNeeded;
          const hasVolunteered = need.volunteers.includes(currentMemberId);
          return (
            <VolunteerCard
              key={need.id}
              need={need}
              slotsFilled={slotsFilled}
              isFilled={isFilled}
              hasVolunteered={hasVolunteered}
              canResolve={role === 'coach'}
              onVolunteer={() => volunteerForNeed(need.id)}
              onDecline={role !== 'coach' ? () => declineVolunteerNeed(need.id) : undefined}
              onResolve={role === 'coach' ? () => resolveVolunteerNeed(need.id) : undefined}
            />
          );
        })}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>New volunteer request</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.inputBody]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Slots needed"
              value={slots}
              onChangeText={setSlots}
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <View style={styles.modalActions}>
              <Button label="Cancel" onPress={() => setShowModal(false)} variant="secondary" />
              <Button label="Create" onPress={handleSubmit} />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  inputBody: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});
