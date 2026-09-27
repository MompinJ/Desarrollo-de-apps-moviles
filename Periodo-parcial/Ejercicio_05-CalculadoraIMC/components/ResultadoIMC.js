import { StyleSheet, Text, View } from 'react-native';

const RANGOS = [
  { max: 18.5, nombre: 'Bajo peso', color: '#4fa3f7' },
  { max: 25, nombre: 'Peso normal', color: '#3ecf8e' },
  { max: 30, nombre: 'Sobrepeso', color: '#f5b83d' },
  { max: Infinity, nombre: 'Obesidad', color: '#f0605d' },
];

export function clasificar(imc) {
  return RANGOS.find((rango) => imc < rango.max);
}

export default function ResultadoIMC({ imc }) {
  const rango = clasificar(imc);
  // Escala visual de 15 a 40 para ubicar el indicador en la barra
  const porcentaje = Math.min(Math.max((imc - 15) / 25, 0), 1) * 100;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>Tu IMC</Text>
      <Text style={[styles.valor, { color: rango.color }]}>{imc.toFixed(1)}</Text>
      <Text style={styles.categoria}>{rango.nombre}</Text>

      <View style={styles.barra}>
        {RANGOS.map((r) => (
          <View key={r.nombre} style={[styles.segmento, { backgroundColor: r.color }]} />
        ))}
        <View style={[styles.indicador, { left: `${porcentaje}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#1f2a3c',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  titulo: {
    color: '#c9d3e3',
    fontSize: 14,
  },
  valor: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  categoria: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 16,
  },
  barra: {
    flexDirection: 'row',
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'visible',
  },
  segmento: {
    flex: 1,
  },
  indicador: {
    position: 'absolute',
    top: -5,
    width: 4,
    height: 20,
    marginLeft: -2,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
});
