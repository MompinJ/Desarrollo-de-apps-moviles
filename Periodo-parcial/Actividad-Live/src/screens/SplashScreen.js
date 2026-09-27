// Pantalla de bienvenida animada. Mientras corre la animacion,
// el contexto va pidiendo las imagenes a waifu.im.

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useGacha } from '../context/GachaContext';
import { colores } from '../theme';

export default function SplashScreen({ onTerminar }) {
  const { estadoApi } = useGacha();

  const opacidad = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.4)).current;
  const posicionTexto = useRef(new Animated.Value(30)).current;
  const latido = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(latido, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(latido, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacidad, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(escala, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(posicionTexto, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.timing(opacidad, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onTerminar());
  }, []);

  return (
    <View style={styles.contenedor}>
      <Animated.Image
        source={require('../../assets/logo.png')}
        resizeMode="contain"
        style={[
          styles.logo,
          { opacity: opacidad, transform: [{ scale: Animated.multiply(escala, latido) }] },
        ]}
      />

      <Animated.Text
        style={[
          styles.titulo,
          { opacity: opacidad, transform: [{ translateY: posicionTexto }] },
        ]}
      >
        Gacha Invocador
      </Animated.Text>

      <Animated.Text style={[styles.pie, { opacity: opacidad }]}>
        {estadoApi === 'cargando' ? 'Invocando waifus...' : 'Listo para invocar'}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.fondo,
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: 24,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colores.rosaFuerte,
    marginBottom: 8,
  },
  pie: {
    color: colores.textoSuave,
  },
});
