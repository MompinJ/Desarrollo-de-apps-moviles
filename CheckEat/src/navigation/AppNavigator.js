import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AguaScreen from '../features/agua/AguaScreen';
import BienvenidaScreen from '../features/auth/BienvenidaScreen';
import CalendarioScreen from '../features/calendario/CalendarioScreen';
import LoginScreen from '../features/auth/LoginScreen';
import CambioScreen from '../features/comida/CambioScreen';
import CheckScreen from '../features/comida/CheckScreen';
import ComidaScreen from '../features/comida/ComidaScreen';
import ListoScreen from '../features/comida/ListoScreen';
import DietaScreen from '../features/dieta/DietaScreen';
import IndicacionesScreen from '../features/indicaciones/IndicacionesScreen';
import MisDatosScreen from '../features/perfil/MisDatosScreen';
import PerfilScreen from '../features/perfil/PerfilScreen';

const Stack = createNativeStackNavigator();

// Las pestanas de la barra inferior cambian sin animacion de deslizado.
const TAB_OPTIONS = { animation: 'none' };

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="MiPerfil" component={PerfilScreen} options={TAB_OPTIONS} />
            <Stack.Screen name="Comida" component={ComidaScreen} options={TAB_OPTIONS} />
            <Stack.Screen name="Agua" component={AguaScreen} options={TAB_OPTIONS} />
            <Stack.Screen name="Calendario" component={CalendarioScreen} options={TAB_OPTIONS} />
            <Stack.Screen name="MisDatos" component={MisDatosScreen} />
            <Stack.Screen name="MiDieta" component={DietaScreen} />
            <Stack.Screen name="Indicaciones" component={IndicacionesScreen} />
            <Stack.Screen name="Cambio" component={CambioScreen} />
            <Stack.Screen name="Check" component={CheckScreen} />
            <Stack.Screen name="Listo" component={ListoScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
