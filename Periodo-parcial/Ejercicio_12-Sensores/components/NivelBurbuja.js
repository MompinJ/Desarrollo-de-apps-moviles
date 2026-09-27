import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const MARCO = 260;          // diametro del marco circular
const BURBUJA = 56;         // diametro de la burbuja
const RADIO = (MARCO - BURBUJA) / 2 - 8;  // cuanto se puede alejar del centro
const INCLINACION_MAX = 0.5;  // en g: a 0.5 la burbuja llega al borde (~30 grados)
const TOLERANCIA = 0.04;      // por debajo de esto se considera nivelado
const FILTRO = 0.2;           // suavizado: 0 = no se mueve, 1 = sin suavizar

export default function NivelBurbuja() {
    const [nivel, setNivel] = useState({ x: 0, y: 0 });

    useEffect(() => {
        //1.- Suscribirnos al sensor
        const suscripcion = Accelerometer.addListener(({ x, y }) => {
            // Filtro pasa-bajas para que la burbuja no tiemble
            setNivel(anterior => ({
                x: anterior.x + (x - anterior.x) * FILTRO,
                y: anterior.y + (y - anterior.y) * FILTRO,
            }));
        });

        //2.- Definir el intervalo de mediciones
        Accelerometer.setUpdateInterval(50);

        //3.- Definir la des-suscripcion
        return () => {
            suscripcion.remove();
        };
    }, []);

    // Convierte la lectura del sensor a pixeles, sin salirse del marco
    const limitar = valor => Math.max(-1, Math.min(1, valor / INCLINACION_MAX));
    const desplazamientoX = limitar(nivel.x) * RADIO;
    const desplazamientoY = -limitar(nivel.y) * RADIO;

    const desviacion = Math.sqrt(nivel.x * nivel.x + nivel.y * nivel.y);
    const nivelado = desviacion < TOLERANCIA;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nivel de burbuja</Text>

            <View style={styles.marco}>
                <View style={styles.lineaHorizontal} />
                <View style={styles.lineaVertical} />
                <View style={styles.centro} />
                <View
                    style={[
                        styles.burbuja,
                        nivelado && styles.burbujaNivelada,
                        { transform: [{ translateX: desplazamientoX }, { translateY: desplazamientoY }] },
                    ]}
                />
            </View>

            <Text style={[styles.estado, nivelado && styles.estadoNivelado]}>
                {nivelado ? 'NIVELADO' : 'INCLINADO'}
            </Text>

            <View style={styles.lecturas}>
                <Text style={styles.lectura}>X: {nivel.x.toFixed(2)}</Text>
                <Text style={styles.lectura}>Y: {nivel.y.toFixed(2)}</Text>
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
        marginBottom: 25,
        color: '#dc1212',
    },
    marco: {
        width: MARCO,
        height: MARCO,
        borderRadius: MARCO / 2,
        backgroundColor: '#fff',
        borderWidth: 4,
        borderColor: '#1e344f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lineaHorizontal: {
        position: 'absolute',
        width: '80%',
        height: 2,
        backgroundColor: '#c8c8c8',
    },
    lineaVertical: {
        position: 'absolute',
        width: 2,
        height: '80%',
        backgroundColor: '#c8c8c8',
    },
    centro: {
        position: 'absolute',
        width: BURBUJA + 12,
        height: BURBUJA + 12,
        borderRadius: (BURBUJA + 12) / 2,
        borderWidth: 2,
        borderColor: '#256734',
    },
    burbuja: {
        width: BURBUJA,
        height: BURBUJA,
        borderRadius: BURBUJA / 2,
        backgroundColor: '#7b0a73',
        opacity: 0.85,
    },
    burbujaNivelada: {
        backgroundColor: '#256734',
    },
    estado: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 25,
        color: '#7b0a73',
    },
    estadoNivelado: {
        color: '#256734',
    },
    lecturas: {
        flexDirection: 'row',
        gap: 25,
        marginTop: 10,
    },
    lectura: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e344f',
    },
});
