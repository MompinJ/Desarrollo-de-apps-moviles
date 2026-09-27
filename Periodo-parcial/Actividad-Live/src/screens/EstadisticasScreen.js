// Componente funcional 4: estadisticas con SectionList.
// Compara la tasa real del jugador contra la tasa oficial del gacha.

import { SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotonKawaii from '../components/BotonKawaii';
import { useGacha } from '../context/GachaContext';
import PERSONAJES, { PROBABILIDADES, RAREZAS, personajesPorRareza } from '../data/personajes';
import { colorRareza, colores, radio, sombra } from '../theme';

export default function EstadisticasScreen() {
  const { inventario, tiradas, copiasDe, estadoApi, cargarImagenes } = useGacha();

  function porcentaje(cantidad) {
    if (tiradas === 0) {
      return '0.0';
    }
    return ((cantidad / tiradas) * 100).toFixed(1);
  }

  const tasas = RAREZAS.map((rareza) => {
    const cantidad = inventario.filter((p) => p.rareza === rareza).length;

    return {
      clave: 'tasa-' + rareza,
      etiqueta: rareza,
      color: colorRareza[rareza],
      valor: porcentaje(cantidad) + '%',
      detalle: cantidad + ' invocaciones, oficial ' + PROBABILIDADES[rareza] + '%',
    };
  });

  const avance = RAREZAS.map((rareza) => {
    const lista = personajesPorRareza(rareza);
    const obtenidos = lista.filter((p) => copiasDe(p.id) > 0).length;

    return {
      clave: 'avance-' + rareza,
      etiqueta: rareza,
      color: colorRareza[rareza],
      valor: obtenidos + '/' + lista.length,
      detalle: 'personajes desbloqueados',
    };
  });

  const unicos = new Set(inventario.map((p) => p.id)).size;

  const general = [
    { clave: 'tiradas', etiqueta: 'Tiradas', color: colores.rosa, valor: String(tiradas), detalle: 'capsulas abiertas' },
    { clave: 'obtenidos', etiqueta: 'Obtenidas', color: colores.rosa, valor: String(inventario.length), detalle: 'cartas en el inventario' },
    { clave: 'unicos', etiqueta: 'Album', color: colores.lavanda, valor: unicos + '/' + PERSONAJES.length, detalle: 'personajes distintos' },
    { clave: 'repetidos', etiqueta: 'Repetidas', color: colores.lavanda, valor: String(inventario.length - unicos), detalle: 'cartas duplicadas' },
  ];

  const secciones = [
    { titulo: 'Resumen general', data: general },
    { titulo: 'Tasa de aparicion', data: tasas },
    { titulo: 'Avance del album', data: avance },
  ];

  return (
    <View style={styles.pantalla}>
      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.clave}
        contentContainerStyle={styles.lista}
        renderSectionHeader={({ section }) => (
          <Text style={styles.titulo}>{section.titulo}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.renglon}>
            <View style={[styles.punto, { backgroundColor: item.color }]} />
            <View style={styles.textos}>
              <Text style={styles.etiqueta}>{item.etiqueta}</Text>
              <Text style={styles.detalle}>{item.detalle}</Text>
            </View>
            <Text style={styles.valor}>{item.valor}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.pie}>
            <View style={styles.estado}>
              <Ionicons
                name={estadoApi === 'listo' ? 'cloud-done-outline' : 'cloud-offline-outline'}
                size={18}
                color={colores.rosaFuerte}
              />
              <Text style={styles.estadoTexto}>
                waifu.im: {estadoApi === 'listo' ? 'conectada' : estadoApi}
              </Text>
            </View>

            <BotonKawaii
              titulo="Recargar imagenes"
              icono="reload-outline"
              color={colores.lavanda}
              onPress={cargarImagenes}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  lista: {
    padding: 12,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.rosaFuerte,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  renglon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    padding: 14,
    marginBottom: 8,
    ...sombra,
  },
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  textos: {
    flex: 1,
  },
  etiqueta: {
    fontWeight: 'bold',
    color: colores.texto,
  },
  detalle: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  valor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
  },
  pie: {
    marginTop: 20,
  },
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  estadoTexto: {
    marginLeft: 8,
    color: colores.textoSuave,
  },
});
