import { StyleSheet, View, ImageBackground, Dimensions, Image, Text } from "react-native";

export default function ImagenFondo() {
    return (
        <View>
            <ImageBackground
                source={require(
                    //                    '../../assets/imagenFondo.jpg'
                    '../../assets/Fondo.webp'
                )}
                style={styles.fondo}
            >

                <View
                    style={styles.container}
                >

                    <View                    >
                        <Text
                            style={styles.texto}
                        >
                            Deja en paz a mi novio
                        </Text>
                    </View>

                    <Image
                        style={styles.sticker}
                        source={{ uri: 'https://img-09.stickers.cloud/packs/821969b0-4880-4801-9634-428e2c986d0f/webp/a77473ab-1d5a-47df-8740-3277427f13fb.webp' }}
                    />
                </View>
                <Image
                    style={styles.sticker2}
                    source={{ uri: 'https://i.pinimg.com/originals/1e/db/f1/1edbf144909f2bbfcff412393422984c.gif' }}
                />




            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    fondo: {
        flex: 1,
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        //alignItems: "center",
        //justifyContent: "center"
    },
    sticker: {
        width: 200,
        height: 200,
        borderRadius: 16,
        //borderWidth: 10,
        borderColor: '#b5f',
        //shadowColor: "#000",
        //shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        //elevation: 8,
        marginTop: 400
    },
    sticker2: {
        width: 150,
        height: 150,
        borderRadius: 16,
        //borderWidth: 10,
        borderColor: '#b5f',
        //shadowColor: "#000",
        //shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        //elevation: 8,
        marginTop: 20
    },

    container: {
        //  flex: 1,
        //  alignContent: "center",
        //  alignItems: "center",
        justifyContent: "center"
    },

    texto: {
        marginTop: 350,
        fontSize: 30,
        justifyContent: "center",
        position: "absolute",
        backgroundColor: "rgb(0,0,0,0.5)",
        color: "#50a",
        width: 1000,
        height: 50,
        alignContent: "center",
        fontFamily: "Helvetica', sans-serif",
        paddingLeft: 150
    },



})
