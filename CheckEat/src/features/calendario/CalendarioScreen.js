import { StyleSheet, Text, View } from 'react-native';
import Aviso from '../../components/Aviso';
import Kicker from '../../components/Kicker';
import ScreenContainer from '../../components/ScreenContainer';
import TabBar from '../../components/TabBar';
import { borders, colors, typography } from '../../constants/designSystem';
import { MESES, capitalizar } from '../../utils/fechas';

const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Celdas del mes empezando en lunes; null = hueco antes del dia 1.
function celdasDelMes(anio, mes) {
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const totalDias = new Date(anio, mes + 1, 0).getDate();
  return [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];
}

export default function CalendarioScreen() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  const celdas = celdasDelMes(anio, mes);

  return (
    <ScreenContainer kicker={String(anio)} title={capitalizar(MESES[mes])} footer={<TabBar active="cal" />}>
      <View style={styles.grid}>
        {DIAS_SEMANA.map((dia, index) => (
          <View key={`${dia}-${index}`} style={styles.cell}>
            <Kicker>{dia}</Kicker>
          </View>
        ))}
      </View>

      <View style={[styles.grid, styles.gridDias]}>
        {celdas.map((dia, index) => {
          const esHoy = dia === hoy.getDate();
          return (
            <View key={dia ?? `vacio-${index}`} style={styles.cell}>
              {dia ? (
                <View style={[styles.dia, esHoy && styles.diaHoy]}>
                  <Text style={[styles.diaTexto, esHoy && styles.diaTextoHoy]}>{dia}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.adherencia}>
        <Kicker>Adherencia del mes</Kicker>
        <Text style={styles.adherenciaVacia}>Sin datos</Text>
      </View>

      <Aviso label="Sin datos todavia">
        Cuando registres tus comidas, aqui se marcan los dias cumplidos y tus citas.
      </Aviso>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridDias: {
    marginTop: 8,
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    padding: 2.5,
  },
  dia: {
    alignSelf: 'stretch',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaHoy: {
    backgroundColor: colors.primary.dark,
  },
  diaTexto: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 11,
    color: colors.mutedText,
  },
  diaTextoHoy: {
    color: colors.white,
  },
  adherencia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: borders.width.normal,
    borderTopColor: borders.color.DEFAULT,
  },
  adherenciaVacia: {
    fontFamily: typography.fonts.heading,
    fontSize: 15,
    color: colors.mutedText,
  },
});
