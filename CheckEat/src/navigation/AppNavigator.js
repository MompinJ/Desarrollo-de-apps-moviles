import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CambioScreen from '../features/comida/CambioScreen';
import CheckScreen from '../features/comida/CheckScreen';
import ComidaScreen from '../features/comida/ComidaScreen';
import ListoScreen from '../features/comida/ListoScreen';
import DietaScreen from '../features/dieta/DietaScreen';
import IndicacionesScreen from '../features/indicaciones/IndicacionesScreen';
import PerfilScreen from '../features/perfil/PerfilScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MiPerfil" component={PerfilScreen} />
        <Stack.Screen name="MiDieta" component={DietaScreen} />
        <Stack.Screen name="Indicaciones" component={IndicacionesScreen} />
        <Stack.Screen name="Comida" component={ComidaScreen} />
        <Stack.Screen name="Cambio" component={CambioScreen} />
        <Stack.Screen name="Check" component={CheckScreen} />
        <Stack.Screen name="Listo" component={ListoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
