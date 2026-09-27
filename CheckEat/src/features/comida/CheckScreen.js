import { useState } from 'react';
import Button from '../../components/Button';
import CheckRow from '../../components/CheckRow';
import ScreenContainer from '../../components/ScreenContainer';

const OPCIONES = ['Todo', 'Solo una parte', 'Algo diferente'];

export default function CheckScreen({ navigation }) {
  const [seleccion, setSeleccion] = useState('Todo');

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Comida');
    }
  };

  return (
    <ScreenContainer title="Cuanto comiste?" backLabel="Colacion" onBack={handleBack}>
      {OPCIONES.map((opcion, index) => (
        <CheckRow
          key={opcion}
          label={opcion}
          checked={seleccion === opcion}
          first={index === 0}
          onPress={() => setSeleccion(opcion)}
        />
      ))}

      <Button label="Guardar" onPress={() => navigation.navigate('Listo')} />
    </ScreenContainer>
  );
}
