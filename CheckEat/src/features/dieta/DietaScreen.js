import EmptyState from '../../components/EmptyState';
import ScreenContainer from '../../components/ScreenContainer';

export default function DietaScreen({ navigation }) {
  return (
    <ScreenContainer title="Mi dieta" backLabel="Mi perfil" onBack={() => navigation.goBack()}>
      <EmptyState title="Aun no tienes plan">
        Tu nutriologa lo arma despues de tu consulta. Cuando este listo, aparece aqui.
      </EmptyState>
    </ScreenContainer>
  );
}
