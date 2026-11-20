import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

// Formulario compartido por Agregar y Actualizar
export default function Formulario({ inicial, textoBoton, onEnviar, ocupado }) {
  const [producto, setProducto] = useState(inicial?.producto ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [precio, setPrecio] = useState(inicial ? String(inicial.precio) : '');

  const valido = producto.trim() !== '' && precio.trim() !== '' && !isNaN(Number(precio));

  const enviar = async () => {
    const ok = await onEnviar({
      producto: producto.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio),
    });
    if (ok && !inicial) {
      setProducto('');
      setDescripcion('');
      setPrecio('');
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Producto</Text>
      <TextInput style={styles.input} value={producto} onChangeText={setProducto} />
      <Text style={styles.label}>Descripcion</Text>
      <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} />
      <Text style={styles.label}>Precio</Text>
      <TextInput
        style={styles.input}
        value={precio}
        onChangeText={setPrecio}
        keyboardType="decimal-pad"
      />
      <Pressable
        style={[styles.boton, (!valido || ocupado) && styles.botonOff]}
        disabled={!valido || ocupado}
        onPress={enviar}
      >
        <Text style={styles.textoBoton}>{textoBoton}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 6 },
  label: { fontSize: 14, color: '#1e344f', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#b8c2cf',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  boton: {
    marginTop: 12,
    backgroundColor: '#1e344f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonOff: { opacity: 0.4 },
  textoBoton: { color: '#fff', fontSize: 16 },
});
