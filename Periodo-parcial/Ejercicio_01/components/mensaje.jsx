import { StyleSheet, Text, View } from 'react-native';

export default function Mensaje(props) {
  const variableMensaje=props.texto;
  const num=props.numero;

  const double=n => n*2;



  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>{variableMensaje + " " + double(num)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: '#eee',
  },
  texto: {
    fontSize: 16,
  },
});
