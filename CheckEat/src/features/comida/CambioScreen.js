import Aviso from '../../components/Aviso';
import ListRow from '../../components/ListRow';
import ScreenContainer from '../../components/ScreenContainer';

const OPCIONES = [
  { nombre: 'Pera', porcion: '1 PIEZA' },
  { nombre: 'Almendras', porcion: '10 PZAS' },
  { nombre: 'Yogur natural', porcion: '1 VASO' },
];

export default function CambioScreen({ navigation }) {
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Comida');
    }
  };

  return (
    <ScreenContainer title="Puedes cambiarlo por" backLabel="Colacion" onBack={handleBack}>
      {OPCIONES.map((opcion, index) => (
        <ListRow
          key={opcion.nombre}
          label={opcion.nombre}
          right={opcion.porcion}
          rightTone="black"
          first={index === 0}
        />
      ))}

      <Aviso label="Nota">Recorre la colacion si sales tarde, pero no la saltes.</Aviso>
    </ScreenContainer>
  );
}
