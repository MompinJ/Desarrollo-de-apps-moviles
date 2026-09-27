import { Button, Image, Modal, StyleSheet, Text, View } from 'react-native';

export default function CustomModal({ visible, onClose, contenido }) {
  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.containerModal}>

        <View style={styles.viewModal}>

          <Image
            source={require('../assets/anime.png')}
            style={styles.imagen}
          />
          <Text style={styles.texto}>{contenido}</Text>
          <Button
            title='Cerrar modale'
            onPress={onClose}
          />

        </View>

      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  viewModal: {
    backgroundColor: '#fff',
    marginHorizontal: 30,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    gap: 15,
    elevation: 5,
  },

  imagen: {
    width: 220,
    height: 199,
    resizeMode: 'contain',
  },

  texto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
