import EmptyState from '../../components/EmptyState';
import ScreenContainer from '../../components/ScreenContainer';

export default function IndicacionesScreen({ navigation }) {
  return (
    <ScreenContainer title="Indicaciones" backLabel="Mi dieta" onBack={() => navigation.goBack()}>
      <EmptyState title="Sin indicaciones">
        Aqui veras lo que te pida tu nutriologa en consulta.
      </EmptyState>
    </ScreenContainer>
  );
}
