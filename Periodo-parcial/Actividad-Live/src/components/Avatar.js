// Foto del personaje traida de waifu.im. Si la API fallo, muestra la inicial.

import { Image, StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme';

export default function Avatar({ personaje, imagen, tamano = 56, bloqueado }) {
  const estilo = {
    width: tamano,
    height: tamano,
    borderRadius: tamano / 2,
  };

  if (bloqueado || !imagen) {
    return (
      <View style={[styles.respaldo, estilo]}>
        <Text style={[styles.inicial, { fontSize: tamano * 0.4 }]}>
          {bloqueado ? '?' : personaje.nombre.charAt(0)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imagen.url }}
      style={[styles.foto, estilo]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  foto: {
    borderWidth: 3,
    borderColor: colores.rosaSuave,
    backgroundColor: colores.lavandaSuave,
  },
  respaldo: {
    borderWidth: 3,
    borderColor: colores.rosaSuave,
    backgroundColor: colores.lavandaSuave,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inicial: {
    fontWeight: 'bold',
    color: colores.texto,
  },
});
