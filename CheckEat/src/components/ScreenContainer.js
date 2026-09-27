import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/designSystem';
import Header from './Header';

export default function ScreenContainer({
  inverted,
  kicker,
  title,
  backLabel,
  onBack,
  footer,
  centerContent,
  children,
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {title ? (
        <Header inverted={inverted} kicker={kicker} title={title} backLabel={backLabel} onBack={onBack} />
      ) : null}
      <ScrollView
        contentContainerStyle={[styles.body, centerContent && styles.bodyCentered]}
      >
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  body: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  bodyCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 0,
  },
});
