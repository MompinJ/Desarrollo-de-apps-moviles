import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../constants/designSystem';

export default function TextLink({ label, onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.wrap}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
  },
  text: {
    textAlign: 'center',
    fontFamily: typography.fonts.monoBold,
    fontSize: 9.5,
    letterSpacing: 1.14,
    textTransform: 'uppercase',
    color: colors.accent.DEFAULT,
  },
});
