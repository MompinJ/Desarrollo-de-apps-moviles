import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import ImagenFondo from './src/components/ImagenFondo';
import FlatListBasics from './src/components/myFlatList';
import SectionListBasics from './src/components/mySectionList';




export default function App() {
  return (
    <View style={styles.container}>

      {/*}
      <ImagenFondo></ImagenFondo>
      <Text>MompinJ</Text>
      <StatusBar style="auto" />
      {*/}

      <FlatListBasics>
      </FlatListBasics>

      <SectionListBasics>

      </SectionListBasics>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
