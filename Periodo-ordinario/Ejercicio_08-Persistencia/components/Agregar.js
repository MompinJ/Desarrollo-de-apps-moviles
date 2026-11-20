import { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '../src/supabase';
import Formulario from './Formulario';

export default function Agregar() {
  const [ocupado, setOcupado] = useState(false);

  const agregar = async datos => {
    setOcupado(true);
    const { error } = await supabase.from('Productos').insert(datos);
    setOcupado(false);
    if (error) {
      Alert.alert('Error', error.message);
      return false;
    }
    Alert.alert('Listo', 'Producto agregado');
    return true;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Agregar producto</Text>
      <Formulario textoBoton="Guardar" onEnviar={agregar} ocupado={ocupado} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1e344f' },
});
