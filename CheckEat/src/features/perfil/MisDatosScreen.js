import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Aviso from '../../components/Aviso';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Kicker from '../../components/Kicker';
import ScreenContainer from '../../components/ScreenContainer';
import { colors, typography } from '../../constants/designSystem';
import { useAuth } from '../../context/AuthContext';
import { getMiPerfil } from '../../services/pacientes';
import { MESES } from '../../utils/fechas';

function formatearFecha(valor) {
  if (!valor) return null;
  const [anio, mes, dia] = String(valor).slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}

function calcularEdad(valor) {
  if (!valor) return null;
  const [anio, mes, dia] = String(valor).slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad--;
  return edad;
}

const GENEROS = { F: 'Femenino', M: 'Masculino' };
const SIN_EXPEDIENTE = 'sin-expediente';

function conUnidad(valor, unidad, decimales) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return null;
  return `${Number(valor).toFixed(decimales)} ${unidad}`;
}

function Dato({ label, value }) {
  return (
    <View style={styles.dato}>
      <Kicker>{label}</Kicker>
      <Text style={[styles.valor, !value && styles.valorVacio]}>{value || 'Sin registrar'}</Text>
    </View>
  );
}

export default function MisDatosScreen({ navigation }) {
  const { token, signOut } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPerfil(await getMiPerfil(token));
    } catch (e) {
      if (e.status === 401) {
        signOut();
        return;
      }
      setError(e.status === 404 ? SIN_EXPEDIENTE : e.message);
    } finally {
      setLoading(false);
    }
  }, [token, signOut]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const usuario = perfil?.usuario;
  const paciente = perfil?.paciente;
  const medidas = perfil?.evaluacion_antropometrica;
  const nombreCompleto = [usuario?.nombre, usuario?.apellido_paterno, usuario?.apellido_materno]
    .filter(Boolean)
    .join(' ');
  const edad = calcularEdad(paciente?.fecha_nacimiento);
  const nacimiento = formatearFecha(paciente?.fecha_nacimiento);
  const ultimaToma = formatearFecha(medidas?.fecha_evaluacion);
  const imc = medidas?.imc_resultado != null
    ? [Number(medidas.imc_resultado).toFixed(1), medidas.diagnostico_imc].filter(Boolean).join(' · ')
    : null;

  return (
    <ScreenContainer title="Mis datos" backLabel="Mi perfil" onBack={() => navigation.goBack()}>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary.dark} />
      ) : error === SIN_EXPEDIENTE ? (
        <EmptyState title="Aun no tienes expediente">
          Se crea en tu primera cita con la nutriologa. Despues, tus datos aparecen aqui.
        </EmptyState>
      ) : error ? (
        <>
          <Aviso label="No se pudieron cargar">{error}</Aviso>
          <Button label="Reintentar" ghost onPress={cargar} />
        </>
      ) : (
        <>
          <Kicker tone="accent">{ultimaToma ? `Ultima toma: ${ultimaToma}` : 'Sin mediciones todavia'}</Kicker>

          <Text style={styles.seccion}>Datos personales</Text>
          <Dato label="Nombre" value={nombreCompleto} />
          <Dato label="Matricula" value={usuario?.id_usuario ? String(usuario.id_usuario) : null} />
          <Dato label="Correo" value={usuario?.email} />
          <Dato label="Licenciatura y semestre" value={paciente?.licenciatura_semestre} />
          <Dato label="Genero" value={GENEROS[paciente?.genero] ?? paciente?.genero} />
          <Dato
            label="Fecha de nacimiento"
            value={nacimiento ? `${nacimiento}${edad != null ? ` (${edad} años)` : ''}` : null}
          />
          <Dato label="Telefono" value={paciente?.telefono} />

          <Text style={styles.seccion}>Medidas</Text>
          <Dato label="Peso" value={conUnidad(medidas?.peso_actual, 'kg', 1)} />
          <Dato label="Talla" value={conUnidad(medidas?.estatura_m, 'm', 2)} />
          <Dato label="IMC" value={imc} />

          <Aviso label="Nota">Todo lo mide tu nutriologa en consulta. Aqui solo se consulta, no se edita.</Aviso>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 40,
  },
  seccion: {
    fontFamily: typography.fonts.heading,
    fontSize: 18,
    letterSpacing: -0.36,
    color: colors.black,
    marginTop: 26,
    marginBottom: 4,
  },
  dato: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.softBorder,
  },
  valor: {
    fontFamily: typography.fonts.primary,
    fontSize: 14,
    color: colors.black,
    marginTop: 4,
  },
  valorVacio: {
    color: colors.mutedText,
  },
});
