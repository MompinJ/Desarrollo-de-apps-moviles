import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Login from './components/Login';

// Con el celular por USB se usa localhost gracias a adb reverse (npm run usb)
const API_URL = 'http://localhost:4000';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);

  // Las peliculas se cargan hasta que el usuario inicia sesion
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_URL}/movies`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [user]);

  // El boton atras de Android regresa a la lista en vez de cerrar la app
  useEffect(() => {
    if (!selected) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelected(null);
      return true;
    });
    return () => sub.remove();
  }, [selected]);

  if (!user) {
    return <Login apiUrl={API_URL} onLogin={setUser} />;
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0446ed" />
      </View>
    );
  }

  if (selected) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.detail}>
        <Pressable onPress={() => setSelected(null)} style={styles.backButton}>
          <Text style={styles.backText}>{'< Regresar'}</Text>
        </Pressable>
        {selected.poster ? (
          <Image source={{ uri: selected.poster }} style={styles.posterLarge} />
        ) : (
          <View style={[styles.noImage, styles.posterLarge]}>
            <Text>No Image</Text>
          </View>
        )}
        <Text style={styles.detailTitle}>{selected.title}</Text>
        <Text style={styles.detailPlot}>{selected.fullplot || "Sin descripción"}</Text>
      </ScrollView>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => setSelected(item)}>
      {item.poster ? (
        <Image source={{ uri: item.poster }} style={styles.poster} />
      ) : (
        <View style={styles.noImage}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title} </Text>
        <Text numberOfLines={3}>{item.fullplot || "Sin descripción"} </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hola, {user}</Text>
        <Pressable onPress={() => setUser(null)}>
          <Text style={styles.backText}>Salir</Text>
        </Pressable>
      </View>
      <FlatList
        data={movies}
        keyExtractor={(item, index) => String(item._id || item.id || index)}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    marginTop: 40, 
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    flexDirection: "row",
    padding: 20,
    margin: 10,
    backgroundColor: "#fafaab",
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  poster: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8, 
  },
  noImage: {
    width: 100,
    height: 150,
    backgroundColor: '#e1e4e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#0446ed',
    fontWeight: 'bold',
  },
  posterLarge: {
    width: 250,
    height: 375,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  detailPlot: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
});