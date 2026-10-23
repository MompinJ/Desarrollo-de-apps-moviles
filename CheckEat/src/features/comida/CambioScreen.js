import EmptyState from '../../components/EmptyState';
import ScreenContainer from '../../components/ScreenContainer';

export default function CambioScreen({ navigation, route }) {
  const comida = route.params?.comida;

  return (
    <ScreenContainer
      title="Puedes cambiarlo por"
      backLabel={comida?.nombre ?? 'Hoy'}
      onBack={() => navigation.goBack()}
    >
      <EmptyState title="Sin opciones de cambio">
        Tu nutriologa no ha cargado equivalentes para esta comida.
      </EmptyState>
    </ScreenContainer>
  );
}
