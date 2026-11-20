import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { supabase } from '../src/supabase';
import Formulario from './Formulario';

export default function Actualizar() {
  const [productos, setProductos] = useState([]);
  const [elegido, setElegido] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase.from('Productos').select('*').order('id');
    if (error) Alert.alert('Error', error.message);
    else setProductos(data);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizar = async datos => {
    setOcupado(true);
    const { error } = await supabase.from('Productos').update(datos).eq('id', elegido.id);
    setOcupado(false);
    if (error) {
      Alert.alert('Error', error.message);
      return false;
    }
    Alert.alert('Listo', 'Producto actualizado');
    setElegido(null);
    cargar();
    return true;
  };

  if (elegido) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Editar producto #{elegido.id}</Text>
        <Formulario
          key={elegido.id}
          inicial={elegido}
          textoBoton="Actualizar"
          onEnviar={actualizar}
          ocupado={ocupado}
        />
        <Pressable style={styles.cancelar} onPress={() => setElegido(null)}>
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={productos}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.container}
      ListHeaderComponent={<Text style={styles.titulo}>Elige un producto para editar</Text>}
      ListEmptyComponent={<Text style={styles.vacio}>No hay productos</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.fila} onPress={() => setElegido(item)}>
          <Text style={styles.nombre}>{item.producto}</Text>
          <Text style={styles.precio}>${Number(item.precio).toFixed(2)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1e344f', marginBottom: 8 },
  vacio: { color: '#777', textAlign: 'center', marginTop: 24 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#eef2f7',
  },
  nombre: { fontSize: 16, fontWeight: '600', color: '#1e344f' },
  precio: { fontSize: 16, color: '#1b8a3b' },
  cancelar: { alignItems: 'center', paddingVertical: 12 },
  textoCancelar: { color: '#c62828', fontSize: 16 },
});
