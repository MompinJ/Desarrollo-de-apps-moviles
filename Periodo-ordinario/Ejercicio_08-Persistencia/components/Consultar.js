import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { supabase } from '../src/supabase';

export default function Consultar() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase.from('Productos').select('*').order('id');
    setCargando(false);
    if (error) setError(error.message);
    else {
      setError('');
      setProductos(data);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <FlatList
      data={productos}
      keyExtractor={item => String(item.id)}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
      contentContainerStyle={styles.lista}
      ListHeaderComponent={<Text style={styles.titulo}>Productos</Text>}
      ListEmptyComponent={
        <Text style={styles.vacio}>{error || (cargando ? '' : 'No hay productos')}</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.fila}>
          <View style={styles.datos}>
            <Text style={styles.nombre}>{item.producto}</Text>
            <Text style={styles.descripcion}>{item.descripcion}</Text>
          </View>
          <Text style={styles.precio}>${Number(item.precio).toFixed(2)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 20, gap: 10 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1e344f', marginBottom: 8 },
  vacio: { color: '#777', textAlign: 'center', marginTop: 24 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#eef2f7',
  },
  datos: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: '600', color: '#1e344f' },
  descripcion: { fontSize: 13, color: '#555' },
  precio: { fontSize: 16, fontWeight: '600', color: '#1b8a3b' },
});
