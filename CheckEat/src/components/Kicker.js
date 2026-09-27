import { StyleSheet, Text } from 'react-native';
import { colors, typography } from '../constants/designSystem';

const TONES = {
  green: colors.primary.DEFAULT,
  accent: colors.accent.DEFAULT,
  black: colors.black,
};

export default function Kicker({ children, tone = 'green', style }) {
  return <Text style={[styles.text, { color: TONES[tone] }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
  },
});
