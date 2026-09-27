// Componente funcional 2: inventario con FlatList, buscador y ficha en Modal.

import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotonKawaii from '../components/BotonKawaii';
import CartaPersonaje from '../components/CartaPersonaje';
import FichaModal from '../components/FichaModal';
import { useGacha } from '../context/GachaContext';
import { colores, radio } from '../theme';

export default function InventarioScreen() {
  const { inventario, reiniciar, imagenDe, copiasDe } = useGacha();

  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  const filtrados = inventario.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.pantalla}>
      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={18} color={colores.textoSuave} />
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre"
          placeholderTextColor={colores.textoSuave}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <Text style={styles.conteo}>
        {filtrados.length} de {inventario.length} invocaciones
      </Text>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.clave}
        renderItem={({ item }) => (
          <CartaPersonaje
            personaje={item}
            imagen={imagenDe(item.id)}
            onPress={() => setSeleccionado(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Ionicons name="heart-dislike-outline" size={40} color={colores.rosaSuave} />
            <Text style={styles.vacioTexto}>
              Todavia no invocas nada. Ve a la seccion Invocar.
            </Text>
          </View>
        }
      />

      <View style={styles.pie}>
        <BotonKawaii
          titulo="Reiniciar cuenta"
          icono="refresh-outline"
          color={colores.lavanda}
          onPress={reiniciar}
        />
      </View>

      <FichaModal
        personaje={seleccionado}
        imagen={seleccionado ? imagenDe(seleccionado.id) : null}
        copias={seleccionado ? copiasDe(seleccionado.id) : 0}
        visible={seleccionado !== null}
        onClose={() => setSeleccionado(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
    paddingTop: 12,
  },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    paddingHorizontal: 14,
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    color: colores.texto,
  },
  conteo: {
    color: colores.textoSuave,
    marginHorizontal: 16,
    marginVertical: 10,
    fontSize: 12,
  },
  vacio: {
    alignItems: 'center',
    padding: 30,
  },
  vacioTexto: {
    color: colores.textoSuave,
    textAlign: 'center',
    marginTop: 10,
  },
  pie: {
    padding: 12,
  },
});
