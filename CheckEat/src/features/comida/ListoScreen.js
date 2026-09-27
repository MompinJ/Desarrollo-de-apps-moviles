import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Kicker from '../../components/Kicker';
import ProgressBar from '../../components/ProgressBar';
import ScreenContainer from '../../components/ScreenContainer';
import { borders, colors, typography } from '../../constants/designSystem';

export default function ListoScreen({ navigation }) {
  return (
    <ScreenContainer centerContent>
      <View style={styles.checkBadge}>
        <Text style={styles.checkMark}>{'✓'}</Text>
      </View>

      <Text style={styles.title}>Colacion registrada</Text>
      <Text style={styles.time}>17:52</Text>

      <View style={styles.progressBlock}>
        <View style={styles.progressRow}>
          <Kicker tone="green">Avance de hoy</Kicker>
          <Kicker tone="black">4 / 5</Kicker>
        </View>
        <View style={{ marginTop: 8 }}>
          <ProgressBar percent={80} />
        </View>
      </View>

      <View style={styles.buttonBlock}>
        <Button label="Volver a hoy" onPress={() => navigation.popToTop()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  checkBadge: {
    width: 64,
    height: 64,
    borderWidth: borders.width.normal,
    borderColor: borders.color.DEFAULT,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '700',
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: 26,
    letterSpacing: -0.52,
    color: colors.black,
    marginTop: 22,
    textAlign: 'center',
  },
  time: {
    fontFamily: typography.fonts.primary,
    fontSize: 12,
    color: colors.primary.dark,
    marginTop: 8,
  },
  progressBlock: {
    alignSelf: 'stretch',
    marginTop: 34,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonBlock: {
    alignSelf: 'stretch',
  },
});
