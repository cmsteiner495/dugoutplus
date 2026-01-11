import { Platform } from 'react-native';
import { colors } from './colors';

export const shadow = Platform.select({
  ios: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: {
    elevation: 3,
  },
  default: {},
});
