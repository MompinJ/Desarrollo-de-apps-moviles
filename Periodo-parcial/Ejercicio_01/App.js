import { StyleSheet, Text, View } from 'react-native';
import Cat from './components/Cat';
import Mensaje from './components/mensaje';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Text>Esto es otro componente de texto</Text>
      <Cat />
      <Mensaje texto="Este es un mensaje con props" numero={1000} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2af',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
