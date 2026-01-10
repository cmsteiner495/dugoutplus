import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { TEAM_LOGO } from '../assets';
import { theme } from '../utils/theme';

interface TeamLogoProps {
  size?: number;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ size = 52 }) => {
  const [logoError, setLogoError] = useState(false);
  const initials = useMemo(() => 'ST', []);

  return (
    <View style={[styles.logoWrap, { width: size, height: size, borderRadius: size * 0.3 }]}>
      {logoError ? (
        <View style={[styles.fallback, { width: size - 6, height: size - 6, borderRadius: size * 0.3 }]}>
          <Text style={styles.fallbackText}>{initials}</Text>
        </View>
      ) : (
        <Image
          source={TEAM_LOGO}
          style={{ width: size - 6, height: size - 6, borderRadius: size * 0.3 }}
          onError={() => setLogoError(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  logoWrap: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '700',
  },
});
