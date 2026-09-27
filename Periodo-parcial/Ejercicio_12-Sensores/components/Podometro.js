import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Pedometer } from 'expo-sensors';

const META = 500;              // pasos de la meta
const LARGO_PASO = 0.75;       // metros por paso (promedio)
const CALORIAS_PASO = 0.04;    // kcal por paso (aproximado)

export default function Podometro() {
    const [estado, setEstado] = useState('revisando');
    const [pasos, setPasos] = useState(0);

    const crudoRef = useRef(0);   // lo que lleva contado el sensor
    const baseRef = useRef(0);    // desde donde contamos nosotros

    useEffect(() => {
        let suscripcion;

        const iniciar = async () => {
            // El podometro no existe en todos los equipos
            const disponible = await Pedometer.isAvailableAsync();
            if (!disponible) {
                setEstado('no_disponible');
                return;
            }

            // Contar pasos necesita permiso de actividad fisica
            const { status } = await Pedometer.requestPermissionsAsync();
            if (status !== 'granted') {
                setEstado('sin_permiso');
                return;
            }

            setEstado('listo');

            //1.- Suscribirnos al sensor
            suscripcion = Pedometer.watchStepCount(resultado => {
                crudoRef.current = resultado.steps;
                setPasos(resultado.steps - baseRef.current);
            });
        };

        iniciar();

        //2.- El podometro avisa solo cuando detecta un paso, no lleva intervalo

        //3.- Definir la des-suscripcion
        return () => {
            if (suscripcion) suscripcion.remove();
        };
    }, []);

    const reiniciar = () => {
        baseRef.current = crudoRef.current;
        setPasos(0);
    };

    const avance = Math.min(1, pasos / META);
    const metros = pasos * LARGO_PASO;
    const distancia = metros >= 1000
        ? `${(metros / 1000).toFixed(2)} km`
        : `${metros.toFixed(0)} m`;
    const calorias = (pasos * CALORIAS_PASO).toFixed(1);

    if (estado !== 'listo') {
        const mensajes = {
            revisando: 'Revisando el sensor...',
            no_disponible: 'Este equipo no tiene podometro',
            sin_permiso: 'Falta el permiso de actividad fisica',
        };

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Podometro</Text>
                <Text style={styles.aviso}>{mensajes[estado]}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Podometro</Text>

            <View style={styles.circulo}>
                <Text style={styles.numero}>{pasos}</Text>
                <Text style={styles.etiqueta}>pasos</Text>
            </View>

            <View style={styles.barra}>
                <View style={[styles.relleno, { width: `${avance * 100}%` }]} />
            </View>
            <Text style={styles.meta}>
                {Math.round(avance * 100)}% de {META} pasos
            </Text>

            <View style={styles.card}>
                <Text style={styles.axis}>Distancia:</Text>
                <Text style={styles.value}>{distancia}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.axis}>Calorias:</Text>
                <Text style={styles.value}>{calorias} kcal</Text>
            </View>

            <Pressable style={styles.boton} onPress={reiniciar}>
                <Text style={styles.textoBoton}>Reiniciar cuenta</Text>
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
    aviso: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e344f',
        textAlign: 'center',
    },
    circulo: {
        width: 190,
        height: 190,
        borderRadius: 95,
        backgroundColor: '#fff',
        borderWidth: 8,
        borderColor: '#1e344f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    numero: {
        fontSize: 54,
        fontWeight: 'bold',
        color: '#256734',
    },
    etiqueta: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7b0a73',
    },
    barra: {
        width: '85%',
        height: 18,
        borderRadius: 9,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    relleno: {
        height: '100%',
        backgroundColor: '#256734',
    },
    meta: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e344f',
        marginTop: 6,
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
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
        marginTop: 8,
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
