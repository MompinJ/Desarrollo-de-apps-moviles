// Pantalla de bienvenida con la pokebola animada (Animated, como en el ejercicio 10).

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme';

export default function SplashScreen({ onTerminar }) {
  const opacidad = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0)).current;
  const giro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacidad, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(escala, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(giro, { toValue: 1, duration: 1400, useNativeDriver: true }),
    ]).start();

    const temporizador = setTimeout(onTerminar, 2000);

    return () => clearTimeout(temporizador);
  }, []);

  const rotacion = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.contenedor}>
      <Animated.View
        style={[styles.bola, { opacity: opacidad, transform: [{ scale: escala }, { rotate: rotacion }] }]}
      >
        <View style={styles.mitadRoja} />
        <View style={styles.linea} />
        <View style={styles.boton} />
      </Animated.View>

      <Animated.Text style={[styles.titulo, { opacity: opacidad }]}>Pokedex</Animated.Text>
      <Text style={styles.subtitulo}>Primera generacion</Text>
    </View>
  );
}

const TAM = 130;

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.rojo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bola: {
    width: TAM,
    height: TAM,
    borderRadius: TAM / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: colores.gris,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mitadRoja: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TAM / 2 - 3,
    backgroundColor: colores.rojoOscuro,
  },
  linea: {
    position: 'absolute',
    top: TAM / 2 - 9,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colores.gris,
  },
  boton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: colores.gris,
  },
  titulo: {
    marginTop: 24,
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#FFD6CC',
    fontSize: 15,
    marginTop: 4,
  },
});
