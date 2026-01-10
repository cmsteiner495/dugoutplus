import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TeamHeader } from '../components/ui/TeamHeader';
import { TeamLogo } from '../components/ui/TeamLogo';
import { useAppContext } from '../store/AppContext';
import { theme } from '../theme';

export const MoreScreen: React.FC = () => {
  const { team } = useAppContext();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TeamHeader subtitle="More" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <View style={styles.aboutRow}>
            <TeamLogo size={48} />
            <View style={styles.aboutText}>
              <Text style={styles.title}>About Dugout</Text>
              <Text style={styles.meta}>Youth baseball team management</Text>
            </View>
          </View>
          <Text style={styles.body}>
            Build smoother communications, RSVPs, and announcements in one place.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.title}>Team info</Text>
          <Text style={styles.meta}>{team.name}</Text>
          <Text style={styles.meta}>{team.season}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.title}>Feedback</Text>
          <Text style={styles.meta}>Tell us what would help your team most.</Text>
          <Button label="Share feedback" onPress={() => {}} style={styles.button} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.title}>Privacy</Text>
          <Text style={styles.meta}>Privacy-first. No data shared.</Text>
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
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
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
    color: theme.colors.textPrimary,
  },
  meta: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  body: {
    marginTop: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
