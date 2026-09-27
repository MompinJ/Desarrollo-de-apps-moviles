import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, colors, typography } from '../constants/designSystem';

export default function CheckRow({ label, checked, first, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, first && styles.rowFirst]}>
      <View style={[styles.sq, checked && styles.sqOn]}>
        {checked ? <Text style={styles.check}>{'✓'}</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: borders.width.normal,
    borderBottomColor: borders.color.DEFAULT,
  },
  rowFirst: {
    borderTopWidth: borders.width.normal,
    borderTopColor: borders.color.DEFAULT,
  },
  sq: {
    width: 22,
    height: 22,
    borderWidth: borders.width.normal,
    borderColor: borders.color.DEFAULT,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sqOn: {
    backgroundColor: colors.primary.dark,
  },
  check: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontFamily: typography.fonts.heading,
    fontSize: 15,
    letterSpacing: -0.15,
    color: colors.black,
  },
});
