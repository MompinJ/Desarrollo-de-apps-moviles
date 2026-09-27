import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const { width: ANCHO_PANTALLA } = Dimensions.get('window');

const CARRILES = 3;
const ANCHO_PISTA = Math.min(ANCHO_PANTALLA - 40, 330);
const ALTO_PISTA = 420;
const ANCHO_CARRIL = ANCHO_PISTA / CARRILES;

const AUTO_W = ANCHO_CARRIL * 0.6;
const AUTO_H = 70;
const AUTO_Y = ALTO_PISTA - AUTO_H - 20;
const OBSTACULO_H = 55;

const TICK = 40;              // ms por cuadro del juego
const SENSOR = 40;            // ms entre lecturas del giroscopio
const A_GRADOS = 180 / Math.PI;
const REPOSO = 0.03;          // zona muerta: ruido del sensor
const TOPE_VOLANTE = 60;      // grados maximos de giro
const UMBRAL = 15;            // grados para cambiar de carril
const SUAVIDAD = 0.25;        // que tan rapido se desliza el auto entre carriles

export default function JuegoVolante() {
    const [jugando, setJugando] = useState(false);
    const [perdio, setPerdio] = useState(false);
    const [puntos, setPuntos] = useState(0);
    const [obstaculos, setObstaculos] = useState([]);
    const [posAuto, setPosAuto] = useState(1);
    const [angulo, setAngulo] = useState(0);

    const anguloRef = useRef(0);
    const carrilRef = useRef(1);
    const posRef = useRef(1);
    const obstaculosRef = useRef([]);
    const puntosRef = useRef(0);
    const tickRef = useRef(0);
    const idRef = useRef(0);

    // El giroscopio se queda escuchando siempre para poder mover el volante
    // aunque el juego no haya arrancado
    useEffect(() => {
        //1.- Suscribirnos al sensor
        const suscripcion = Gyroscope.addListener(({ z }) => {
            // El giroscopio da velocidad de giro: hay que integrarla para
            // saber en que posicion quedo el volante
            const velocidad = Math.abs(z) < REPOSO ? 0 : z;
            const siguiente = anguloRef.current + velocidad * (SENSOR / 1000) * A_GRADOS;
            anguloRef.current = Math.max(-TOPE_VOLANTE, Math.min(TOPE_VOLANTE, siguiente));
            setAngulo(anguloRef.current);

            // Girar a la izquierda (angulo positivo) manda el auto al carril 0
            carrilRef.current = anguloRef.current > UMBRAL
                ? 0
                : anguloRef.current < -UMBRAL
                    ? 2
                    : 1;
        });

        //2.- Definir el intervalo de mediciones
        Gyroscope.setUpdateInterval(SENSOR);

        //3.- Definir la des-suscripcion
        return () => {
            suscripcion.remove();
        };
    }, []);

    useEffect(() => {
        if (!jugando) return;

        const bucle = setInterval(() => {
            tickRef.current += 1;

            // El auto se desliza hacia el carril del volante, no salta
            posRef.current += (carrilRef.current - posRef.current) * SUAVIDAD;
            setPosAuto(posRef.current);

            const velocidad = Math.min(26, 9 + puntosRef.current * 0.35);
            const cada = Math.max(8, 18 - Math.floor(puntosRef.current / 3));

            if (tickRef.current % cada === 0) {
                idRef.current += 1;
                obstaculosRef.current.push({
                    id: idRef.current,
                    carril: Math.floor(Math.random() * CARRILES),
                    y: -OBSTACULO_H,
                });
            }

            const carrilAuto = Math.round(posRef.current);
            let choque = false;
            const vivos = [];

            for (const obstaculo of obstaculosRef.current) {
                obstaculo.y += velocidad;

                const tocaAlto = obstaculo.y + OBSTACULO_H > AUTO_Y;
                const tocaBajo = obstaculo.y < AUTO_Y + AUTO_H;
                if (obstaculo.carril === carrilAuto && tocaAlto && tocaBajo) {
                    choque = true;
                }

                if (obstaculo.y > ALTO_PISTA) {
                    puntosRef.current += 1;
                    setPuntos(puntosRef.current);
                } else {
                    vivos.push(obstaculo);
                }
            }

            obstaculosRef.current = vivos;
            setObstaculos([...vivos]);

            if (choque) {
                setJugando(false);
                setPerdio(true);
            }
        }, TICK);

        return () => clearInterval(bucle);
    }, [jugando]);

    const iniciar = () => {
        obstaculosRef.current = [];
        puntosRef.current = 0;
        tickRef.current = 0;
        posRef.current = 1;
        anguloRef.current = 0;
        setObstaculos([]);
        setPuntos(0);
        setPosAuto(1);
        setAngulo(0);
        setPerdio(false);
        setJugando(true);
    };

    const izquierdaAuto = posAuto * ANCHO_CARRIL + (ANCHO_CARRIL - AUTO_W) / 2;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Volante</Text>

            <View style={styles.marcador}>
                <Text style={styles.puntos}>Puntos: {puntos}</Text>
                <View style={styles.volante}>
                    <View style={[styles.volanteBarra, { transform: [{ rotate: `${-angulo}deg` }] }]} />
                </View>
            </View>

            <View style={styles.pista}>
                {[1, 2].map(linea => (
                    <View key={linea} style={[styles.separador, { left: linea * ANCHO_CARRIL - 2 }]}>
                        {Array.from({ length: 9 }).map((_, i) => (
                            <View key={i} style={styles.raya} />
                        ))}
                    </View>
                ))}

                {obstaculos.map(obstaculo => (
                    <View
                        key={obstaculo.id}
                        style={[
                            styles.obstaculo,
                            {
                                top: obstaculo.y,
                                left: obstaculo.carril * ANCHO_CARRIL + (ANCHO_CARRIL - AUTO_W) / 2,
                            },
                        ]}
                    />
                ))}

                <View style={[styles.auto, { left: izquierdaAuto }]}>
                    <View style={styles.parabrisas} />
                </View>

                {!jugando && (
                    <View style={styles.overlay}>
                        {perdio && <Text style={styles.textoChoque}>CHOCASTE</Text>}
                        {perdio && <Text style={styles.textoPuntos}>Puntos: {puntos}</Text>}
                        <Pressable style={styles.boton} onPress={iniciar}>
                            <Text style={styles.textoBoton}>{perdio ? 'Reintentar' : 'Iniciar'}</Text>
                        </Pressable>
                        <Text style={styles.ayuda}>Gira el telefono como volante</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#808080',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#dc1212',
        marginBottom: 10,
    },
    marcador: {
        width: ANCHO_PISTA,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    puntos: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e344f',
    },
    volante: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 5,
        borderColor: '#1e344f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    volanteBarra: {
        width: 34,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#dc1212',
    },
    pista: {
        width: ANCHO_PISTA,
        height: ALTO_PISTA,
        backgroundColor: '#3b3b3b',
        borderWidth: 4,
        borderColor: '#1e344f',
        borderRadius: 10,
        overflow: 'hidden',
    },
    separador: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 4,
        justifyContent: 'space-around',
    },
    raya: {
        width: 4,
        height: 22,
        backgroundColor: '#e8e8e8',
    },
    obstaculo: {
        position: 'absolute',
        width: AUTO_W,
        height: OBSTACULO_H,
        backgroundColor: '#dc1212',
        borderRadius: 8,
    },
    auto: {
        position: 'absolute',
        top: AUTO_Y,
        width: AUTO_W,
        height: AUTO_H,
        backgroundColor: '#256734',
        borderRadius: 10,
        alignItems: 'center',
        paddingTop: 10,
    },
    parabrisas: {
        width: AUTO_W * 0.6,
        height: 18,
        borderRadius: 4,
        backgroundColor: '#7ec8f2',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(30, 52, 79, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoChoque: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#dc1212',
    },
    textoPuntos: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    boton: {
        backgroundColor: '#256734',
        paddingVertical: 14,
        paddingHorizontal: 34,
        borderRadius: 10,
    },
    textoBoton: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    ayuda: {
        color: '#e8e8e8',
        fontSize: 14,
        marginTop: 14,
    },
});
