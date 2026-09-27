// Ficha completa del personaje dentro de un Modal.

import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Insignia from './Insignia';
import { colores, radio, sombra } from '../theme';

export default function FichaModal({ personaje, imagen, copias, visible, onClose }) {
  if (!personaje) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.ficha}>
          {imagen ? (
            <Image source={{ uri: imagen.url }} style={styles.foto} resizeMode="cover" />
          ) : (
            <View style={[styles.foto, styles.sinFoto]}>
              <Ionicons name="image-outline" size={40} color={colores.textoSuave} />
              <Text style={styles.sinFotoTexto}>Sin imagen de la API</Text>
            </View>
          )}

          <View style={styles.cuerpo}>
            <Insignia rareza={personaje.rareza} grande />

            <Text style={styles.nombre}>{personaje.nombre}</Text>
            <Text style={styles.titulo}>{personaje.titulo}</Text>

            <View style={styles.datos}>
              <View style={styles.dato}>
                <Ionicons name="flame-outline" size={18} color={colores.rosa} />
                <Text style={styles.datoTexto}>{personaje.elemento}</Text>
              </View>
              <View style={styles.dato}>
                <Ionicons name="star-outline" size={18} color={colores.rosa} />
                <Text style={styles.datoTexto}>Poder {personaje.poder}</Text>
              </View>
              <View style={styles.dato}>
                <Ionicons name="heart-outline" size={18} color={colores.rosa} />
                <Text style={styles.datoTexto}>{copias || 0} copias</Text>
              </View>
            </View>

            <Pressable style={styles.boton} onPress={onClose}>
              <Text style={styles.botonTexto}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 58, 85, 0.45)',
    padding: 24,
  },
  ficha: {
    width: '100%',
    backgroundColor: colores.tarjeta,
    borderRadius: radio + 6,
    overflow: 'hidden',
    ...sombra,
  },
  foto: {
    width: '100%',
    height: 280,
    backgroundColor: colores.lavandaSuave,
  },
  sinFoto: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sinFotoTexto: {
    color: colores.textoSuave,
    marginTop: 6,
    fontSize: 12,
  },
  cuerpo: {
    padding: 18,
    alignItems: 'center',
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.texto,
    marginTop: 10,
  },
  titulo: {
    color: colores.textoSuave,
    marginBottom: 14,
  },
  datos: {
    width: '100%',
  },
  dato: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondo,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  datoTexto: {
    marginLeft: 8,
    color: colores.texto,
  },
  boton: {
    marginTop: 8,
    backgroundColor: colores.rosa,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
