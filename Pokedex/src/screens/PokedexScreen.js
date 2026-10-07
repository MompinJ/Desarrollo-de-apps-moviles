// Lista completa con filtros (FlatList, como en el ejercicio 06).

import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePokedex } from '../context/PokedexContext';
import PokemonItem from '../components/PokemonItem';
import { colores } from '../theme';

const FILTROS = [
  { clave: 'todos', texto: 'Todos' },
  { clave: 'encontrados', texto: 'Encontrados' },
  { clave: 'faltantes', texto: 'Faltantes' },
];

export default function PokedexScreen({ navigation }) {
  const { catalogo, encontrados, alternarEncontrado } = usePokedex();
  const [filtro, setFiltro] = useState('todos');

  const lista = useMemo(() => {
    return catalogo.filter((p) => {
      const visto = !!encontrados[p.id];

      if (filtro === 'encontrados') return visto;
      if (filtro === 'faltantes') return !visto;
      return true;
    });
  }, [catalogo, encontrados, filtro]);

  return (
    <View style={styles.contenedor}>
      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Pressable
            key={f.clave}
            style={[styles.chip, filtro === f.clave && styles.chipActivo]}
            onPress={() => setFiltro(f.clave)}
          >
            <Text style={[styles.textoChip, filtro === f.clave && styles.textoChipActivo]}>
              {f.texto}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={lista}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <PokemonItem
            pokemon={item}
            encontrado={!!encontrados[item.id]}
            onPress={() => navigation.navigate('Detalle', { id: item.id })}
            onAlternar={() => alternarEncontrado(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.vacio}>Sin resultados</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    margin: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: {
    backgroundColor: colores.rojo,
    borderColor: colores.rojo,
  },
  textoChip: {
    color: colores.gris,
    fontWeight: '600',
  },
  textoChipActivo: {
    color: '#FFFFFF',
  },
  vacio: {
    textAlign: 'center',
    color: colores.textoSuave,
    marginTop: 40,
  },
});
