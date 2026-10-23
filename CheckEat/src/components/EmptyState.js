import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { borders, colors, typography } from '../constants/designSystem';
import Kicker from './Kicker';

export default function EmptyState({ title, children, kicker = 'Sin datos todavia' }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.shadowWrap}>
        <View style={styles.badge}>
          <Svg viewBox="0 0 40 40" width={40} height={40} fill="none" stroke={colors.black} strokeWidth={2.5}>
            <Rect x="4" y="5" width="8" height="8" />
            <Path d="M17 9h19" stroke={colors.softBorder} />
            <Rect x="4" y="16" width="8" height="8" />
            <Path d="M17 20h19" stroke={colors.softBorder} />
            <Rect x="4" y="27" width="8" height="8" />
            <Path d="M17 31h19" stroke={colors.softBorder} />
          </Svg>
        </View>
      </View>

      <Kicker tone="accent" style={styles.kicker}>{kicker}</Kicker>
      <Text style={styles.title}>{title}</Text>
      {children ? <Text style={styles.text}>{children}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  shadowWrap: {
    backgroundColor: colors.black,
    paddingRight: 4,
    paddingBottom: 4,
  },
  badge: {
    width: 72,
    height: 72,
    borderWidth: borders.width.normal,
    borderColor: borders.color.DEFAULT,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    marginTop: 26,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: 24,
    letterSpacing: -0.48,
    lineHeight: 28,
    color: colors.black,
    marginTop: 10,
    textAlign: 'center',
  },
  text: {
    fontFamily: typography.fonts.primary,
    fontSize: 13,
    lineHeight: 19,
    color: colors.mutedText,
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 280,
  },
});
