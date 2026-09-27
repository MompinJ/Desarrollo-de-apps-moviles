import ListRow from '../../components/ListRow';
import ScreenContainer from '../../components/ScreenContainer';
import TabBar from '../../components/TabBar';
import TextLink from '../../components/TextLink';

export default function PerfilScreen({ navigation }) {
  return (
    <ScreenContainer
      inverted
      kicker="Paciente"
      title="Ana Lopez"
      footer={<TabBar active="perfil" links={{ hoy: () => navigation.navigate('Comida') }} />}
    >
      <ListRow label="Mi dieta" right="›" first onPress={() => navigation.navigate('MiDieta')} />
      <ListRow label="Mis registros" right="›" />
      <ListRow label="Historial de citas" right="›" />
      <ListRow label="Ajustes" right="›" />
      <TextLink label="Cerrar sesion" />
    </ScreenContainer>
  );
}
