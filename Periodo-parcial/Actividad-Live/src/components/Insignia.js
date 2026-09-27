// Etiqueta redondeada con el color de la rareza.

import { StyleSheet, Text, View } from 'react-native';
import { colorRareza } from '../theme';

export default function Insignia({ rareza, grande }) {
  return (
    <View
      style={[
        styles.insignia,
        { backgroundColor: colorRareza[rareza] },
        grande && styles.grande,
      ]}
    >
      <Text style={[styles.texto, grande && styles.textoGrande]}>{rareza}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  insignia: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  grande: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
  },
  texto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  textoGrande: {
    fontSize: 18,
  },
});
