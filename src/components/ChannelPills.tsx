import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Channel } from '../models/types';
import { theme } from '../utils/theme';
import { Chip } from './Chip';

interface ChannelPillsProps {
  channels: Channel[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const ChannelPills: React.FC<ChannelPillsProps> = ({
  channels,
  activeId,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {channels.map((channel) => (
          <Chip
            key={channel.id}
            label={channel.name}
            active={channel.id === activeId}
            onPress={() => onSelect(channel.id)}
            style={styles.chip}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  chip: {
    marginRight: theme.spacing.sm,
  },
});
