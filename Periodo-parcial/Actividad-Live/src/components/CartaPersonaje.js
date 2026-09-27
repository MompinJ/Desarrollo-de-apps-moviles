// Renglon de un personaje dentro de las listas.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import Insignia from './Insignia';
import { colores, radio, sombra } from '../theme';

export default function CartaPersonaje({ personaje, imagen, copias, bloqueado, onPress }) {
  return (
    <Pressable
      style={[styles.tarjeta, bloqueado && styles.bloqueada]}
      onPress={onPress}
    >
      <Avatar personaje={personaje} imagen={imagen} bloqueado={bloqueado} />

      <View style={styles.datos}>
        <Text style={styles.nombre}>
          {bloqueado ? 'Sin descubrir' : personaje.nombre}
        </Text>
        <Text style={styles.titulo}>{personaje.titulo}</Text>

        <View style={styles.fila}>
          <Insignia rareza={personaje.rareza} />
          <Text style={styles.elemento}>{personaje.elemento}</Text>
        </View>
      </View>

      {copias > 0 ? (
        <View style={styles.copias}>
          <Ionicons name="heart" size={14} color={colores.rosa} />
          <Text style={styles.copiasTexto}>{copias}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    ...sombra,
  },
  bloqueada: {
    opacity: 0.55,
  },
  datos: {
    flex: 1,
    marginLeft: 12,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  titulo: {
    color: colores.textoSuave,
    fontSize: 12,
    marginBottom: 6,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elemento: {
    marginLeft: 8,
    color: colores.textoSuave,
    fontSize: 12,
  },
  copias: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.rosaSuave,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  copiasTexto: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: colores.texto,
  },
});
