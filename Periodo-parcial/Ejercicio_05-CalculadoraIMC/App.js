import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CampoNumero from './components/CampoNumero';
import ResultadoIMC, { clasificar } from './components/ResultadoIMC';

export default function App() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');

  const calcular = () => {
    const kg = parseFloat(peso.replace(',', '.'));
    const cm = parseFloat(altura.replace(',', '.'));

    if (!kg || !cm || kg <= 0 || cm <= 0) {
      setError('Escribe un peso y una altura validos');
      setImc(null);
      return;
    }

    const metros = cm / 100;
    const resultado = kg / (metros * metros);
    setError('');
    setImc(resultado);
    setHistorial((prev) => [
      { id: Date.now().toString(), imc: resultado, peso: kg, altura: cm },
      ...prev,
    ].slice(0, 5));
  };

  const limpiar = () => {
    setPeso('');
    setAltura('');
    setImc(null);
    setError('');
  };

  return (
    <View style={styles.pantalla}>
      <Text style={styles.encabezado}>Calculadora IMC</Text>
      <Text style={styles.subtitulo}>Indice de Masa Corporal - MompinJ</Text>

      <CampoNumero etiqueta="Peso" unidad="kg" valor={peso} onCambio={setPeso} />
      <CampoNumero etiqueta="Altura" unidad="cm" valor={altura} onCambio={setAltura} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.botones}>
        <Pressable style={[styles.boton, styles.botonSecundario]} onPress={limpiar}>
          <Text style={styles.textoBoton}>Limpiar</Text>
        </Pressable>
        <Pressable style={styles.boton} onPress={calcular}>
          <Text style={styles.textoBoton}>Calcular</Text>
        </Pressable>
      </View>

      {imc !== null && <ResultadoIMC imc={imc} />}

      {historial.length > 0 && (
        <>
          <Text style={styles.tituloHistorial}>Ultimos calculos</Text>
          <FlatList
            data={historial}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.filaHistorial}>
                <Text style={styles.textoHistorial}>
                  {item.peso} kg / {item.altura} cm
                </Text>
                <Text style={[styles.textoHistorial, { color: clasificar(item.imc).color }]}>
                  {item.imc.toFixed(1)}
                </Text>
              </View>
            )}
          />
        </>
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#121a27',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  encabezado: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#7a8699',
    marginBottom: 24,
  },
  error: {
    color: '#f0605d',
    marginBottom: 12,
  },
  botones: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  boton: {
    flex: 1,
    backgroundColor: '#3ecf8e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonSecundario: {
    backgroundColor: '#2e3b52',
  },
  textoBoton: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tituloHistorial: {
    color: '#c9d3e3',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  filaHistorial: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2a3c',
  },
  textoHistorial: {
    color: '#ffffff',
  },
});
