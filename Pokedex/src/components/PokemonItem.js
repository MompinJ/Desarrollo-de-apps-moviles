import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imagenDe } from '../data/imagenes';
import { colores, radio, sombra } from '../theme';

export function formatearNombre(nombre) {
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export function formatearNumero(id) {
  return '#' + String(id).padStart(3, '0');
}

// Fila de la lista. Si el pokemon no se ha encontrado se ve como silueta.
export default function PokemonItem({ pokemon, encontrado, onPress, onAlternar }) {
  return (
    <Pressable style={styles.fila} onPress={onPress}>
      <Image
        source={imagenDe(pokemon.id)}
        style={[styles.imagen, !encontrado && styles.silueta]}
      />

      <View style={styles.datos}>
        <Text style={styles.numero}>{formatearNumero(pokemon.id)}</Text>
        <Text style={styles.nombre}>
          {encontrado ? formatearNombre(pokemon.nombre) : '???'}
        </Text>
      </View>

      <Pressable onPress={onAlternar} hitSlop={10}>
        <Ionicons
          name={encontrado ? 'checkmark-circle' : 'ellipse-outline'}
          size={30}
          color={encontrado ? colores.verde : colores.textoSuave}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    ...sombra,
  },
  imagen: {
    width: 64,
    height: 64,
  },
  silueta: {
    tintColor: '#000000',
    opacity: 0.25,
  },
  datos: {
    flex: 1,
    marginLeft: 12,
  },
  numero: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: 'bold',
  },
  nombre: {
    color: colores.gris,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
