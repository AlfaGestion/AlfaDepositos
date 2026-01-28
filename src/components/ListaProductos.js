import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, View, StyleSheet, Modal as RNModal } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CameraView, useCameraPermissions } from "expo-camera"; // Importar escáner
import { BiCamera } from "react-icons/bi"; // O usa un icono de tu librería

// ... tus otros imports
import Product from "@db/Product";
import { useCart } from "../hooks/useCart";
import Colors from "../styles/Colors";
import { getFontSize } from "../utils/Metrics";
import FooterTotal from "./Cart/FooterTotal";
import ItemCart from "./Cart/ItemCart";
import ModalItem from "./Cart/ModalItem";

export default function ListaProductos({ priceClassSelected = 1, lista = '' }) {
    const { passValidations } = useCart();
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // Estados para el Escáner
    const [permission, requestPermission] = useCameraPermissions();
    const hasPermission = permission?.granted ?? false;
    const [scannerVisible, setScannerVisible] = useState(false);

    const [productSearchText, setProductSearchText] = useState("");
    const [productsSearch, setProductsSearch] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [item, setItem] = useState(null);
    const [defaultProducts, setDefaultProducts] = useState(null);

    const refInput = useRef();

    // 1. Solicitar permisos de cámara
    useEffect(() => {
        loadProducts();
    }, []);

    // 2. Función unificada de búsqueda por código (para Enter y para Escáner)
    const searchByCode = async (code) => {
        setIsLoading(true);
        // Intentamos buscar por codigoBarras primero o code
        const product = await Product.findByCode(code, lista);
        
        if (product && product.length > 0) {
            const validate = await passValidations(product[0]);

            if (!validate) {
                Alert.alert('Alerta', 'Este artículo ya fue cargado en este o en otro comprobante.');
                resetSearch();
                return;
            }

            setItem(product[0]);
            setProductSearchText("");
            setProductsSearch(defaultProducts);
            setIsModalVisible(true);
        } else {
            Alert.alert('Error', 'El código escaneado no existe.');
        }
        setIsLoading(false);
    };

    const resetSearch = () => {
        setProductSearchText("");
        setProductsSearch(defaultProducts);
        if (refInput.current) refInput.current.focus();
    };

    const handleBarCodeScanned = ({ type, data }) => {
        setScannerVisible(false);
        searchByCode(data); // "data" es el string del código de barras
    };

    const loadProducts = async (text = "") => {
        setIsLoading(true);
        setProductSearchText(text);
        let products;

        if (text == "") {
            products = await Product.query({ limit: 20, page: 1 });
            if (!defaultProducts) setDefaultProducts(products);
        } else {
            products = await Product.findLikeName(text, priceClassSelected, 10, lista);
        }

        setProductsSearch(products);
        setIsLoading(false);
    };

    return (
        <View style={{ height: "100%" }}>
            <ModalItem isNew={true} isVisible={isModalVisible} setIsVisible={setIsModalVisible} item={item} />

            {/* Modal de la Cámara */}
            <RNModal visible={scannerVisible} animationType="slide">
                <View style={styles.scannerContainer}>
                    <CameraView
                        onBarcodeScanned={scannerVisible ? handleBarCodeScanned : undefined}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.overlay}>
                        <Text style={styles.scanText}>Encuadre el código de barras</Text>
                        <TouchableOpacity 
                            onPress={() => setScannerVisible(false)} 
                            style={styles.closeButton}
                        >
                            <Text style={{ color: 'white' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RNModal>

            <View style={styles.searchContainer}>
                <TextInput
                    ref={refInput}
                    autoFocus={true}
                    style={{ marginVertical: 10, width: "75%", padding: 10 }}
                    placeholder="Descripción o código"
                    onChangeText={(text) => loadProducts(text)}
                    onSubmitEditing={() => searchByCode(productSearchText)}
                    value={productSearchText}
                    clearButtonMode="always"
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {productSearchText?.length > 0 && (
                        <TouchableOpacity onPress={() => loadProducts("")} style={styles.clearBtn}>
                            <Text>X</Text>
                        </TouchableOpacity>
                    )}
                    
                    {/* Botón para abrir cámara */}
                    <TouchableOpacity 
                        onPress={() => {
                            if (hasPermission) setScannerVisible(true);
                            else Alert.alert("Error", "No hay permisos de cámara");
                        }} 
                        style={styles.cameraBtn}
                    >
                         <Text style={{fontSize: 20}}>📷</Text> 
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && <ActivityIndicator size="large" color={Colors.MAIN} />}

            {(!isLoading && productsSearch.length > 0) && (
                <FlatList
                    style={{ backgroundColor: "#ececec", paddingHorizontal: 10 }}
                    data={productsSearch}
                    keyExtractor={(item) => item.id + ""}
                    renderItem={({ item }) => <ItemCart priceClass={priceClassSelected} item={item} />}
                />
            )}
            <FooterTotal />
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        width: "100%", 
        flexDirection: "row", 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: Colors.GREY, 
        backgroundColor: Colors.WHITE, 
        alignItems: "center", 
        justifyContent: "space-between",
        paddingHorizontal: 10
    },
    cameraBtn: {
        backgroundColor: Colors.MAIN || '#000',
        padding: 8,
        borderRadius: 5,
    },
    clearBtn: {
        backgroundColor: Colors.GREY,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        width: 25,
        height: 25
    },
    scannerContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scanText: {
        color: 'white',
        fontSize: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        marginBottom: 20
    },
    closeButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10
    }
});