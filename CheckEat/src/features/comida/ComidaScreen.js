import Button from '../../components/Button';
import ListRow from '../../components/ListRow';
import ScreenContainer from '../../components/ScreenContainer';
import TextLink from '../../components/TextLink';

const ALIMENTOS = [
  { nombre: 'Manzana', porcion: '1 PIEZA' },
  { nombre: 'Crema de cacahuate', porcion: '1 CDA' },
];

export default function ComidaScreen({ navigation }) {
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MiPerfil');
    }
  };

  return (
    <ScreenContainer inverted kicker="17:30" title="Colacion" backLabel="Hoy" onBack={handleBack}>
      {ALIMENTOS.map((alimento, index) => (
        <ListRow
          key={alimento.nombre}
          label={alimento.nombre}
          right={alimento.porcion}
          rightTone="black"
          first={index === 0}
        />
      ))}

      <Button label="Ya la comi" onPress={() => navigation.navigate('Check')} />
      <TextLink label="Ver opciones de cambio" onPress={() => navigation.navigate('Cambio')} />
    </ScreenContainer>
  );
}
