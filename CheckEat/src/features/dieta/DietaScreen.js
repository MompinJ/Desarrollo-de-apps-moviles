import { View } from 'react-native';
import Kicker from '../../components/Kicker';
import ListRow from '../../components/ListRow';
import ScreenContainer from '../../components/ScreenContainer';
import TextLink from '../../components/TextLink';

const COMIDAS = [
  { hora: '08:00', nombre: 'Desayuno' },
  { hora: '11:00', nombre: 'Colacion' },
  { hora: '14:30', nombre: 'Comida' },
  { hora: '17:30', nombre: 'Colacion' },
  { hora: '20:30', nombre: 'Cena' },
];

export default function DietaScreen({ navigation }) {
  return (
    <ScreenContainer title="Mi dieta" backLabel="Mi perfil" onBack={() => navigation.goBack()}>
      <Kicker tone="accent">Plan vigente desde el 12 de agosto</Kicker>

      <View style={{ marginTop: 14 }}>
        {COMIDAS.map((comida, index) => (
          <ListRow
            key={comida.nombre + comida.hora}
            leading={comida.hora}
            label={comida.nombre}
            first={index === 0}
          />
        ))}
      </View>

      <TextLink label="Ver indicaciones" onPress={() => navigation.navigate('Indicaciones')} />
    </ScreenContainer>
  );
}
