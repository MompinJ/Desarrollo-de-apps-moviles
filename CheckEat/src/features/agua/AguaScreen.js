import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';
import Button from '../../components/Button';
import Kicker from '../../components/Kicker';
import ScreenContainer from '../../components/ScreenContainer';
import TabBar from '../../components/TabBar';
import { colors, typography } from '../../constants/designSystem';
import { fechaLarga } from '../../utils/fechas';

const BOTELLA = 'M40 6 H60 V22 C60 28 84 32 84 46 V146 C84 152 80 156 74 156 H26 C20 156 16 152 16 146 V46 C16 32 40 28 40 22 Z';
const BOTELLA_TOP = 6;
const BOTELLA_ALTO = 150;

function formatearVolumen(ml) {
  return ml < 1000 ? `${ml} ml` : `${(ml / 1000).toFixed(1)} L`;
}

function Botella({ porcentaje }) {
  const alto = BOTELLA_ALTO * porcentaje;
  return (
    <Svg viewBox="0 0 100 162" width={164} height={266}>
      <Defs>
        <ClipPath id="botella">
          <Path d={BOTELLA} />
        </ClipPath>
      </Defs>
      <Rect
        x="0"
        y={BOTELLA_TOP + BOTELLA_ALTO - alto}
        width="100"
        height={alto}
        fill={colors.accent.DEFAULT}
        clipPath="url(#botella)"
      />
      <Path d={BOTELLA} fill="none" stroke={colors.black} strokeWidth={3} strokeLinejoin="round" />
    </Svg>
  );
}

export default function AguaScreen() {
  // TODO: la meta sale del plan de la nutriologa y las tomas se deben guardar en el backend.
  // Mientras no existan esos endpoints, la meta es null y las tomas viven solo en memoria.
  const [metaMl] = useState(null);
  const [consumidoMl, setConsumidoMl] = useState(0);

  const porcentaje = metaMl ? Math.min(consumidoMl / metaMl, 1) : 0;
  const agregar = (ml) => setConsumidoMl((actual) => actual + ml);

  return (
    <ScreenContainer kicker={fechaLarga(new Date())} title="Agua" footer={<TabBar active="agua" />}>
      <View style={styles.botellaWrap}>
        <Botella porcentaje={porcentaje} />
      </View>

      <View style={styles.resumen}>
        <Text style={styles.volumen}>{formatearVolumen(consumidoMl)}</Text>
        <Kicker tone={metaMl ? 'green' : 'black'}>
          {metaMl ? `Meta ${formatearVolumen(metaMl)}` : 'Sin meta todavia'}
        </Kicker>
      </View>

      <View style={styles.botones}>
        <View style={styles.boton}>
          <Button label="+ 250 ml" onPress={() => agregar(250)} />
        </View>
        <View style={styles.boton}>
          <Button label="+ 500 ml" onPress={() => agregar(500)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  botellaWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  volumen: {
    fontFamily: typography.fonts.heading,
    fontSize: 34,
    letterSpacing: -0.68,
    color: colors.accent.DEFAULT,
  },
  botones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  boton: {
    flex: 1,
  },
});
