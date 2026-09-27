// Componente funcional 1: la invocacion.
// La capsula gira y rebota con Animated; al terminar aparece la carta con
// la imagen que trajo waifu.im.

import { useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotonKawaii from '../components/BotonKawaii';
import Insignia from '../components/Insignia';
import { useGacha } from '../context/GachaContext';
import { PROBABILIDADES } from '../data/personajes';
import { colores, radio, sombra } from '../theme';

export default function InvocarScreen() {
  const { invocar, tiradas, imagenDe, estadoApi } = useGacha();

  const [resultado, setResultado] = useState(null);
  const [animando, setAnimando] = useState(false);

  const giro = useRef(new Animated.Value(0)).current;
  const cartaOpacidad = useRef(new Animated.Value(0)).current;
  const cartaEscala = useRef(new Animated.Value(0.6)).current;
  const cartaPosicion = useRef(new Animated.Value(40)).current;

  function alPresionar() {
    setAnimando(true);
    setResultado(null);

    giro.setValue(0);
    cartaOpacidad.setValue(0);
    cartaEscala.setValue(0.6);
    cartaPosicion.setValue(40);

    Animated.timing(giro, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setResultado(invocar());
      setAnimando(false);

      Animated.parallel([
        Animated.timing(cartaOpacidad, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(cartaEscala, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(cartaPosicion, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    });
  }

  const rotacion = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'],
  });

  const rebote = giro.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.35, 1],
  });

  const imagen = resultado ? imagenDe(resultado.id) : null;

  return (
    <View style={styles.pantalla}>
      <View style={styles.tasas}>
        {Object.keys(PROBABILIDADES).map((rareza) => (
          <View key={rareza} style={styles.tasa}>
            <Insignia rareza={rareza} />
            <Text style={styles.tasaTexto}>{PROBABILIDADES[rareza]}%</Text>
          </View>
        ))}
      </View>

      <Animated.Image
        source={require('../../assets/logo.png')}
        resizeMode="contain"
        style={[
          styles.capsula,
          { transform: [{ rotate: rotacion }, { scale: rebote }] },
        ]}
      />

      <View style={styles.boton}>
        <BotonKawaii
          titulo={animando ? 'Invocando...' : 'Invocar'}
          icono="sparkles-outline"
          onPress={alPresionar}
          deshabilitado={animando}
        />
      </View>

      <View style={styles.zona}>
        {resultado ? (
          <Animated.View
            style={[
              styles.carta,
              {
                opacity: cartaOpacidad,
                transform: [{ scale: cartaEscala }, { translateY: cartaPosicion }],
              },
            ]}
          >
            {imagen ? (
              <Image source={{ uri: imagen.url }} style={styles.foto} resizeMode="cover" />
            ) : (
              <View style={[styles.foto, styles.sinFoto]}>
                <Ionicons name="image-outline" size={36} color={colores.textoSuave} />
              </View>
            )}

            <View style={styles.datos}>
              <Insignia rareza={resultado.rareza} grande />
              <Text style={styles.nombre}>{resultado.nombre}</Text>
              <Text style={styles.titulo}>{resultado.titulo}</Text>
              <Text style={styles.extra}>
                {resultado.elemento} - Poder {resultado.poder}
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Text style={styles.pista}>
            {estadoApi === 'cargando'
              ? 'Cargando imagenes de waifu.im...'
              : 'Presiona invocar para abrir una capsula'}
          </Text>
        )}
      </View>

      <Text style={styles.contador}>Tiradas: {tiradas}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    padding: 18,
    backgroundColor: colores.fondo,
  },
  tasas: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  tasa: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  tasaTexto: {
    marginTop: 4,
    color: colores.textoSuave,
    fontSize: 12,
  },
  capsula: {
    width: 120,
    height: 120,
  },
  boton: {
    width: '100%',
    marginVertical: 16,
  },
  zona: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  carta: {
    width: '100%',
    backgroundColor: colores.tarjeta,
    borderRadius: radio + 4,
    overflow: 'hidden',
    ...sombra,
  },
  foto: {
    width: '100%',
    height: 230,
    backgroundColor: colores.lavandaSuave,
  },
  sinFoto: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  datos: {
    alignItems: 'center',
    padding: 14,
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colores.texto,
    marginTop: 8,
  },
  titulo: {
    color: colores.textoSuave,
  },
  extra: {
    marginTop: 6,
    color: colores.texto,
  },
  pista: {
    color: colores.textoSuave,
    marginTop: 20,
  },
  contador: {
    color: colores.textoSuave,
    marginTop: 8,
  },
});
