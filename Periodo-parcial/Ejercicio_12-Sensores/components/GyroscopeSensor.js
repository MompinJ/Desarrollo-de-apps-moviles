import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const INTERVALO = 50;                    // ms entre mediciones
const A_GRADOS = 180 / Math.PI;          // el giroscopio entrega radianes por segundo
const REPOSO = 0.02;                     // por debajo de esto se considera quieto (ruido)

export default function GyroscopeSensor() {
    const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
    const [angulo, setAngulo] = useState(0);
    const anguloRef = useRef(0);

    useEffect(() => {
        //1.- Suscribirnos al sensor
        const suscripcion = Gyroscope.addListener(mediciones => {
            setDatos(mediciones);

            // El giroscopio mide velocidad de giro, no posicion:
            // para saber cuanto giro hay que ir sumando (integrar) en el tiempo
            const velocidad = Math.abs(mediciones.z) < REPOSO ? 0 : mediciones.z;
            anguloRef.current += velocidad * (INTERVALO / 1000) * A_GRADOS;
            setAngulo(anguloRef.current);
        });

        //2.- Definir el intervalo de mediciones
        Gyroscope.setUpdateInterval(INTERVALO);

        //3.- Definir la des-suscripcion
        return () => {
            suscripcion.remove();
        };
    }, []);

    const reiniciar = () => {
        anguloRef.current = 0;
        setAngulo(0);
    };

    const velocidadTotal = Math.sqrt(
        datos.x * datos.x + datos.y * datos.y + datos.z * datos.z
    );
    const enMovimiento = velocidadTotal > REPOSO;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giroscopio</Text>

            <View style={styles.escenario}>
                <View style={[styles.aguja, { transform: [{ rotate: `${-angulo}deg` }] }]}>
                    <View style={styles.punta} />
                    <View style={styles.cuerpo} />
                </View>
                <View style={styles.eje} />
            </View>

            <Text style={[styles.estado, enMovimiento && styles.estadoActivo]}>
                {enMovimiento ? 'GIRANDO' : 'EN REPOSO'}
            </Text>
            <Text style={styles.giro}>Giro acumulado: {angulo.toFixed(0)} grados</Text>

            <View style={styles.card}>
                <Text style={styles.axis}>X:</Text>
                <Text style={styles.value}>{(datos.x * A_GRADOS).toFixed(1)} g/s</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.axis}>Y:</Text>
                <Text style={styles.value}>{(datos.y * A_GRADOS).toFixed(1)} g/s</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.axis}>Z:</Text>
                <Text style={styles.value}>{(datos.z * A_GRADOS).toFixed(1)} g/s</Text>
            </View>

            <Pressable style={styles.boton} onPress={reiniciar}>
                <Text style={styles.textoBoton}>Reiniciar giro</Text>
            </Pressable>
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
    escenario: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#fff',
        borderWidth: 4,
        borderColor: '#1e344f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    aguja: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    punta: {
        width: 0,
        height: 0,
        borderLeftWidth: 14,
        borderRightWidth: 14,
        borderBottomWidth: 24,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#dc1212',
    },
    cuerpo: {
        width: 8,
        height: 110,
        backgroundColor: '#1e344f',
    },
    eje: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#7b0a73',
    },
    estado: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e344f',
    },
    estadoActivo: {
        color: '#256734',
    },
    giro: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e344f',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 8,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    axis: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#256734',
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#7b0a73',
    },
    boton: {
        marginTop: 12,
        backgroundColor: '#1e344f',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    textoBoton: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
