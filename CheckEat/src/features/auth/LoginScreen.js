import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Aviso from '../../components/Aviso';
import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const correo = email.trim();
    if (!EMAIL_RE.test(correo)) {
      setError('Escribe un correo valido');
      return;
    }
    if (!password) {
      setError('Escribe tu contrasena');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Si entra, el navegador cambia de stack y esta pantalla se desmonta.
      await signIn(correo, password);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <ScreenContainer title="Entrar" backLabel="Inicio" onBack={() => navigation.goBack()}>
      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="paciente@correo.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        editable={!loading}
      />
      <TextField
        label="Contrasena"
        value={password}
        onChangeText={setPassword}
        secure
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        editable={!loading}
        style={styles.field}
      />

      {error ? <Aviso label="No se pudo entrar">{error}</Aviso> : null}

      <View style={styles.buttonBlock}>
        <Button label={loading ? 'Entrando...' : 'Acceder'} onPress={handleSubmit} disabled={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 26,
  },
  buttonBlock: {
    marginTop: 20,
  },
});
