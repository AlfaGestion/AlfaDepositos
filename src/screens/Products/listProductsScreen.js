import { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Modal as RNModal,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";

import ProductItem from "@components/ProductItem";
import Product from "@db/Product";
import { listProductsStyles } from "@styles/ProductStyle";
import Colors from "@styles/Colors";
import Configuration from "@db/Configuration";
import { useThemeConfig } from "@context/ThemeContext";
import iconProduct from "@icons/articulos.png";
import iconProductDark from "@icons/articulos_b.png";

export default function Products({ navigation }) {
  const [products, setProducts] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [loadImages, setLoadImages] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { darkMode } = useThemeConfig();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);

  const refInput = useRef();
  const scanningRef = useRef(false);

  useEffect(() => {
    loadConfiguration();
    loadProducts("", false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: darkMode ? "#16212D" : "#DDEAF8" },
      headerTintColor: darkMode ? "#E8F0F8" : "#1A395A",
      headerTitleStyle: { color: darkMode ? "#E8F0F8" : "#1A395A", fontWeight: "700" },
    });
  }, [navigation, darkMode]);

  const loadConfiguration = async () => {
    try {
      await Configuration.createTable();
      const imagesValue = await Configuration.getConfigValue("CARGA_IMAGENES");
      setLoadImages(imagesValue == "1");
    } catch (e) {
      setLoadImages(false);
    }
  };

  const loadProducts = async (text = "", isSearch = false) => {
    let data = [];
    setIsLoading(true);
    setSearchText(text);

    try {
      if (isSearch && text !== "") {
        data = await Product.findByCode(text, "");
        if (!data || data.length === 0) {
          data = await Product.findLikeName(text);
        }
      } else {
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

  const handleBarCodeScanned = async ({ data }) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScannerVisible(false);
    try {
      setSearchText(data);
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
      ? "Debes permitir el acceso a la camara para escanear."
      : "Permiso de camara denegado. Habilitalo desde los ajustes.";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? "#0F1720" : "#E7F1F9" }} key={refreshKey}>
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
            <Text style={styles.scanText}>Encuadre el codigo de barras</Text>
            <TouchableOpacity
              onPress={() => {
                scanningRef.current = false;
                setScannerVisible(false);
              }}
              style={styles.closeButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      <View
        style={[
          listProductsStyles.viewSearch,
          styles.searchRow,
          darkMode && styles.searchRowDark,
        ]}
      >
        <View style={[styles.searchIconWrap, darkMode && styles.searchIconWrapDark]}>
          <Image source={darkMode ? iconProductDark : iconProduct} style={styles.searchIconImage} />
        </View>
        <TextInput
          ref={refInput}
          autoFocus
          style={[
            listProductsStyles.textSearch,
            { flex: 1 },
            darkMode && styles.textSearchDark,
          ]}
          onChangeText={onChangeSearchText}
          value={searchText}
          placeholder="Buscar por codigo o descripcion"
          placeholderTextColor={darkMode ? "#9CB2C8" : "#7A7A7A"}
          onSubmitEditing={() => loadProducts(searchText, true)}
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
          <Ionicons name="camera-outline" size={24} color={darkMode ? "#8FC3FF" : Colors.DBLUE} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={[listProductsStyles.loader]} size="large" color={darkMode ? "#8FC3FF" : "#00ff00"} />
      ) : empty ? (
        <View style={styles.emptyContainer}>
          <Text style={[listProductsStyles.emptyText, darkMode && { color: "#E8F0F8" }]}>No se encontraron resultados.</Text>
          <TouchableOpacity onPress={() => loadProducts("", false)}>
            <Text style={{ color: darkMode ? "#8FC3FF" : Colors.DBLUE, marginTop: 15 }}>Ver todos los productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ backgroundColor: darkMode ? "#0F1720" : "#E7F1F9" }}
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
              darkMode={darkMode}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  searchRowDark: {
    backgroundColor: "#152332",
    shadowOpacity: 0.22,
  },
  textSearchDark: {
    backgroundColor: "#152332",
    borderColor: "#2D4154",
    color: "#E8F0F8",
  },
  searchIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5FA",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  searchIconWrapDark: {
    backgroundColor: "#243241",
    borderColor: "#2D4154",
  },
  searchIconImage: {
    width: 22,
    height: 22,
  },
  cameraIcon: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  closeButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "transparent",
  },
});
