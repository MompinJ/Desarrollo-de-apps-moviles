import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { PokedexProvider } from './src/context/PokedexContext';
import SplashScreen from './src/screens/SplashScreen';
import PokedexScreen from './src/screens/PokedexScreen';
import CapturarScreen from './src/screens/CapturarScreen';
import TransferenciaScreen from './src/screens/TransferenciaScreen';
import DetalleScreen from './src/screens/DetalleScreen';
import { colores } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const opcionesCabecera = {
  headerStyle: { backgroundColor: colores.rojo },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' },
};

function icono(normal, activo) {
  return ({ focused, color, size }) => (
    <Ionicons name={focused ? activo : normal} color={color} size={size} />
  );
}

function Pestanas() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...opcionesCabecera,
        tabBarActiveTintColor: colores.rojo,
        tabBarInactiveTintColor: colores.textoSuave,
      }}
    >
      <Tab.Screen
        name="Pokedex"
        component={PokedexScreen}
        options={{ tabBarIcon: icono('list-outline', 'list') }}
      />
      <Tab.Screen
        name="Capturar"
        component={CapturarScreen}
        options={{ tabBarIcon: icono('radio-button-on-outline', 'radio-button-on') }}
      />
      <Tab.Screen
        name="Transferencia"
        component={TransferenciaScreen}
        options={{ tabBarIcon: icono('swap-horizontal-outline', 'swap-horizontal') }}
      />
    </Tab.Navigator>
  );
}

// La navegacion vive aparte para que el splash quede fuera de ella.
function Navegacion() {
  const [cargando, setCargando] = useState(true);

  if (cargando) {
    return <SplashScreen onTerminar={() => setCargando(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={opcionesCabecera}>
        <Stack.Screen name="Inicio" component={Pestanas} options={{ headerShown: false }} />
        <Stack.Screen name="Detalle" component={DetalleScreen} options={{ title: 'Detalle' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PokedexProvider>
      <Navegacion />
      <StatusBar style="light" />
    </PokedexProvider>
  );
}
