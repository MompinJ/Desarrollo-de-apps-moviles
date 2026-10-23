import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { borders, colors, typography } from '../../constants/designSystem';

function horaActual() {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
}

export default function ListoScreen({ navigation, route }) {
  const comida = route.params?.comida;

  return (
    <ScreenContainer centerContent>
      <View style={styles.checkBadge}>
        <Text style={styles.checkMark}>{'✓'}</Text>
      </View>

      <Text style={styles.title}>{comida?.nombre ? `${comida.nombre} registrada` : 'Comida registrada'}</Text>
      <Text style={styles.time}>{horaActual()}</Text>

      <View style={styles.buttonBlock}>
        <Button label="Volver a hoy" onPress={() => navigation.popTo('Comida')} />
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
  buttonBlock: {
    alignSelf: 'stretch',
    marginTop: 34,
  },
});
