import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Login({ apiUrl, onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = () => {
    setError('');
    setCargando(true);
    fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCargando(false);
        if (data.ok) {
          onLogin(data.usuario);
        } else {
          setError(data.mensaje);
        }
      })
      .catch((err) => {
        console.error(err);
        setCargando(false);
        setError('No se pudo conectar con el servidor');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Películas</Text>
      <Text style={styles.subtitulo}>Inicia sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onSubmitEditing={entrar}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.boton} onPress={entrar} disabled={cargando}>
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Entrar</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  error: {
    color: '#d00',
    textAlign: 'center',
    marginBottom: 15,
  },
  boton: {
    backgroundColor: '#0446ed',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
