import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import AccelerometerSensor from './components/AccelerometerSensor';
import BotellaAgua from './components/BotellaAgua';
import GyroscopeSensor from './components/GyroscopeSensor';
import JuegoVolante from './components/JuegoVolante';
import Podometro from './components/Podometro';

const PANTALLAS = [
  { clave: 'acelerometro', titulo: 'Acel.', componente: AccelerometerSensor },
  { clave: 'botella', titulo: 'Botella', componente: BotellaAgua },
  { clave: 'giroscopio', titulo: 'Giro', componente: GyroscopeSensor },
  { clave: 'volante', titulo: 'Volante', componente: JuegoVolante },
  { clave: 'pasos', titulo: 'Pasos', componente: Podometro },
];

export default function App() {
  const [activa, setActiva] = useState('botella');

  const Pantalla = PANTALLAS.find(p => p.clave === activa).componente;

  return (
    <View style={styles.container}>
      <View style={styles.barra}>
        {PANTALLAS.map(pantalla => (
          <Pressable
            key={pantalla.clave}
            style={[styles.tab, activa === pantalla.clave && styles.tabActiva]}
            onPress={() => setActiva(pantalla.clave)}
          >
            <Text style={[styles.texto, activa === pantalla.clave && styles.textoActivo]}>
              {pantalla.titulo}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pantalla />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  barra: {
    flexDirection: 'row',
    backgroundColor: '#1e344f',
    paddingTop: 45,
    paddingBottom: 8,
    paddingHorizontal: 8,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActiva: {
    backgroundColor: '#dc1212',
  },
  texto: {
    color: '#c8c8c8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  textoActivo: {
    color: '#fff',
  },
});
