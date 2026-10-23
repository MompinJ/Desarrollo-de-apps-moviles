import EmptyState from '../../components/EmptyState';
import ScreenContainer from '../../components/ScreenContainer';
import TabBar from '../../components/TabBar';
import { fechaLarga } from '../../utils/fechas';

export default function ComidaScreen() {
  return (
    <ScreenContainer inverted kicker={fechaLarga(new Date())} title="Hoy" footer={<TabBar active="hoy" />}>
      <EmptyState title="Nada que comer por ahora">
        Cuando tengas un plan, aqui aparecen tus comidas del dia para marcarlas.
      </EmptyState>
    </ScreenContainer>
  );
}
