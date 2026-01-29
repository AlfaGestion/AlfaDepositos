import Configuration from "@db/Configuration";
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

// const fallbackImage = require('./assets/default.png');
import imgProduct from "@icons/product2.png";

export default function ProductImage({ fileName, reload = false, widthImage = 200, heightImage = 200, cancelaCarga = false }) {
    const [imageUri, setImageUri] = useState(null);
    const [error, setError] = useState(false);

    const loadConfig = async () => {
        if (cancelaCarga) {
            setImageUri(null);
            setError(true);
            return;
        }
        try {
            await Configuration.createTable();
        } catch (e) {
            setError(true);
            return;
        }

        // const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);

        // for (const file of files) {
        //     if (file.endsWith('.jpg')) {
        //         await FileSystem.deleteAsync(FileSystem.documentDirectory + file, { idempotent: true });
        //     }
        // }

        let cargaImagenes;
        try {
            cargaImagenes = await Configuration.getConfigValue("CARGA_IMAGENES");
        } catch (e) {
            setError(true);
            return;
        }

        if (cargaImagenes == '1') {
            let data;
            try {
                data = await Configuration.getConfig("ALFA_ACCOUNT");
            } catch (e) {
                setError(true);
                return;
            }
            if (data) {
                setImageUri(null)
                setError(false)
                const imageUrl = `https://alfanet.com.ar/ac/public/assets/images/${data[0]?.value}/${fileName}.jpg`
                loadImage(FileSystem.documentDirectory + fileName + '.jpg', imageUrl);
            } else {
                setError(true)
            }
        } else {
            setError(true)
        }
    }


    const loadImage = async (localUri, imageUrl) => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(localUri);
            // console.log(fileInfo)
            if (fileInfo.exists) {
                if (fileInfo.size < 1500) {
                    setError(true)
                } else {
                    setImageUri(localUri);
                }
            } else {
                const downloaded = await FileSystem.downloadAsync(imageUrl, localUri);
                // console.log(downloaded)
                if (downloaded?.status == 404) {
                    setError(true)
                } else {
                    setImageUri(downloaded.uri);
                }
            }
        } catch (e) {
            // console.warn('Fallo al cargar la imagen, usando fallback');
            setError(true);
        }
    };

    useEffect(() => {
        if (reload) {
            reloadImage()
        }
    }, [reload])

    const reloadImage = async () => {
        setImageUri(null)
        setError(false)
        await FileSystem.deleteAsync(FileSystem.documentDirectory + fileName + '.jpg', { idempotent: true })

        let data = await Configuration.getConfig("ALFA_ACCOUNT");
        if (data) {
            const imageUrl = `https://alfanet.com.ar/ac/public/assets/images/${data[0]?.value}/${fileName}.jpg`
            // console.log(imageUrl)
            loadImage(FileSystem.documentDirectory + fileName + '.jpg', imageUrl);
        }
    }

    useEffect(() => {
        if (cancelaCarga) {
            setImageUri(null);
            setError(true)
        } else {
            if (fileName) {
                loadConfig()
            }
        }
    }, [fileName, cancelaCarga]);

    return (
        <View style={styles.container}>

            {(imageUri && !error) ? (
                <Image
                    source={{ uri: imageUri }}
                    resizeMode="contain"

                    style={{ width: widthImage, height: heightImage, borderRadius: 10 }}
                />
            ) : error ? (
                <Image
                    source={imgProduct}
                    style={{ width: widthImage, height: heightImage, borderRadius: 10 }}
                />
            ) : (
                <ActivityIndicator size="large" color="#007AFF" />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
});
