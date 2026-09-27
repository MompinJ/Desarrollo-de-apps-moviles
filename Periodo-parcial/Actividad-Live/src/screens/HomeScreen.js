// Menu principal con el resumen y los accesos a las 4 secciones.

import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotonKawaii from '../components/BotonKawaii';
import { useGacha } from '../context/GachaContext';
import PERSONAJES from '../data/personajes';
import { colores, radio, sombra } from '../theme';

function Dato({ icono, valor, etiqueta }) {
  return (
    <View style={styles.dato}>
      <Ionicons name={icono} size={22} color={colores.rosa} />
      <Text style={styles.datoValor}>{valor}</Text>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { inventario, tiradas, estadoApi } = useGacha();

  const unicos = new Set(inventario.map((p) => p.id)).size;

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <Image
        source={require('../../assets/logo.png')}
        resizeMode="contain"
        style={styles.logo}
      />

      <Text style={styles.titulo}>Gacha Invocador</Text>
      <Text style={styles.subtitulo}>Invoca, colecciona y completa tu album</Text>

      <View style={styles.panel}>
        <Dato icono="sparkles" valor={tiradas} etiqueta="tiradas" />
        <Dato icono="heart" valor={inventario.length} etiqueta="obtenidas" />
        <Dato icono="albums" valor={unicos + '/' + PERSONAJES.length} etiqueta="album" />
      </View>

      {estadoApi === 'error' ? (
        <View style={styles.aviso}>
          <Ionicons name="cloud-offline-outline" size={18} color={colores.rosaFuerte} />
          <Text style={styles.avisoTexto}>
            No se pudo conectar con waifu.im. Se muestran las iniciales.
          </Text>
        </View>
      ) : null}

      <View style={styles.botones}>
        <BotonKawaii
          titulo="Invocar"
          icono="sparkles-outline"
          onPress={() => navigation.navigate('Invocar')}
        />
        <View style={styles.espacio} />
        <BotonKawaii
          titulo="Inventario"
          icono="list-outline"
          color={colores.lavanda}
          onPress={() => navigation.navigate('Inventario')}
        />
        <View style={styles.espacio} />
        <BotonKawaii
          titulo="Coleccion"
          icono="albums-outline"
          color={colores.lavanda}
          onPress={() => navigation.navigate('Coleccion')}
        />
        <View style={styles.espacio} />
        <BotonKawaii
          titulo="Estadisticas"
          icono="stats-chart-outline"
          color={colores.lavanda}
          onPress={() => navigation.navigate('Estadisticas')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colores.rosaFuerte,
    marginTop: 8,
  },
  subtitulo: {
    color: colores.textoSuave,
    marginBottom: 18,
  },
  panel: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    paddingVertical: 16,
    marginBottom: 16,
    ...sombra,
  },
  dato: {
    flex: 1,
    alignItems: 'center',
  },
  datoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginTop: 4,
  },
  datoEtiqueta: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.rosaSuave,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  avisoTexto: {
    flex: 1,
    marginLeft: 8,
    color: colores.texto,
    fontSize: 12,
  },
  botones: {
    width: '100%',
  },
  espacio: {
    height: 12,
  },
});
