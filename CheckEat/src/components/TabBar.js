import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { borders, colors, typography } from '../constants/designSystem';

const ICONS = {
  hoy: (color) => (
    <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke={color} strokeWidth={2}>
      <Rect x="3" y="4" width="18" height="17" />
      <Path d="M8 12l3 3 5-6" />
    </Svg>
  ),
  agua: (color) => (
    <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke={color} strokeWidth={2}>
      <Path d="M12 3l6 8.5A6 6 0 1 1 6 11.5L12 3z" />
    </Svg>
  ),
  cal: (color) => (
    <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke={color} strokeWidth={2}>
      <Rect x="3" y="5" width="18" height="16" />
      <Path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  ),
  perfil: (color) => (
    <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke={color} strokeWidth={2}>
      <Circle cx="12" cy="8.5" r="3.6" />
      <Path d="M4.5 20c1.3-4 4-6 7.5-6s6.2 2 7.5 6" />
    </Svg>
  ),
};

const TABS = [
  { key: 'hoy', label: 'HOY' },
  { key: 'agua', label: 'AGUA' },
  { key: 'cal', label: 'CALEND' },
  { key: 'perfil', label: 'PERFIL' },
];

export default function TabBar({ active, links = {} }) {
  return (
    <View style={styles.tb}>
      {TABS.map((tab) => {
        const isOn = tab.key === active;
        const onPress = links[tab.key];
        const color = isOn ? colors.black : colors.primary.DEFAULT;
        return (
          <Pressable key={tab.key} style={styles.item} disabled={!isOn && !onPress} onPress={onPress}>
            {ICONS[tab.key](color)}
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tb: {
    flexDirection: 'row',
    borderTopWidth: borders.width.normal,
    borderTopColor: borders.color.DEFAULT,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 9,
    paddingBottom: 10,
  },
  label: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 7.5,
    letterSpacing: 0.75,
  },
});
