import { StyleSheet, View } from 'react-native';
import { borders, colors } from '../constants/designSystem';

export default function ProgressBar({ percent }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderWidth: borders.width.normal,
    borderColor: borders.color.DEFAULT,
    backgroundColor: colors.white,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary.dark,
  },
});
