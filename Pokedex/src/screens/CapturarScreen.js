// Cada 100 pasos (podometro) aparece un pokemon salvaje. Si decides capturarlo,
// inclina el telefono para mantener la mira sobre el pokemon hasta llenar la barra
// (minijuego con el acelerometro, como en el ejercicio 12).

import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Accelerometer, Pedometer } from 'expo-sensors';
import { guardarJson, leerJson } from '../storage/archivos';
import { imagenDe } from '../data/imagenes';
import { usePokedex } from '../context/PokedexContext';
import { formatearNombre, formatearNumero } from '../components/PokemonItem';
import { colores, radio, sombra } from '../theme';

const ANCHO = Math.min(Dimensions.get('window').width - 32, 360);
const ALTO = 320;
const TAM_POKEMON = 90;
const TAM_MIRA = 130;

const TICK = 40; // ms por cuadro del juego
const SENSOR = 40; // ms entre lecturas del acelerometro
const PASOS_POR_ENCUENTRO = 100; // pasos acumulados para que aparezca un pokemon
const ARCHIVO_PASOS = 'pasos.json';
const REPOSO = 0.04; // zona muerta del sensor
const VELOCIDAD_MIRA = 22; // px por cuadro con la inclinacion maxima
const TIEMPO_CAPTURA = 1800; // ms con la mira encima para capturar
const TIEMPO_LIMITE = 35000; // ms antes de que el pokemon escape

const MARGEN = TAM_POKEMON / 2;

function limitar(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}

function puntoAleatorio() {
  return {
    x: MARGEN + Math.random() * (ANCHO - TAM_POKEMON),
    y: MARGEN + Math.random() * (ALTO - TAM_POKEMON),
  };
}

// Los pokemones rapidos se mueven mas deprisa y cuestan mas trabajo.
function velocidadDe(pokemon) {
  const rapidez = pokemon.stats.find((s) => s.nombre === 'speed').valor;

  return 1 + rapidez / 70;
}

// Fases: 'buscando', 'encontrado' (esperando decision), 'jugando', 'capturado' y 'escapo'.
export default function CapturarScreen({ navigation }) {
  const { catalogo, encontrados, alternarEncontrado } = usePokedex();
  const [fase, setFase] = useState('buscando');
  const [salvaje, setSalvaje] = useState(null);
  const [eraNuevo, setEraNuevo] = useState(false);
  const [pasos, setPasos] = useState(0);
  const [estadoPodometro, setEstadoPodometro] = useState('revisando');
  const [juego, setJuego] = useState({ mira: { x: 0, y: 0 }, pokemon: { x: 0, y: 0 }, progreso: 0, restante: 1 });

  const aparicion = useRef(new Animated.Value(0)).current;
  const faseRef = useRef('buscando');
  const encontradosRef = useRef(encontrados);
  const pasosRef = useRef(0);
  const lectura = useRef({ x: 0, y: 0 });
  const calibracion = useRef({ x: 0, y: 0 });

  // Los listeners se crean una sola vez, por eso leen refs.
  encontradosRef.current = encontrados;

  function cambiarFase(nueva) {
    faseRef.current = nueva;
    setFase(nueva);
  }

  function aparecer() {
    const elegido = catalogo[Math.floor(Math.random() * catalogo.length)];

    setSalvaje(elegido);
    cambiarFase('encontrado');
    aparicion.setValue(0);
    Animated.spring(aparicion, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }

  // Suma pasos al contador. Solo se acumulan mientras se esta buscando; al llegar
  // a 100 aparece un pokemon y el sobrante se conserva.
  function sumarPasos(cantidad) {
    if (faseRef.current !== 'buscando') return;

    let total = pasosRef.current + cantidad;

    if (total >= PASOS_POR_ENCUENTRO) {
      total -= PASOS_POR_ENCUENTRO;
      aparecer();
    }

    pasosRef.current = total;
    setPasos(total);
    guardarJson(ARCHIVO_PASOS, total);
  }

  function empezarJuego() {
    // La posicion en la que se sostiene el telefono al empezar es el "cero".
    calibracion.current = { ...lectura.current };
    cambiarFase('jugando');
  }

  function terminarCaptura(pokemon) {
    const nuevo = !encontradosRef.current[pokemon.id];

    if (nuevo) {
      alternarEncontrado(pokemon.id);
    }

    setEraNuevo(nuevo);
    cambiarFase('capturado');
    aparicion.setValue(0.6);
    Animated.spring(aparicion, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }

  // El acelerometro solo escucha mientras la pantalla esta enfocada.
  useEffect(() => {
    let suscripcion = null;

    function activar() {
      Accelerometer.setUpdateInterval(SENSOR);
      suscripcion = Accelerometer.addListener(({ x, y }) => {
        lectura.current = { x, y };
      });
    }

    function desactivar() {
      if (suscripcion) {
        suscripcion.remove();
        suscripcion = null;
      }
    }

    const alEntrar = navigation.addListener('focus', activar);
    const alSalir = navigation.addListener('blur', desactivar);

    activar();

    return () => {
      alEntrar();
      alSalir();
      desactivar();
    };
  }, [catalogo]);

  // Podometro: avisa por cada paso detectado (como en el ejercicio 12). El contador
  // se guarda en un archivo para no perder el avance al cerrar la app.
  useEffect(() => {
    let suscripcion = null;
    let anterior = 0;
    let cancelado = false;

    async function iniciar() {
      const guardado = await leerJson(ARCHIVO_PASOS, 0);

      pasosRef.current = guardado;
      setPasos(guardado);

      if (!(await Pedometer.isAvailableAsync())) {
        setEstadoPodometro('no_disponible');
        return;
      }

      const { status } = await Pedometer.requestPermissionsAsync();

      if (status !== 'granted') {
        setEstadoPodometro('sin_permiso');
        return;
      }

      if (cancelado) return;

      setEstadoPodometro('listo');
      suscripcion = Pedometer.watchStepCount((resultado) => {
        // El sensor entrega el total desde que se suscribio: se suma la diferencia.
        const nuevos = resultado.steps - anterior;

        anterior = resultado.steps;

        if (nuevos > 0) {
          sumarPasos(nuevos);
        }
      });
    }

    iniciar();

    return () => {
      cancelado = true;

      if (suscripcion) suscripcion.remove();
    };
  }, []);

  // Ciclo del minijuego: mueve la mira, mueve al pokemon y mide el progreso.
  useEffect(() => {
    if (fase !== 'jugando') return;

    const velocidad = velocidadDe(salvaje);
    let mira = { x: ANCHO / 2, y: ALTO / 2 };
    let pokemon = puntoAleatorio();
    let destino = puntoAleatorio();
    let progreso = 0;
    let transcurrido = 0;

    const intervalo = setInterval(() => {
      // Inclinar a la derecha mueve la mira a la derecha; hacia abajo, hacia abajo.
      let dx = lectura.current.x - calibracion.current.x;
      let dy = lectura.current.y - calibracion.current.y;

      if (Math.abs(dx) < REPOSO) dx = 0;
      if (Math.abs(dy) < REPOSO) dy = 0;

      mira = {
        x: limitar(mira.x + limitar(dx, -1, 1) * VELOCIDAD_MIRA, 0, ANCHO),
        y: limitar(mira.y + limitar(dy, -1, 1) * VELOCIDAD_MIRA, 0, ALTO),
      };

      // El pokemon camina hacia un punto y, al llegar, elige otro.
      const faltaX = destino.x - pokemon.x;
      const faltaY = destino.y - pokemon.y;
      const distancia = Math.sqrt(faltaX * faltaX + faltaY * faltaY);

      if (distancia < velocidad) {
        destino = puntoAleatorio();
      } else {
        pokemon = {
          x: pokemon.x + (faltaX / distancia) * velocidad,
          y: pokemon.y + (faltaY / distancia) * velocidad,
        };
      }

      const encima = Math.hypot(mira.x - pokemon.x, mira.y - pokemon.y) < TAM_MIRA / 2;

      progreso = limitar(progreso + (encima ? TICK : -TICK / 4) / TIEMPO_CAPTURA, 0, 1);
      transcurrido += TICK;

      setJuego({ mira, pokemon, progreso, restante: 1 - transcurrido / TIEMPO_LIMITE });

      if (progreso >= 1) {
        clearInterval(intervalo);
        terminarCaptura(salvaje);
      } else if (transcurrido >= TIEMPO_LIMITE) {
        clearInterval(intervalo);
        cambiarFase('escapo');
      }
    }, TICK);

    return () => clearInterval(intervalo);
  }, [fase, salvaje]);

  if (fase === 'buscando') {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Capturar</Text>
        <Text style={styles.instruccion}>Camina para encontrar un pokemon salvaje.</Text>

        <Text style={styles.contador}>
          {pasos} / {PASOS_POR_ENCUENTRO}
        </Text>
        <Text style={styles.etiquetaPasos}>pasos</Text>
        <View style={styles.barraPasos}>
          <View style={[styles.relleno, { width: (pasos / PASOS_POR_ENCUENTRO) * 100 + '%' }]} />
        </View>

        {estadoPodometro === 'no_disponible' && (
          <Text style={styles.advertencia}>Este equipo no tiene podometro.</Text>
        )}
        {estadoPodometro === 'sin_permiso' && (
          <Text style={styles.advertencia}>Falta el permiso de actividad fisica.</Text>
        )}

        {/* Zona secreta: cada toque suma un paso. */}
        <Pressable style={styles.zonaSecreta} onPress={() => sumarPasos(1)} />
      </View>
    );
  }

  if (fase === 'encontrado') {
    return (
      <View style={styles.contenedor}>
        <Animated.View style={[styles.tarjeta, { opacity: aparicion, transform: [{ scale: aparicion }] }]}>
          <Text style={styles.aviso}>Un pokemon salvaje aparecio!</Text>

          <Image source={imagenDe(salvaje.id)} style={styles.arte} resizeMode="contain" />
          <Text style={styles.numero}>{formatearNumero(salvaje.id)}</Text>
          <Text style={styles.nombre}>{formatearNombre(salvaje.nombre)}</Text>

          <Text style={styles.pista}>
            Ponte comodo: al capturar, la posicion en que sostengas el telefono sera tu punto de inicio.
          </Text>

          <View style={styles.botones}>
            <Pressable style={[styles.boton, styles.huir]} onPress={() => cambiarFase('buscando')}>
              <Text style={styles.textoHuir}>Huir</Text>
            </Pressable>
            <Pressable style={[styles.boton, styles.capturar]} onPress={empezarJuego}>
              <Text style={styles.textoCapturar}>Capturar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  if (fase === 'jugando') {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.aviso}>
          Un {formatearNombre(salvaje.nombre)} salvaje! Inclina el telefono para apuntarle.
        </Text>

        <View style={styles.arena}>
          <Image
            source={imagenDe(salvaje.id)}
            style={[
              styles.pokemon,
              { left: juego.pokemon.x - TAM_POKEMON / 2, top: juego.pokemon.y - TAM_POKEMON / 2 },
            ]}
            resizeMode="contain"
          />
          <View
            style={[
              styles.mira,
              {
                left: juego.mira.x - TAM_MIRA / 2,
                top: juego.mira.y - TAM_MIRA / 2,
                borderColor: juego.progreso > 0 ? colores.verde : colores.rojo,
              },
            ]}
          >
            <View style={styles.puntoMira} />
          </View>
        </View>

        <Text style={styles.etiqueta}>Captura</Text>
        <View style={styles.barraFondo}>
          <View style={[styles.barra, { width: juego.progreso * 100 + '%', backgroundColor: colores.verde }]} />
        </View>

        <Text style={styles.etiqueta}>Tiempo</Text>
        <View style={styles.barraFondo}>
          <View style={[styles.barra, { width: Math.max(juego.restante, 0) * 100 + '%', backgroundColor: colores.rojo }]} />
        </View>
      </View>
    );
  }

  const capturado = fase === 'capturado';

  return (
    <View style={styles.contenedor}>
      <Animated.View style={[styles.tarjeta, { opacity: aparicion, transform: [{ scale: aparicion }] }]}>
        <Text style={[styles.aviso, capturado && styles.avisoCapturado]}>
          {capturado
            ? eraNuevo
              ? 'Capturado! Registrado en la Pokedex'
              : 'Capturado! Ya lo tenias registrado'
            : 'Se escapo!'}
        </Text>

        <Image
          source={imagenDe(salvaje.id)}
          style={[styles.arte, !capturado && styles.silueta]}
          resizeMode="contain"
        />
        <Text style={styles.numero}>{formatearNumero(salvaje.id)}</Text>
        <Text style={styles.nombre}>{capturado ? formatearNombre(salvaje.nombre) : '???'}</Text>

        <Pressable style={[styles.boton, styles.capturar, styles.continuar]} onPress={() => cambiarFase('buscando')}>
          <Text style={styles.textoCapturar}>Continuar</Text>
        </Pressable>

        {capturado && (
          <Pressable onPress={() => navigation.navigate('Detalle', { id: salvaje.id })}>
            <Text style={styles.enlace}>Ver ficha</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colores.gris,
  },
  instruccion: {
    marginTop: 8,
    color: colores.textoSuave,
    textAlign: 'center',
    fontSize: 16,
  },
  arena: {
    width: ANCHO,
    height: ALTO,
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    borderWidth: 2,
    borderColor: colores.borde,
    overflow: 'hidden',
    marginVertical: 14,
    ...sombra,
  },
  pokemon: {
    position: 'absolute',
    width: TAM_POKEMON,
    height: TAM_POKEMON,
  },
  mira: {
    position: 'absolute',
    width: TAM_MIRA,
    height: TAM_MIRA,
    borderRadius: TAM_MIRA / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puntoMira: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.gris,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    marginLeft: (Dimensions.get('window').width - ANCHO) / 2,
    color: colores.textoSuave,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 4,
  },
  contador: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colores.rojo,
    marginTop: 24,
  },
  etiquetaPasos: {
    color: colores.textoSuave,
    marginBottom: 12,
  },
  barraPasos: {
    width: ANCHO,
    height: 12,
    borderRadius: 6,
    backgroundColor: colores.borde,
    overflow: 'hidden',
  },
  relleno: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colores.rojo,
  },
  advertencia: {
    color: colores.rojo,
    marginTop: 14,
    textAlign: 'center',
  },
  zonaSecreta: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 70,
    height: 70,
  },
  barraFondo: {
    width: ANCHO,
    height: 12,
    borderRadius: 6,
    backgroundColor: colores.borde,
    overflow: 'hidden',
  },
  barra: {
    height: 12,
    borderRadius: 6,
  },
  tarjeta: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    padding: 20,
    ...sombra,
  },
  aviso: {
    color: colores.rojo,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  avisoCapturado: {
    color: colores.verde,
  },
  arte: {
    width: 220,
    height: 220,
  },
  silueta: {
    tintColor: '#000000',
    opacity: 0.3,
  },
  numero: {
    color: colores.textoSuave,
    fontWeight: 'bold',
  },
  nombre: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colores.gris,
    marginBottom: 10,
  },
  pista: {
    color: colores.textoSuave,
    textAlign: 'center',
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    alignSelf: 'stretch',
  },
  boton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  huir: {
    backgroundColor: colores.fondo,
  },
  capturar: {
    backgroundColor: colores.rojo,
  },
  textoHuir: {
    color: colores.gris,
    fontWeight: 'bold',
  },
  textoCapturar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  continuar: {
    alignSelf: 'stretch',
    flex: 0,
    marginTop: 4,
  },
  enlace: {
    color: colores.azul,
    fontWeight: 'bold',
    marginTop: 14,
  },
});
