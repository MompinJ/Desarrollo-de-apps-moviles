// Intercambio 1 a 1 de pokemones entre dos celulares por Bluetooth.
//
// Los dos abren esta pantalla y tocan "Buscar". Cada celular espera conexiones y,
// a la vez, lista los dispositivos cercanos: quien toque al otro inicia la conexion.
// Ya conectados, cada quien elige un pokemon que el otro no tenga y ambos confirman.
//
// Mensajes (JSON, uno por linea):
//   { t: 'hola', tengo: [ids] }          mi coleccion
//   { t: 'oferta', id }                  el pokemon que entrego
//   { t: 'ok', da, recibe }              confirmo este intercambio exacto
//   { t: 'adios' }                       cancelo

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as bt from '../bluetooth/bluetooth';
import { imagenDe } from '../data/imagenes';
import { obtenerPokemon } from '../data/pokemon';
import { usePokedex } from '../context/PokedexContext';
import { formatearNombre, formatearNumero } from '../components/PokemonItem';
import { colores, radio, sombra } from '../theme';

const SESION_VACIA = { suColeccion: [], miOferta: null, suOferta: null, miOk: false, suOk: false };

export default function TransferenciaScreen({ navigation }) {
  const { encontradosRef, intercambiar } = usePokedex();

  // fase: 'inicio' | 'buscando' | 'conectando' | 'intercambio' | 'listo' | 'cancelado'
  const [fase, setFase] = useState('inicio');
  const [mensaje, setMensaje] = useState('');
  const [dispositivos, setDispositivos] = useState([]);
  const [explorando, setExplorando] = useState(false);
  const [sesion, setSesion] = useState(SESION_VACIA);
  const [recibido, setRecibido] = useState(null);

  const faseRef = useRef('inicio');
  const sesionRef = useRef(SESION_VACIA);
  const conexion = useRef(null);
  const suscripciones = useRef([]);

  function cambiarFase(nueva) {
    faseRef.current = nueva;
    setFase(nueva);
  }

  function actualizar(parcial) {
    sesionRef.current = { ...sesionRef.current, ...parcial };
    setSesion(sesionRef.current);
  }

  // Todo lo que se pueda ofrecer: lo que yo tengo y el otro no.
  function disponibles() {
    const suyos = sesionRef.current.suColeccion;

    return Object.keys(encontradosRef.current)
      .map(Number)
      .filter((id) => !suyos.includes(id))
      .sort((a, b) => a - b);
  }

  function limpiar() {
    suscripciones.current.forEach((s) => s.remove());
    suscripciones.current = [];

    if (conexion.current) {
      bt.desconectar(conexion.current);
      conexion.current = null;
    }
  }

  function cerrar(nuevaFase, texto) {
    limpiar();
    setMensaje(texto || '');
    cambiarFase(nuevaFase);
  }

  // ----- Mensajes del otro celular -----

  function alRecibir(msg) {
    const actual = sesionRef.current;

    if (msg.t === 'hola') {
      actualizar({ suColeccion: msg.tengo });
    } else if (msg.t === 'oferta') {
      // Solo se acepta un pokemon que yo no tenga.
      if (!encontradosRef.current[msg.id] && obtenerPokemon(msg.id)) {
        actualizar({ suOferta: msg.id, miOk: false, suOk: false });
      }
    } else if (msg.t === 'ok') {
      // Solo cuenta si confirma exactamente el intercambio que yo veo.
      if (msg.da === actual.suOferta && msg.recibe === actual.miOferta) {
        actualizar({ suOk: true });
        revisarCompleto();
      }
    } else if (msg.t === 'adios') {
      if (faseRef.current !== 'listo') {
        cerrar('cancelado', 'La otra persona cancelo el intercambio.');
      }
    }
  }

  function revisarCompleto() {
    const s = sesionRef.current;

    if (faseRef.current === 'intercambio' && s.miOk && s.suOk && s.miOferta && s.suOferta) {
      intercambiar(s.miOferta, s.suOferta);
      setRecibido(s.suOferta);
      cerrar('listo');
    }
  }

  // ----- Conexion -----

  function iniciarSesion(dispositivo) {
    conexion.current = dispositivo;
    sesionRef.current = SESION_VACIA;
    setSesion(SESION_VACIA);
    setRecibido(null);
    cambiarFase('intercambio');

    suscripciones.current.push(bt.escuchar(dispositivo, alRecibir));
    suscripciones.current.push(
      bt.alDesconectar(() => {
        if (faseRef.current === 'intercambio') {
          cerrar('cancelado', 'Se perdio la conexion.');
        }
      })
    );

    bt.enviar(dispositivo, { t: 'hola', tengo: Object.keys(encontradosRef.current).map(Number) });
  }

  async function esperar() {
    // accept() se queda esperando hasta que alguien se conecte o se cancele.
    try {
      const dispositivo = await bt.esperarConexion();

      if (faseRef.current === 'buscando') {
        bt.cancelarBusqueda();
        iniciarSesion(dispositivo);
      } else if (dispositivo) {
        bt.desconectar(dispositivo);
      }
    } catch (error) {
      console.log('accept termino:', error.message);
    }
  }

  async function explorar() {
    setExplorando(true);

    try {
      const vinculados = await bt.dispositivosVinculados();

      setDispositivos(vinculados);

      const cercanos = await bt.descubrir();
      const lista = [...vinculados];

      cercanos.forEach((d) => {
        if (!lista.some((v) => v.address === d.address)) lista.push(d);
      });

      setDispositivos(lista);
    } catch (error) {
      console.log('Busqueda fallo:', error.message);
    }

    setExplorando(false);
  }

  async function buscar() {
    setMensaje('');

    if (!(await bt.pedirPermisos())) {
      setMensaje('Se necesitan los permisos de Bluetooth para transferir.');
      return;
    }

    if (!(await bt.activarBluetooth())) {
      setMensaje('Activa el Bluetooth para transferir.');
      return;
    }

    cambiarFase('buscando');
    esperar();
    explorar();
  }

  async function conectarCon(dispositivo) {
    await bt.cancelarEspera();
    await bt.cancelarBusqueda();
    cambiarFase('conectando');

    try {
      iniciarSesion(await bt.conectar(dispositivo.address));
    } catch (error) {
      console.log('No se pudo conectar:', error.message);
      cerrar('inicio', 'No se pudo conectar con ' + dispositivo.nombre + '.');
    }
  }

  function dejarDeBuscar() {
    bt.cancelarEspera();
    bt.cancelarBusqueda();
    setExplorando(false);
    cambiarFase('inicio');
  }

  // ----- Acciones del intercambio -----

  function ofrecer(id) {
    actualizar({ miOferta: id, miOk: false, suOk: false });
    bt.enviar(conexion.current, { t: 'oferta', id });
  }

  function confirmar() {
    const s = sesionRef.current;

    actualizar({ miOk: true });
    bt.enviar(conexion.current, { t: 'ok', da: s.miOferta, recibe: s.suOferta });
    revisarCompleto();
  }

  function cancelar() {
    if (conexion.current) {
      bt.enviar(conexion.current, { t: 'adios' });
    }

    cerrar('inicio');
  }

  // Al salir de la pantalla se cancela todo.
  useEffect(() => {
    if (!bt.disponible) return;

    const alSalir = navigation.addListener('blur', () => {
      if (faseRef.current === 'buscando') dejarDeBuscar();
    });

    return () => {
      alSalir();
      bt.cancelarEspera();
      bt.cancelarBusqueda();
      limpiar();
    };
  }, []);

  // ----- Pantallas -----

  if (!bt.disponible) {
    return (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Transferencia</Text>
        <Text style={styles.texto}>
          El Bluetooth entre celulares necesita la app compilada (APK). No esta disponible en Expo Go.
        </Text>
      </View>
    );
  }

  if (fase === 'inicio' || fase === 'cancelado') {
    return (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Transferencia</Text>
        <Text style={styles.texto}>
          Intercambia pokemones con alguien cercano. Los dos deben abrir esta pantalla y tocar Buscar.
        </Text>
        {!!mensaje && <Text style={styles.aviso}>{mensaje}</Text>}
        <Pressable style={styles.boton} onPress={buscar}>
          <Text style={styles.textoBoton}>Buscar</Text>
        </Pressable>
      </View>
    );
  }

  if (fase === 'conectando') {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.rojo} />
        <Text style={styles.texto}>Conectando...</Text>
      </View>
    );
  }

  if (fase === 'buscando') {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.encabezado}>Esperando a la otra persona...</Text>
        <Text style={styles.texto}>
          Toca su celular en la lista, o espera a que ella te toque a ti. Si no aparece, vinculen los
          celulares desde los ajustes de Bluetooth.
        </Text>

        {explorando && <ActivityIndicator color={colores.rojo} style={{ marginVertical: 8 }} />}

        <FlatList
          data={dispositivos}
          keyExtractor={(d) => d.address}
          renderItem={({ item }) => (
            <Pressable style={styles.dispositivo} onPress={() => conectarCon(item)}>
              <Text style={styles.nombreDispositivo}>{item.nombre}</Text>
              <Text style={styles.direccion}>{item.address}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            !explorando && <Text style={styles.vacio}>No se encontraron dispositivos.</Text>
          }
        />

        <View style={styles.fila}>
          <Pressable style={[styles.boton, styles.secundario]} onPress={dejarDeBuscar}>
            <Text style={styles.textoSecundario}>Cancelar</Text>
          </Pressable>
          <Pressable style={[styles.boton, styles.secundario]} onPress={bt.abrirAjustes}>
            <Text style={styles.textoSecundario}>Ajustes</Text>
          </Pressable>
          <Pressable style={styles.boton} onPress={explorar} disabled={explorando}>
            <Text style={styles.textoBoton}>Buscar de nuevo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (fase === 'listo') {
    const pokemon = obtenerPokemon(recibido);

    return (
      <View style={styles.centro}>
        <Text style={[styles.aviso, { color: colores.verde }]}>Intercambio completado!</Text>
        <Image source={imagenDe(recibido)} style={styles.arteGrande} resizeMode="contain" />
        <Text style={styles.nombreGrande}>
          {formatearNumero(recibido)} {formatearNombre(pokemon.nombre)}
        </Text>
        <Text style={styles.texto}>Ya esta en tu Pokedex.</Text>
        <Pressable style={styles.boton} onPress={() => cambiarFase('inicio')}>
          <Text style={styles.textoBoton}>Listo</Text>
        </Pressable>
      </View>
    );
  }

  // fase === 'intercambio'
  const lista = disponibles();
  const miPokemon = sesion.miOferta && obtenerPokemon(sesion.miOferta);
  const suPokemon = sesion.suOferta && obtenerPokemon(sesion.suOferta);
  const puedeConfirmar = !!sesion.miOferta && !!sesion.suOferta && !sesion.miOk;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.encabezado}>Elige el pokemon que entregas</Text>
      <Text style={styles.texto}>Solo aparecen los que la otra persona no tiene.</Text>

      <ScrollView style={{ flexGrow: 0, maxHeight: 280 }} contentContainerStyle={styles.cuadricula}>
        {lista.length === 0 && (
          <Text style={styles.vacio}>No tienes pokemones que la otra persona no tenga.</Text>
        )}
        {lista.map((id) => (
          <Pressable
            key={id}
            style={[styles.celda, sesion.miOferta === id && styles.celdaElegida]}
            onPress={() => ofrecer(id)}
          >
            <Image source={imagenDe(id)} style={styles.imagen} />
            <Text style={styles.nombreCelda} numberOfLines={1}>
              {formatearNombre(obtenerPokemon(id).nombre)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.resumen}>
        <View style={styles.lado}>
          <Text style={styles.etiqueta}>Entregas</Text>
          {miPokemon ? (
            <>
              <Image source={imagenDe(miPokemon.id)} style={styles.imagen} />
              <Text style={styles.nombreCelda}>{formatearNombre(miPokemon.nombre)}</Text>
            </>
          ) : (
            <Text style={styles.vacio}>---</Text>
          )}
        </View>

        <Text style={styles.flechas}>{'<>'}</Text>

        <View style={styles.lado}>
          <Text style={styles.etiqueta}>Recibes</Text>
          {suPokemon ? (
            <>
              <Image source={imagenDe(suPokemon.id)} style={styles.imagen} />
              <Text style={styles.nombreCelda}>{formatearNombre(suPokemon.nombre)}</Text>
            </>
          ) : (
            <Text style={styles.vacio}>Esperando...</Text>
          )}
        </View>
      </View>

      <Text style={styles.texto}>
        {sesion.miOk ? 'Esperando que la otra persona confirme...' : sesion.suOk ? 'La otra persona ya confirmo.' : ''}
      </Text>

      <View style={styles.fila}>
        <Pressable style={[styles.boton, styles.secundario]} onPress={cancelar}>
          <Text style={styles.textoSecundario}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.boton, !puedeConfirmar && styles.deshabilitado]}
          onPress={confirmar}
          disabled={!puedeConfirmar}
        >
          <Text style={styles.textoBoton}>Confirmar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 16,
  },
  centro: {
    flex: 1,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colores.gris,
  },
  encabezado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colores.gris,
  },
  texto: {
    color: colores.textoSuave,
    textAlign: 'center',
    fontSize: 15,
    marginVertical: 8,
  },
  aviso: {
    color: colores.rojo,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  boton: {
    backgroundColor: colores.rojo,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secundario: {
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  textoSecundario: {
    color: colores.gris,
    fontWeight: 'bold',
  },
  deshabilitado: {
    opacity: 0.4,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dispositivo: {
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    ...sombra,
  },
  nombreDispositivo: {
    fontWeight: 'bold',
    color: colores.gris,
    fontSize: 16,
  },
  direccion: {
    color: colores.textoSuave,
    fontSize: 12,
  },
  vacio: {
    color: colores.textoSuave,
    textAlign: 'center',
    marginVertical: 12,
  },
  cuadricula: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  celda: {
    width: 90,
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    padding: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  celdaElegida: {
    borderColor: colores.rojo,
    backgroundColor: colores.rojoSuave,
  },
  imagen: {
    width: 64,
    height: 64,
  },
  nombreCelda: {
    fontWeight: 'bold',
    color: colores.gris,
    fontSize: 12,
  },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    padding: 12,
    marginVertical: 10,
    ...sombra,
  },
  lado: {
    alignItems: 'center',
    width: 110,
  },
  etiqueta: {
    color: colores.textoSuave,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  flechas: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.rojo,
  },
  arteGrande: {
    width: 200,
    height: 200,
  },
  nombreGrande: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.gris,
  },
});
