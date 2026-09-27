// Boton redondeado reutilizable.

import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, sombra } from '../theme';

export default function BotonKawaii({ titulo, icono, onPress, color, deshabilitado }) {
  return (
    <Pressable
      style={[
        styles.boton,
        { backgroundColor: color || colores.rosa },
        deshabilitado && styles.apagado,
      ]}
      onPress={onPress}
      disabled={deshabilitado}
    >
      {icono ? <Ionicons name={icono} size={20} color="#FFFFFF" /> : null}
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    ...sombra,
  },
  apagado: {
    opacity: 0.5,
  },
  texto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
