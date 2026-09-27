import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function CampoNumero({ etiqueta, unidad, valor, onCambio }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.fila}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={onCambio}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#7a8699"
        />
        <Text style={styles.unidad}>{unidad}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  etiqueta: {
    color: '#c9d3e3',
    fontSize: 14,
    marginBottom: 6,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2a3c',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 22,
    paddingVertical: 12,
  },
  unidad: {
    color: '#7a8699',
    fontSize: 16,
  },
});
