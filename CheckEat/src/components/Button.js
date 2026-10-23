import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, colors, typography } from '../constants/designSystem';

export default function Button({ label, onPress, ghost, disabled }) {
  if (ghost) {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={[styles.ghost, disabled && styles.disabled]}>
        <Text style={styles.ghostLabel}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.shadowWrap, disabled && styles.disabled]}>
      <Pressable onPress={onPress} disabled={disabled} style={styles.solid}>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    marginTop: 14,
    backgroundColor: colors.black,
    paddingRight: 4,
    paddingBottom: 4,
  },
  solid: {
    borderWidth: borders.width.normal,
    borderColor: borders.color.DEFAULT,
    backgroundColor: colors.primary.dark,
    paddingVertical: 14,
    alignItems: 'center',
  },
  label: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 10.5,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.white,
  },
  ghost: {
    marginTop: 14,
    borderWidth: borders.width.normal,
    borderColor: borders.color.DEFAULT,
    backgroundColor: colors.white,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostLabel: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 10.5,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.black,
  },
  disabled: {
    opacity: 0.5,
  },
});
