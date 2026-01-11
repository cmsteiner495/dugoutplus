import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EventType } from '../models/types';
import { theme } from '../theme';
import { Chip } from './ui/Chip';

export type RsvpFilter = 'All' | 'Needs response' | 'My RSVP: Maybe';
export type SortOption = 'Date' | 'Lowest confidence';

interface ScheduleFiltersRowProps {
  typeFilter: EventType | 'All';
  onTypeChange: (value: EventType | 'All') => void;
  rsvpFilter: RsvpFilter;
  onRsvpChange: (value: RsvpFilter) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  showNeedsAttention: boolean;
  onToggleNeedsAttention: () => void;
  isCoach: boolean;
}

const typeOptions: Array<EventType | 'All'> = ['All', 'Practice', 'Game', 'Other'];
const rsvpOptions: RsvpFilter[] = ['All', 'Needs response', 'My RSVP: Maybe'];
const sortOptions: SortOption[] = ['Date', 'Lowest confidence'];

export const ScheduleFiltersRow: React.FC<ScheduleFiltersRowProps> = ({
  typeFilter,
  onTypeChange,
  rsvpFilter,
  onRsvpChange,
  sortOption,
  onSortChange,
  showNeedsAttention,
  onToggleNeedsAttention,
  isCoach,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.row}>
          {typeOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              active={typeFilter === option}
              onPress={() => onTypeChange(option)}
              tone={typeFilter === option ? 'gold' : 'neutral'}
              style={styles.chip}
            />
          ))}
        </View>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.label}>RSVP</Text>
        <View style={styles.row}>
          {rsvpOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              active={rsvpFilter === option}
              onPress={() => onRsvpChange(option)}
              tone={rsvpFilter === option ? 'gold' : 'neutral'}
              style={styles.chip}
            />
          ))}
        </View>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Sort</Text>
        <View style={styles.row}>
          {sortOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              active={sortOption === option}
              onPress={() => onSortChange(option)}
              tone={sortOption === option ? 'gold' : 'neutral'}
              style={styles.chip}
            />
          ))}
        </View>
      </View>
      {isCoach && (
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Coach focus</Text>
          <View style={styles.row}>
            <Chip
              label="Needs attention"
              active={showNeedsAttention}
              onPress={onToggleNeedsAttention}
              tone={showNeedsAttention ? 'gold' : 'neutral'}
              style={styles.chip}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterGroup: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});
