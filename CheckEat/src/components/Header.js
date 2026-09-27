import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, colors, typography } from '../constants/designSystem';

export default function Header({ inverted, kicker, title, backLabel, onBack }) {
  return (
    <View style={[styles.hdr, inverted && styles.hdrInv]}>
      {backLabel ? (
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={[styles.back, inverted && styles.mutedInv]}>{`← ${backLabel}`}</Text>
        </Pressable>
      ) : null}
      {kicker ? (
        <Text style={[styles.kicker, inverted && styles.mutedInv]}>{kicker}</Text>
      ) : null}
      <Text style={[styles.title, inverted && styles.titleInv]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hdr: {
    borderBottomWidth: borders.width.normal,
    borderBottomColor: borders.color.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  hdrInv: {
    backgroundColor: colors.primary.dark,
  },
  kicker: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.35,
    textTransform: 'uppercase',
    color: colors.primary.dark,
  },
  back: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    color: colors.primary.DEFAULT,
    marginBottom: 8,
  },
  mutedInv: {
    color: colors.onDarkMuted,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: 22,
    letterSpacing: -0.44,
    color: colors.black,
    marginTop: 5,
  },
  titleInv: {
    color: colors.white,
  },
});
