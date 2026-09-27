import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import ListaLugares from './components/ListaLugares';

// Ubicacion por defecto si no hay permiso (Guadalajara centro)
const REGION_INICIAL = {
  latitude: 20.6767,
  longitude: -103.3475,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function App() {
  const mapa = useRef(null);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [lugares, setLugares] = useState([]);
  const [tipoMapa, setTipoMapa] = useState('standard');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMensaje('Sin permiso de ubicacion, mostrando region por defecto');
        setCargando(false);
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({});
      setMiUbicacion(posicion.coords);
      setCargando(false);
    })();
  }, []);

  const irA = (coords) => {
    mapa.current?.animateToRegion(
      { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      800
    );
  };

  const guardarLugar = (evento) => {
    const { latitude, longitude } = evento.nativeEvent.coordinate;
    setLugares((prev) => [...prev, { id: Date.now().toString(), latitude, longitude }]);
  };

  const borrarLugar = (id) => {
    setLugares((prev) => prev.filter((l) => l.id !== id));
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#0b6e4f" />
        <Text>Buscando tu ubicacion...</Text>
      </View>
    );
  }

  const region = miUbicacion
    ? { latitude: miUbicacion.latitude, longitude: miUbicacion.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : REGION_INICIAL;

  return (
    <View style={styles.pantalla}>
      <MapView
        ref={mapa}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        mapType={tipoMapa}
        showsUserLocation
        onLongPress={guardarLugar}
      >
        {lugares.map((lugar, i) => (
          <Marker
            key={lugar.id}
            coordinate={lugar}
            title={`Lugar ${i + 1}`}
            pinColor="#0b6e4f"
          />
        ))}
        {lugares.length > 1 && (
          <Polyline coordinates={lugares} strokeColor="#0b6e4f" strokeWidth={3} />
        )}
      </MapView>

      <View style={styles.barraSuperior}>
        <Text style={styles.titulo}>Mis lugares</Text>
        <View style={styles.acciones}>
          <Pressable
            style={styles.boton}
            onPress={() => setTipoMapa(tipoMapa === 'standard' ? 'satellite' : 'standard')}
          >
            <Text style={styles.textoBoton}>{tipoMapa === 'standard' ? 'Satelite' : 'Normal'}</Text>
          </Pressable>
          {miUbicacion && (
            <Pressable style={styles.boton} onPress={() => irA(miUbicacion)}>
              <Text style={styles.textoBoton}>Yo</Text>
            </Pressable>
          )}
        </View>
      </View>

      {mensaje ? <Text style={styles.aviso}>{mensaje}</Text> : null}

      <ListaLugares lugares={lugares} onSeleccionar={irA} onBorrar={borrarLugar} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  barraSuperior: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b6e4f',
  },
  acciones: {
    flexDirection: 'row',
    gap: 8,
  },
  boton: {
    backgroundColor: '#0b6e4f',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textoBoton: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  aviso: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: '#fff4d6',
    padding: 8,
    borderRadius: 8,
  },
});
