import ListRow from '../../components/ListRow';
import ScreenContainer from '../../components/ScreenContainer';
import TabBar from '../../components/TabBar';
import TextLink from '../../components/TextLink';
import { useAuth } from '../../context/AuthContext';

export default function PerfilScreen({ navigation }) {
  const { usuario, signOut } = useAuth();
  const nombre = [usuario?.nombre, usuario?.apellidoPaterno].filter(Boolean).join(' ');

  return (
    <ScreenContainer
      inverted
      kicker="Paciente"
      title={nombre || 'Mi perfil'}
      footer={<TabBar active="perfil" />}
    >
      <ListRow label="Mi dieta" right="›" first onPress={() => navigation.navigate('MiDieta')} />
      <ListRow label="Mis datos" right="›" onPress={() => navigation.navigate('MisDatos')} />
      <ListRow label="Historial de citas" right="›" />
      <ListRow label="Ajustes" right="›" />
      <TextLink label="Cerrar sesion" onPress={signOut} />
    </ScreenContainer>
  );
}
