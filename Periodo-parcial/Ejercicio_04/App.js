import { useState } from 'react';
import { Button, Image, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import CustomModal from './components/CustomModal';

export default function App() {

    const [modal, setModal] = useState(false)
    const [texto, setTexto] = useState('Mompin Jorge')

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <TextInput
                    style={styles.input}
                    value={texto}
                    onChangeText={setTexto}
                />

                <CustomModal
                    visible={modal}
                    onClose={() => setModal(false)}
                    contenido={texto}
                />

                <Button
                    title='Abrir modal'
                    onPress={() => setModal(true)}
                />

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    input: {
        borderWidth: 1,

    },


});
