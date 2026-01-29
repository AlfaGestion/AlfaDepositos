import { useEffect, useState, useRef } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Modal as RNModal, 
  StyleSheet, 
  Alert 
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";

import ProductItem from "@components/ProductItem";
import Product from "@db/Product"; // Tu modelo de base de datos
import { listProductsStyles } from "@styles/ProductStyle";
import Colors from "@styles/Colors";
import Configuration from "@db/Configuration";

export default function Products({ navigation }) {
  // Estados de datos
  const [products, setProducts] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [loadImages, setLoadImages] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados del Escáner
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  
  const refInput = useRef();
  const scanningRef = useRef(false);

  // 1. Permisos y Carga Inicial
  useEffect(() => {
    loadConfiguration();
    loadProducts("", false); // Carga inicial de los primeros 20
  }, []);

  const loadConfiguration = async () => {
    try {
      await Configuration.createTable();
      const value = await Configuration.getConfigValue("CARGA_IMAGENES");
      setLoadImages(value == '1');
    } catch (e) {
      setLoadImages(false);
    }
  };

  // 2. Función Maestra de Búsqueda (Combinada)
  const loadProducts = async (text = "", isSearch = false) => {
    let data = [];
    setIsLoading(true);
    setSearchText(text);

    try {
      if (isSearch && text !== "") {
        // PRIORIDAD 1: Buscar por código exacto (para Escáner o Enter)
        // Usamos la función findByCode que pasaste en el ejemplo
        data = await Product.findByCode(text, ''); 

        // PRIORIDAD 2: Si no hay código exacto, buscar por coincidencia de nombre
        if (!data || data.length === 0) {
          data = await Product.findLikeName(text);
        }
      } else {
        // Carga por defecto (sin búsqueda)
        data = await Product.query({ page: 1, limit: 20 });
      }

      if (!data || data.length === 0) {
        setEmpty(true);
        setProducts([]);
      } else {
        setEmpty(false);
        setProducts(data);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
      Alert.alert("Error", "No se pudo consultar la base de datos.");
      // Si falla, reiniciamos la pantalla completa
      setProducts([]);
      setEmpty(false);
      setSearchText("");
      setRefreshKey((k) => k + 1);
      setTimeout(() => {
        loadProducts("", false);
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Manejadores de Eventos
  const handleBarCodeScanned = async ({ data }) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScannerVisible(false);
    try {
      setSearchText(data);
      // Al escanear, ejecutamos la búsqueda exacta inmediatamente
      await loadProducts(data, true);
    } finally {
      scanningRef.current = false;
    }
  };

  const ensureCameraPermission = async () => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    if (result?.granted) return true;
    const message = result?.canAskAgain
      ? "Debes permitir el acceso a la cámara para escanear."
      : "Permiso de cámara denegado. Habilitalo desde los ajustes.";
    Alert.alert("Sin acceso", message);
    return false;
  };

  const onChangeSearchText = (text) => {
    setSearchText(text);
    if (text.length === 0) {
      loadProducts("", false);
      return;
    }
    loadProducts(text, true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E7F1F9" }} key={refreshKey}>
      {/* --- MODAL DEL ESCÁNER --- */}
      <RNModal visible={scannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            onBarcodeScanned={scannerVisible ? handleBarCodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "code93", "qr"],
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay}>
            <Text style={styles.scanText}>Encuadre el código de barras</Text>
            <TouchableOpacity 
              onPress={() => {
                scanningRef.current = false;
                setScannerVisible(false);
              }} 
              style={styles.closeButton}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <View style={[listProductsStyles.viewSearch, styles.searchRow]}>
        <TextInput
          ref={refInput}
          autoFocus={true}
          style={[listProductsStyles.textSearch, { flex: 1 }]}
          onChangeText={onChangeSearchText}
          value={searchText}
          placeholder="Buscar por código o descripción"
          onSubmitEditing={() => loadProducts(searchText, true)} // Buscar exacto al dar "Enter"
          returnKeyType="search"
        />
        
        <TouchableOpacity 
          onPress={async () => {
            if (await ensureCameraPermission()) {
              setScannerVisible(true);
            }
          }}
          style={styles.cameraIcon}
        >
          <Ionicons name="camera-outline" size={24} color={Colors.DBLUE} />
        </TouchableOpacity>
      </View>

      {/* --- LISTADO O CARGA --- */}
      {isLoading ? (
        <ActivityIndicator style={[listProductsStyles.loader]} size="large" color="#00ff00" />
      ) : empty ? (
        <View style={styles.emptyContainer}>
          <Text style={[listProductsStyles.emptyText]}>No se encontraron resultados.</Text>
          <TouchableOpacity onPress={() => loadProducts("", false)}>
            <Text style={{ color: Colors.DBLUE, marginTop: 15 }}>Ver todos los productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{ height: 100 }}
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductItem
              name={item.name}
              price={item.price1}
              code={item.code}
              navigation={navigation}
              id={item.id}
              cancelaCarga={!loadImages}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// Estilos adicionales
const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cameraIcon: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden'
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  }
});
