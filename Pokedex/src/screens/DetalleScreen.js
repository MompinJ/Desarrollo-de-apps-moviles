// Ficha de un pokemon, leida del catalogo local.

import { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { imagenDe } from '../data/imagenes';
import { obtenerPokemon } from '../data/pokemon';
import { usePokedex } from '../context/PokedexContext';
import TipoInsignia from '../components/TipoInsignia';
import { formatearNombre, formatearNumero } from '../components/PokemonItem';
import { colorTipo, colores, radio, sombra } from '../theme';

const NOMBRE_STAT = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque esp.',
  'special-defense': 'Defensa esp.',
  speed: 'Velocidad',
};

export default function DetalleScreen({ route, navigation }) {
  const { id } = route.params;
  const { encontrados, alternarEncontrado } = usePokedex();

  const pokemon = obtenerPokemon(id);
  const encontrado = !!encontrados[id];

  useEffect(() => {
    navigation.setOptions({ title: encontrado ? formatearNombre(pokemon.nombre) : formatearNumero(id) });
  }, [encontrado]);

  const colorPrincipal = colorTipo[pokemon.tipos[0]] || colores.rojo;

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={[styles.cabecera, { backgroundColor: colorPrincipal }]}>
        <Image
          source={imagenDe(id)}
          style={[styles.arte, !encontrado && styles.silueta]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.numero}>{formatearNumero(id)}</Text>
        <Text style={styles.nombre}>{encontrado ? formatearNombre(pokemon.nombre) : '???'}</Text>

        <View style={styles.tipos}>
          {pokemon.tipos.map((t) => (
            <TipoInsignia key={t} tipo={t} />
          ))}
        </View>

        <View style={styles.medidas}>
          <View style={styles.medida}>
            <Text style={styles.valorMedida}>{pokemon.altura} m</Text>
            <Text style={styles.etiqueta}>Altura</Text>
          </View>
          <View style={styles.medida}>
            <Text style={styles.valorMedida}>{pokemon.peso} kg</Text>
            <Text style={styles.etiqueta}>Peso</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Estadisticas base</Text>
        {pokemon.stats.map((s) => (
          <View key={s.nombre} style={styles.filaStat}>
            <Text style={styles.nombreStat}>{NOMBRE_STAT[s.nombre] || s.nombre}</Text>
            <Text style={styles.valorStat}>{s.valor}</Text>
            <View style={styles.barraFondo}>
              <View
                style={[
                  styles.barra,
                  { width: Math.min(s.valor / 160, 1) * 100 + '%', backgroundColor: colorPrincipal },
                ]}
              />
            </View>
          </View>
        ))}
      

        <Pressable
          style={[styles.boton, encontrado && styles.botonEncontrado]}
          onPress={() => alternarEncontrado(id)}
        >
          <Text style={styles.textoBoton}>
            {encontrado ? 'Marcado como encontrado' : 'Marcar como encontrado'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  cabecera: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arte: {
    width: 200,
    height: 200,
  },
  silueta: {
    tintColor: '#000000',
    opacity: 0.3,
  },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    marginHorizontal: 16,
    marginTop: -30,
    padding: 20,
    ...sombra,
  },
  numero: {
    color: colores.textoSuave,
    fontWeight: 'bold',
  },
  nombre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colores.gris,
  },
  tipos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  medidas: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  medida: {
    flex: 1,
    alignItems: 'center',
  },
  valorMedida: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colores.gris,
  },
  etiqueta: {
    color: colores.textoSuave,
  },
  seccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.gris,
    marginBottom: 10,
  },
  filaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nombreStat: {
    width: 100,
    color: colores.textoSuave,
  },
  valorStat: {
    width: 36,
    fontWeight: 'bold',
    color: colores.gris,
  },
  barraFondo: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.fondo,
    overflow: 'hidden',
  },
  barra: {
    height: 8,
    borderRadius: 4,
  },
  boton: {
    backgroundColor: colores.rojo,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botonEncontrado: {
    backgroundColor: colores.verde,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
