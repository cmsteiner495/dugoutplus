import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { TEAM_LOGO } from '../../assets';
import { theme } from '../../theme';

interface TeamLogoProps {
  size?: number;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ size = 52 }) => {
  const [logoError, setLogoError] = useState(false);
  const initials = useMemo(() => 'SB', []);
  const innerSize = size - 6;
  const radius = size * 0.38;

  return (
    <View style={[styles.logoWrap, { width: size, height: size, borderRadius: radius }]}>
      {logoError ? (
        <View style={[styles.fallback, { width: innerSize, height: innerSize, borderRadius: radius }]}> 
          <Text style={styles.fallbackText}>{initials}</Text>
        </View>
      ) : (
        <Image
          source={TEAM_LOGO}
          style={{ width: innerSize, height: innerSize, borderRadius: radius }}
          onError={() => setLogoError(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  logoWrap: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.black,
  },
  fallbackText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
