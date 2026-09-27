import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const CUELLO_W = 70;
const CUELLO_H = 45;
const BOTELLA_W = 210;
const BOTELLA_H = 300;

// El bloque de agua es mas grande que la botella para que al girar
// siga tapando las esquinas; lo que sobra lo recorta el overflow
const AGUA_W = BOTELLA_W * 2.6;
const AGUA_H = 900;

const INTERVALO = 40;         // ms entre mediciones
const RIGIDEZ = 14;           // que tan rapido el agua alcanza la inclinacion real
const AMORTIGUACION = 5;      // que tanto frena el vaiven (menos = mas chapoteo)
const ANGULO_MAX = 55;        // limite de inclinacion de la superficie
const MIN_GRAVEDAD = 0.15;    // si el telefono esta plano la lectura no sirve
const PASO_LLENADO = 0.02;    // cuanto sube o baja por tick el boton

export default function BotellaAgua() {
    const [nivel, setNivel] = useState(0.5);
    const [angulo, setAngulo] = useState(0);

    const anguloRef = useRef(0);
    const velocidadRef = useRef(0);
    const objetivoRef = useRef(0);
    const llenadoRef = useRef(null);

    useEffect(() => {
        //1.- Suscribirnos al sensor
        const suscripcion = Accelerometer.addListener(({ x, y }) => {
            // Inclinacion real del telefono; la superficie del agua tiene que
            // quedarse horizontal, o sea girada al reves que la botella
            if (Math.sqrt(x * x + y * y) > MIN_GRAVEDAD) {
                const grados = Math.atan2(x, y) * (180 / Math.PI);
                objetivoRef.current = Math.max(-ANGULO_MAX, Math.min(ANGULO_MAX, grados));
            }

            // Resorte amortiguado: el agua no llega de golpe, se pasa y regresa
            const dt = INTERVALO / 1000;
            const fuerza = (objetivoRef.current - anguloRef.current) * RIGIDEZ;
            velocidadRef.current += (fuerza - velocidadRef.current * AMORTIGUACION) * dt;
            anguloRef.current += velocidadRef.current * dt;
            setAngulo(anguloRef.current);
        });

        //2.- Definir el intervalo de mediciones
        Accelerometer.setUpdateInterval(INTERVALO);

        //3.- Definir la des-suscripcion
        return () => {
            suscripcion.remove();
            if (llenadoRef.current) clearInterval(llenadoRef.current);
        };
    }, []);

    const iniciarLlenado = paso => {
        if (llenadoRef.current) clearInterval(llenadoRef.current);
        llenadoRef.current = setInterval(() => {
            setNivel(actual => Math.max(0, Math.min(1, actual + paso)));
        }, 50);
    };

    const detenerLlenado = () => {
        if (llenadoRef.current) {
            clearInterval(llenadoRef.current);
            llenadoRef.current = null;
        }
    };

    // La superficie se mide desde arriba de la botella
    const superficieY = BOTELLA_H * (1 - nivel);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Botella con agua</Text>

            <View style={styles.cuello}>
                <View style={styles.tapa} />
            </View>

            <View style={styles.botella}>
                {nivel > 0 && (
                    <View
                        style={[
                            styles.agua,
                            {
                                top: superficieY,
                                transform: [
                                    { translateY: -AGUA_H / 2 },
                                    { rotate: `${angulo}deg` },
                                    { translateY: AGUA_H / 2 },
                                ],
                            },
                        ]}
                    />
                )}

                <View style={[styles.marca, { top: BOTELLA_H * 0.25 }]} />
                <View style={[styles.marca, { top: BOTELLA_H * 0.5 }]} />
                <View style={[styles.marca, { top: BOTELLA_H * 0.75 }]} />

                <Text style={styles.porcentaje}>{Math.round(nivel * 100)}%</Text>
            </View>

            <Text style={styles.dato}>Inclinacion: {angulo.toFixed(0)} grados</Text>

            <View style={styles.botones}>
                <Pressable
                    style={[styles.boton, styles.botonVaciar]}
                    onPressIn={() => iniciarLlenado(-PASO_LLENADO)}
                    onPressOut={detenerLlenado}
                >
                    <Text style={styles.textoBoton}>Vaciar</Text>
                </Pressable>
                <Pressable
                    style={[styles.boton, styles.botonLlenar]}
                    onPressIn={() => iniciarLlenado(PASO_LLENADO)}
                    onPressOut={detenerLlenado}
                >
                    <Text style={styles.textoBoton}>Llenar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
        backgroundColor: '#808080',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#dc1212',
    },
    cuello: {
        width: CUELLO_W,
        height: CUELLO_H,
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        borderWidth: 4,
        borderBottomWidth: 0,
        borderColor: '#1e344f',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
    },
    tapa: {
        width: CUELLO_W + 14,
        height: 14,
        backgroundColor: '#dc1212',
        borderRadius: 4,
        marginTop: -2,
    },
    botella: {
        width: BOTELLA_W,
        height: BOTELLA_H,
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        borderWidth: 4,
        borderColor: '#1e344f',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    agua: {
        position: 'absolute',
        left: -(AGUA_W - BOTELLA_W) / 2,
        width: AGUA_W,
        height: AGUA_H,
        backgroundColor: '#2d8fd5',
        borderTopWidth: 6,
        borderTopColor: '#7ec8f2',
    },
    marca: {
        position: 'absolute',
        right: 0,
        width: 25,
        height: 2,
        backgroundColor: 'rgba(30, 52, 79, 0.4)',
    },
    porcentaje: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#1e344f',
    },
    dato: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e344f',
        marginTop: 18,
    },
    botones: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 15,
    },
    boton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 10,
    },
    botonLlenar: {
        backgroundColor: '#2d8fd5',
    },
    botonVaciar: {
        backgroundColor: '#7b0a73',
    },
    textoBoton: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
