import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Kicker from '../../components/Kicker';
import ScreenContainer from '../../components/ScreenContainer';
import { colors, typography } from '../../constants/designSystem';

export default function BienvenidaScreen({ navigation }) {
  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Kicker tone="accent">UCC Nutricion</Kicker>
        <Text style={styles.title}>{'Tu plan,\ndia por dia.'}</Text>
        <View style={styles.buttonBlock}>
          <Button label="Iniciar sesion" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: 38,
    letterSpacing: -1.14,
    lineHeight: 40,
    color: colors.black,
    marginTop: 14,
  },
  buttonBlock: {
    marginTop: 26,
  },
});
