import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { supabase } from '../src/supabase';

export default function Eliminar() {
  const [productos, setProductos] = useState([]);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase.from('Productos').select('*').order('id');
    if (error) Alert.alert('Error', error.message);
    else setProductos(data);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const borrar = async producto => {
    const { error } = await supabase.from('Productos').delete().eq('id', producto.id);
    if (error) Alert.alert('Error', error.message);
    else cargar();
  };

  const confirmar = producto => {
    Alert.alert('Eliminar', `Eliminar "${producto.producto}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => borrar(producto) },
    ]);
  };

  return (
    <FlatList
      data={productos}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.container}
      ListHeaderComponent={<Text style={styles.titulo}>Eliminar productos</Text>}
      ListEmptyComponent={<Text style={styles.vacio}>No hay productos</Text>}
      renderItem={({ item }) => (
        <View style={styles.fila}>
          <Text style={styles.nombre}>{item.producto}</Text>
          <Pressable style={styles.boton} onPress={() => confirmar(item)}>
            <Text style={styles.textoBoton}>Eliminar</Text>
          </Pressable>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#eef2f7',
  },
  nombre: { fontSize: 16, fontWeight: '600', color: '#1e344f' },
  boton: { backgroundColor: '#c62828', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  textoBoton: { color: '#fff' },
});
