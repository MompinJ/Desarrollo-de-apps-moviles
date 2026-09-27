import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../constants/designSystem';
import Kicker from './Kicker';

export default function Aviso({ label, children }) {
  return (
    <View style={styles.wrap}>
      <Kicker tone="accent">{label}</Kicker>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 6,
    borderLeftColor: colors.accent.DEFAULT,
    paddingLeft: 12,
    paddingVertical: 2,
    marginTop: 26,
  },
  text: {
    fontFamily: typography.fonts.primary,
    fontSize: 12,
    lineHeight: 18,
    color: colors.black,
    marginTop: 3,
  },
});
