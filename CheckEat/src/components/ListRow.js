import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, colors, typography } from '../constants/designSystem';

const RIGHT_COLORS = {
  green: colors.primary.DEFAULT,
  black: colors.black,
  accent: colors.accent.DEFAULT,
  muted: colors.mutedText,
};

export default function ListRow({
  label,
  sublabel,
  leading,
  right,
  rightTone = 'green',
  first,
  soft,
  onPress,
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.row,
        first && (soft ? styles.rowFirstSoft : styles.rowFirst),
        soft && styles.rowSoft,
      ]}
    >
      {leading ? <Text style={styles.leading}>{leading}</Text> : null}
      <View style={styles.labelGroup}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
      {right ? (
        <Text style={[styles.right, { color: RIGHT_COLORS[rightTone] }]}>{right}</Text>
      ) : null}
    </Wrapper>
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
  rowSoft: {
    borderBottomWidth: 1,
    borderBottomColor: colors.softBorder,
  },
  rowFirstSoft: {
    borderTopWidth: 0,
  },
  leading: {
    width: 52,
    fontFamily: typography.fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.primary.DEFAULT,
  },
  labelGroup: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: typography.fonts.heading,
    fontSize: 15,
    letterSpacing: -0.15,
    color: colors.black,
  },
  sublabel: {
    fontFamily: typography.fonts.primary,
    fontSize: 12,
    color: colors.primary.dark,
  },
  right: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
  },
});
