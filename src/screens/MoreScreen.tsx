import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { TeamHeader } from '../components/TeamHeader';
import { TeamLogo } from '../components/TeamLogo';
import { theme } from '../utils/theme';

export const MoreScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="More" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <View style={styles.aboutRow}>
            <TeamLogo size={44} />
            <View style={styles.aboutText}>
              <Text style={styles.title}>Dugout</Text>
              <Text style={styles.meta}>Youth baseball team management</Text>
            </View>
          </View>
          <Text style={styles.body}>
            Build smoother communications, RSVPs, and announcements in one place.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutText: {
    marginLeft: theme.spacing.md,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
  },
  meta: {
    color: theme.colors.muted,
  },
  body: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
  },
});
