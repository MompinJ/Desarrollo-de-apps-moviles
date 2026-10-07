import { StyleSheet, Text, View } from 'react-native';
import { colorTipo, nombreTipo } from '../theme';

export default function TipoInsignia({ tipo }) {
  return (
    <View style={[styles.caja, { backgroundColor: colorTipo[tipo] || '#999999' }]}>
      <Text style={styles.texto}>{nombreTipo[tipo] || tipo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
