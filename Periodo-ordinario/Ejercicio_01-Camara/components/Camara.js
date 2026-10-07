import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Camara() {
    //1.- Hook que consulta y solicita el permiso de la camara
    const [permiso, solicitarPermiso] = useCameraPermissions();

    const [lado, setLado] = useState('back');     // 'back' trasera, 'front' frontal
    const [lista, setLista] = useState(false);    // la camara ya puede tomar fotos
    const [foto, setFoto] = useState(null);       // foto capturada

    const camaraRef = useRef(null);

    // El permiso tarda un momento en cargarse
    if (!permiso) {
        return (
            <View style={styles.centro}>
                <Text style={styles.aviso}>Revisando permisos...</Text>
            </View>
        );
    }

    //2.- Si no hay permiso, pedirlo (o mandar a ajustes si ya se nego para siempre)
    if (!permiso.granted) {
        return (
            <View style={styles.centro}>
                <Text style={styles.title}>Camara</Text>
                <Text style={styles.aviso}>
                    Necesitamos tu permiso para usar la camara
                </Text>
                {permiso.canAskAgain ? (
                    <Pressable style={styles.boton} onPress={solicitarPermiso}>
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

    //3.- Capturar la fotografia
    const tomarFoto = async () => {
        if (!camaraRef.current || !lista) return;

        const resultado = await camaraRef.current.takePictureAsync({ quality: 0.8 });
        setFoto(resultado);
    };

    const voltear = () => {
        setLado(actual => (actual === 'back' ? 'front' : 'back'));
    };

    // Vista previa de la foto tomada
    if (foto) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: foto.uri }} style={styles.preview} />
                <Text style={styles.info}>
                    {foto.width} x {foto.height} px
                </Text>
                <View style={styles.controles}>
                    <Pressable style={styles.boton} onPress={() => setFoto(null)}>
                        <Text style={styles.textoBoton}>Tomar otra</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                ref={camaraRef}
                style={styles.camara}
                facing={lado}
                onCameraReady={() => setLista(true)}
            />

            <View style={styles.controles}>
                <Pressable style={styles.botonSecundario} onPress={voltear}>
                    <Text style={styles.textoBoton}>Voltear</Text>
                </Pressable>

                <Pressable
                    style={[styles.disparador, !lista && styles.deshabilitado]}
                    onPress={tomarFoto}
                    disabled={!lista}
                >
                    <View style={styles.disparadorInterno} />
                </Pressable>

                <View style={styles.espacio} />
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
    camara: {
        flex: 1,
    },
    preview: {
        flex: 1,
        resizeMode: 'contain',
    },
    info: {
        color: '#c8c8c8',
        textAlign: 'center',
        paddingTop: 10,
    },
    controles: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 24,
        paddingBottom: 40,
        backgroundColor: '#000',
    },
    boton: {
        backgroundColor: '#dc1212',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 8,
    },
    botonSecundario: {
        width: 80,
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
    disparador: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 4,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disparadorInterno: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#dc1212',
    },
    deshabilitado: {
        opacity: 0.4,
    },
    espacio: {
        width: 80,
    },
});
