// Componente funcional 3: la coleccion completa.
// Aqui vive el TabNavigation: una pestana por rareza.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CartaPersonaje from '../components/CartaPersonaje';
import FichaModal from '../components/FichaModal';
import { useGacha } from '../context/GachaContext';
import { personajesPorRareza } from '../data/personajes';
import { colorRareza, colores, radio } from '../theme';

const Tab = createBottomTabNavigator();

function ListaRareza({ route }) {
  const { rareza } = route.params;
  const { copiasDe, imagenDe } = useGacha();

  const [seleccionado, setSeleccionado] = useState(null);

  const lista = personajesPorRareza(rareza);
  const obtenidos = lista.filter((p) => copiasDe(p.id) > 0).length;

  return (
    <View style={styles.pantalla}>
      <View style={[styles.encabezado, { backgroundColor: colorRareza[rareza] }]}>
        <Ionicons name="star" size={18} color="#FFFFFF" />
        <Text style={styles.encabezadoTexto}>
          {obtenidos} de {lista.length} desbloqueadas
        </Text>
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const copias = copiasDe(item.id);

          return (
            <CartaPersonaje
              personaje={item}
              imagen={imagenDe(item.id)}
              copias={copias}
              bloqueado={copias === 0}
              onPress={() => setSeleccionado(item)}
            />
          );
        }}
      />

      <FichaModal
        personaje={seleccionado}
        imagen={seleccionado ? imagenDe(seleccionado.id) : null}
        copias={seleccionado ? copiasDe(seleccionado.id) : 0}
        visible={seleccionado !== null}
        onClose={() => setSeleccionado(null)}
      />
    </View>
  );
}

function iconoRareza(nombre) {
  return ({ color, size }) => <Ionicons name={nombre} color={color} size={size} />;
}

export default function ColeccionScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.rosaFuerte,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarStyle: styles.barra,
        tabBarLabelStyle: styles.etiqueta,
      }}
    >
      <Tab.Screen
        name="SSR"
        component={ListaRareza}
        initialParams={{ rareza: 'SSR' }}
        options={{ tabBarIcon: iconoRareza('star') }}
      />
      <Tab.Screen
        name="SR"
        component={ListaRareza}
        initialParams={{ rareza: 'SR' }}
        options={{ tabBarIcon: iconoRareza('star-half') }}
      />
      <Tab.Screen
        name="R"
        component={ListaRareza}
        initialParams={{ rareza: 'R' }}
        options={{ tabBarIcon: iconoRareza('star-outline') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: radio,
  },
  encabezadoTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  lista: {
    paddingBottom: 12,
  },
  barra: {
    backgroundColor: colores.tarjeta,
    borderTopColor: colores.rosaSuave,
  },
  etiqueta: {
    fontWeight: 'bold',
  },
});
