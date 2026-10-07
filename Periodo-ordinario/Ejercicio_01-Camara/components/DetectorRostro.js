import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera-face-detector';

// La deteccion la hace Google ML Kit con el modelo incluido en la app:
// todo se procesa en el telefono, no se envia nada a internet.

export default function DetectorRostro() {
    //1.- Permiso de la camara (hook de VisionCamera)
    const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();

    const [lado, setLado] = useState('front');        // 'front' frontal, 'back' trasera
    const [hayRostro, setHayRostro] = useState(false);

    const dispositivo = useCameraDevice(lado);

    if (!hasPermission) {
        return (
            <View style={styles.centro}>
                <Text style={styles.title}>Detector de rostro</Text>
                <Text style={styles.aviso}>
                    Necesitamos tu permiso para usar la camara
                </Text>
                {canRequestPermission ? (
                    <Pressable style={styles.boton} onPress={requestPermission}>
                        <Text style={styles.textoBoton}>Dar permiso</Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.boton} onPress={() => Linking.openSettings()}>
                        <Text style={styles.textoBoton}>Abrir ajustes</Text>
                    </Pressable>
                )}
            </View>
        );
    }

    if (!dispositivo) {
        return (
            <View style={styles.centro}>
                <Text style={styles.aviso}>No se encontro una camara disponible</Text>
            </View>
        );
    }

    //2.- ML Kit nos avisa en cada cuadro cuantos rostros encontro
    const alDetectar = rostros => {
        setHayRostro(rostros.length > 0);
    };

    const voltear = () => {
        setHayRostro(false);
        setLado(actual => (actual === 'front' ? 'back' : 'front'));
    };

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={dispositivo}
                isActive={true}
                cameraFacing={lado}
                performanceMode="fast"
                onFacesDetected={alDetectar}
                onError={error => console.log('Error al detectar rostros:', error)}
            />

            {/*3.- El mensaje solo aparece si hay al menos un rostro */}
            {hayRostro && (
                <View style={styles.mensaje}>
                    <Text style={styles.textoMensaje}>Rostro detectado</Text>
                </View>
            )}

            <View style={styles.controles}>
                <Pressable style={styles.botonSecundario} onPress={voltear}>
                    <Text style={styles.textoBoton}>Voltear</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centro: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#1e344f',
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    aviso: {
        color: '#c8c8c8',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    mensaje: {
        position: 'absolute',
        top: 24,
        alignSelf: 'center',
        backgroundColor: '#dc1212',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    textoMensaje: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    controles: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    boton: {
        backgroundColor: '#dc1212',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 8,
    },
    botonSecundario: {
        width: 100,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#1e344f',
    },
    textoBoton: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
