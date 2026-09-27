import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import TareaItem from './components/TareaItem';

const PRIORIDADES = ['alta', 'media', 'baja'];
const FILTROS = ['todas', 'pendientes', 'hechas'];

export default function App() {
  const [tareas, setTareas] = useState([
    { id: '1', texto: 'Terminar ejercicio de moviles', prioridad: 'alta', hecha: false },
    { id: '2', texto: 'Subir cambios a GitHub', prioridad: 'media', hecha: true },
  ]);
  const [texto, setTexto] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [filtro, setFiltro] = useState('todas');

  const agregar = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    setTareas((prev) => [
      { id: Date.now().toString(), texto: limpio, prioridad, hecha: false },
      ...prev,
    ]);
    setTexto('');
  };

  const alternar = (id) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t))
    );
  };

  const eliminar = (id) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  };

  const visibles = useMemo(() => {
    if (filtro === 'pendientes') return tareas.filter((t) => !t.hecha);
    if (filtro === 'hechas') return tareas.filter((t) => t.hecha);
    return tareas;
  }, [tareas, filtro]);

  const pendientes = tareas.filter((t) => !t.hecha).length;

  return (
    <View style={styles.pantalla}>
      <Text style={styles.titulo}>Mis pendientes</Text>
      <Text style={styles.contador}>
        {pendientes} por hacer de {tareas.length}
      </Text>

      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Nueva tarea..."
          onSubmitEditing={agregar}
          returnKeyType="done"
        />
        <Pressable style={styles.botonAgregar} onPress={agregar}>
          <Text style={styles.textoAgregar}>+</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        {PRIORIDADES.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPrioridad(p)}
            style={[styles.chip, prioridad === p && styles.chipActivo]}
          >
            <Text style={[styles.textoChip, prioridad === p && styles.textoChipActivo]}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Pressable key={f} onPress={() => setFiltro(f)}>
            <Text style={[styles.filtro, filtro === f && styles.filtroActivo]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TareaItem tarea={item} onAlternar={alternar} onEliminar={eliminar} />
        )}
        ListEmptyComponent={<Text style={styles.vacio}>No hay tareas aqui</Text>}
      />

      <Text style={styles.ayuda}>Toca para marcar - manten presionado para borrar</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f1f0f5',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c2024',
  },
  contador: {
    color: '#60646c',
    marginBottom: 16,
  },
  formulario: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    height: 48,
  },
  botonAgregar: {
    width: 48,
    height: 48,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#6e56cf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAgregar: {
    color: '#ffffff',
    fontSize: 26,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e4e2ec',
  },
  chipActivo: {
    backgroundColor: '#6e56cf',
  },
  textoChip: {
    color: '#60646c',
  },
  textoChipActivo: {
    color: '#ffffff',
  },
  filtros: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 12,
  },
  filtro: {
    color: '#9aa4b2',
    fontSize: 15,
  },
  filtroActivo: {
    color: '#1c2024',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  vacio: {
    textAlign: 'center',
    color: '#9aa4b2',
    marginTop: 30,
  },
  ayuda: {
    textAlign: 'center',
    color: '#9aa4b2',
    fontSize: 12,
    paddingVertical: 12,
  },
});
