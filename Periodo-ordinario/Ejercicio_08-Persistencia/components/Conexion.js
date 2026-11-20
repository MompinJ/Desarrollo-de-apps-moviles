import { useCallback, useEffect, useState } from 'react';
import { Text, Pressable, ActivityIndicator, View, StyleSheet } from 'react-native';
import { supabase, configurado } from '../src/supabase';

export default function Conexion() {
  const [estado, setEstado] = useState('probando');
  const [detalle, setDetalle] = useState('');

  const probar = useCallback(async () => {
    setEstado('probando');
    if (!configurado) {
      setEstado('error');
      setDetalle('Falta la url y la key de Supabase en .env.local');
      return;
    }
    // Consulta minima a la tabla Productos: si responde, hay conexion
    const { count, error } = await supabase
      .from('Productos')
      .select('*', { count: 'exact', head: true });
    if (error) {
      setEstado('error');
      setDetalle(error.message);
    } else {
      setEstado('ok');
      setDetalle(`Tabla Productos accesible (${count} registros)`);
    }
  }, []);

  useEffect(() => {
    probar();
  }, [probar]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Conexion con Supabase</Text>
      {estado === 'probando' && <ActivityIndicator size="large" color="#1e344f" />}
      {estado === 'ok' && <Text style={[styles.estado, styles.ok]}>Conectado</Text>}
      {estado === 'error' && <Text style={[styles.estado, styles.error]}>Sin conexion</Text>}
      {estado !== 'probando' && <Text style={styles.detalle}>{detalle}</Text>}
      <Pressable style={styles.boton} onPress={probar}>
        <Text style={styles.textoBoton}>Probar de nuevo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', gap: 12 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1e344f' },
  estado: { fontSize: 22, fontWeight: '600' },
  ok: { color: '#1b8a3b' },
  error: { color: '#c62828' },
  detalle: { fontSize: 14, color: '#555', textAlign: 'center' },
  boton: { backgroundColor: '#1e344f', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  textoBoton: { color: '#fff', fontSize: 16 },
});
