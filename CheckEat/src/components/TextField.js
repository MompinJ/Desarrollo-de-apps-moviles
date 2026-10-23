import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { borders, colors, typography } from '../constants/designSystem';
import Kicker from './Kicker';

export default function TextField({ label, secure, style, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={style}>
      <Kicker>{label}</Kicker>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.mutedText}
          secureTextEntry={secure && !visible}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
        />
        {secure ? (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
            <Kicker>{visible ? 'Ocultar' : 'Ver'}</Kicker>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: borders.width.normal,
    borderBottomColor: borders.color.DEFAULT,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.primary,
    fontSize: 14,
    color: colors.black,
    paddingTop: 10,
    paddingBottom: 12,
  },
});
