import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import CustomModal from './components/CustomModal';

export default function App() {

  const [modal, setModal] = useState(false)

  return (
    <View style={styles.container}>

      <CustomModal
        visible={modal}
        onClose={() => setModal(false)}
      />

      <Image
        source={require('./assets/anime2.png')}
        style={styles.imagen}
      />

      <Text>Olis  </Text>
      <Button
        title='Mostrar modale'
        onPress={() => setModal(true)}
      />

      <StatusBar style="auto" />

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

  imagen: {
    width: 130,
    height: 298,
    resizeMode: 'contain',
  },
});
