import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { GachaProvider } from './src/context/GachaContext';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import InvocarScreen from './src/screens/InvocarScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import ColeccionScreen from './src/screens/ColeccionScreen';
import EstadisticasScreen from './src/screens/EstadisticasScreen';
import { colores } from './src/theme';

const Drawer = createDrawerNavigator();

function icono(nombre) {
  return ({ color, size }) => <Ionicons name={nombre} color={color} size={size} />;
}

const opcionesDrawer = {
  headerStyle: { backgroundColor: colores.rosa },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' },
  drawerStyle: { backgroundColor: colores.fondo },
  drawerActiveTintColor: colores.rosaFuerte,
  drawerInactiveTintColor: colores.textoSuave,
  drawerActiveBackgroundColor: colores.rosaSuave,
  drawerLabelStyle: { fontWeight: 'bold' },
};

// La navegacion vive aparte para que el splash pueda leer el contexto.
function Navegacion() {
  const [cargando, setCargando] = useState(true);

  if (cargando) {
    return <SplashScreen onTerminar={() => setCargando(false)} />;
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Inicio" screenOptions={opcionesDrawer}>
        <Drawer.Screen
          name="Inicio"
          component={HomeScreen}
          options={{ drawerIcon: icono('home-outline') }}
        />
        <Drawer.Screen
          name="Invocar"
          component={InvocarScreen}
          options={{ drawerIcon: icono('sparkles-outline') }}
        />
        <Drawer.Screen
          name="Inventario"
          component={InventarioScreen}
          options={{ drawerIcon: icono('list-outline') }}
        />
        <Drawer.Screen
          name="Coleccion"
          component={ColeccionScreen}
          options={{ drawerIcon: icono('albums-outline') }}
        />
        <Drawer.Screen
          name="Estadisticas"
          component={EstadisticasScreen}
          options={{ drawerIcon: icono('stats-chart-outline') }}
        />
      </Drawer.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GachaProvider>
      <Navegacion />
    </GachaProvider>
  );
}
