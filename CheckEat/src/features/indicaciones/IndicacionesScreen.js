import Aviso from '../../components/Aviso';
import ListRow from '../../components/ListRow';
import ScreenContainer from '../../components/ScreenContainer';

const REGLAS = [
  'Tomar 2.4 L de agua al dia',
  'Evitar bebidas azucaradas',
  'Caminar 30 min despues de comer',
];

export default function IndicacionesScreen({ navigation }) {
  return (
    <ScreenContainer title="Indicaciones" backLabel="Mi dieta" onBack={() => navigation.goBack()}>
      {REGLAS.map((regla, index) => (
        <ListRow key={regla} label={regla} first={index === 0} />
      ))}

      <Aviso label="Revision">El plan se ajusta en tu cita del 10 de septiembre.</Aviso>
    </ScreenContainer>
  );
}
