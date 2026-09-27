import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ListaLugares({ lugares, onSeleccionar, onBorrar }) {
  if (lugares.length === 0) {
    return (
      <View style={styles.panel}>
        <Text style={styles.vacio}>Manten presionado el mapa para guardar un lugar</Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <FlatList
        horizontal
        data={lugares}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.tarjeta}
            onPress={() => onSeleccionar(item)}
            onLongPress={() => onBorrar(item.id)}
          >
            <Text style={styles.nombre}>Lugar {index + 1}</Text>
            <Text style={styles.coords}>
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  vacio: {
    backgroundColor: 'rgba(20, 24, 33, 0.85)',
    color: '#ffffff',
    padding: 12,
    borderRadius: 10,
    textAlign: 'center',
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 140,
    elevation: 4,
  },
  nombre: {
    fontWeight: 'bold',
    color: '#0b6e4f',
  },
  coords: {
    fontSize: 12,
    color: '#555',
  },
});
