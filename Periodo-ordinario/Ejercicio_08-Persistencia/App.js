import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Conexion from './components/Conexion';
import Agregar from './components/Agregar';
import Consultar from './components/Consultar';
import Actualizar from './components/Actualizar';
import Eliminar from './components/Eliminar';

const PANTALLAS = [
  { clave: 'conexion', titulo: 'Conexion', componente: Conexion },
  { clave: 'agregar', titulo: 'Agregar', componente: Agregar },
  { clave: 'consultar', titulo: 'Consultar', componente: Consultar },
  { clave: 'actualizar', titulo: 'Actualizar', componente: Actualizar },
  { clave: 'eliminar', titulo: 'Eliminar', componente: Eliminar },
];

export default function App() {
  const [activa, setActiva] = useState('consultar');

  // Se monta solo la pantalla activa, asi cada una recarga los datos al abrirse
  const Pantalla = PANTALLAS.find(p => p.clave === activa).componente;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Persistencia</Text>
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
      <KeyboardAvoidingView
        style={styles.contenido}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pantalla />
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  titulo: {
    backgroundColor: '#1e344f',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
  },
  barra: { flexDirection: 'row', backgroundColor: '#1e344f' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActiva: { borderBottomWidth: 3, borderBottomColor: '#fff' },
  texto: { color: '#9fb0c6', fontSize: 12 },
  textoActivo: { color: '#fff', fontWeight: 'bold' },
  contenido: { flex: 1 },
});
