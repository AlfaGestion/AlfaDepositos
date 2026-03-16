import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";

import StorageStockInfo from "@components/StorageStockInfo";
import { useThemeConfig } from "@context/ThemeContext";
import iconStock from "@icons/stock.png";
import Colors from "@styles/Colors";
import { stockScreenStyles } from "@styles/ProductStyle";
import { getProductStock } from "../../services/product";

export default function ProductStockScreen({ navigation, route }) {
  const { code = null, name = null } = route?.params || {};

  const [isEmpty, setIsEmpty] = useState(false);
  const [storageInfo, setStorageInfo] = useState([]);
  const [statusResponse, setStatusResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newQuantity, setNewQuantity] = useState("");
  const [observation, setObservation] = useState("");
  const { darkMode } = useThemeConfig();

  async function loadStockOnline() {
    setIsLoading(true);
    try {
      const data = await getProductStock(code);

      if (data.status_code === 200 && data.data.length > 0) {
        setStorageInfo(data.data);
        setIsEmpty(false);

        const depositoReal = data.data.find((item) => item.deposito === "@REAL");
        const rawValue = depositoReal ? depositoReal.stock : data.data[0]?.stock || "";
        setNewQuantity(rawValue.endsWith(".00") ? rawValue.replace(".00", "") : rawValue);
      } else {
        setIsEmpty(true);
        setStatusResponse(data.message || "No hay informacion disponible");
      }
    } catch (error) {
      console.error(error);
      setStatusResponse("Error al cargar stock");
      setIsEmpty(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStockOnline();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: darkMode ? "#16212D" : "#DDEAF8" },
      headerTintColor: darkMode ? "#E8F0F8" : "#1A395A",
      headerTitleStyle: { color: darkMode ? "#E8F0F8" : "#1A395A", fontWeight: "700" },
    });
  }, [navigation, darkMode]);

  const handleSaveInventory = async () => {
    if (newQuantity === "") {
      Alert.alert("Atencion", "La cantidad no puede estar vacia");
      return;
    }

    Alert.alert("Guardado", `Se registro una cantidad de ${newQuantity}`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? "#0F1720" : "#fff" }}>
      <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: darkMode ? "#0F1720" : "#fff" }}>
        <View style={[stockScreenStyles.container, darkMode && styles.containerDark]}>
          <View style={styles.header}>
            <Image style={stockScreenStyles.image} source={iconStock} />
            <View style={[stockScreenStyles.containerTitle, { flex: 1 }]}>
              <Text style={[stockScreenStyles.title, darkMode && styles.titleDark]}>Toma de Inventario # {code}</Text>
              <Text style={[stockScreenStyles.titleName, darkMode && styles.titleNameDark]}>{name?.trim()}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={darkMode ? "#8FC3FF" : Colors.DBLUE} />
              <Text style={[styles.loaderText, darkMode && styles.loaderTextDark]}>Consultando stock...</Text>
            </View>
          ) : (
            <>
              {!isEmpty && (
                <View style={styles.stockListContainer}>
                  <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Stock por deposito:</Text>
                  {storageInfo.map((item, index) => (
                    <StorageStockInfo
                      key={index}
                      stock={item.stock}
                      name={item.deposito}
                      darkMode={darkMode}
                    />
                  ))}
                </View>
              )}

              {isEmpty && <Text style={stockScreenStyles.labelError}>{statusResponse}</Text>}

              <View style={styles.formContainer}>
                <View style={[styles.card, darkMode && styles.cardDark]}>
                  <Text style={[styles.label, darkMode && styles.labelDark]}>Cantidad Contada (REAL):</Text>
                  <TextInput
                    style={[styles.inputQuantity, darkMode && styles.inputDark]}
                    value={newQuantity}
                    onChangeText={setNewQuantity}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={darkMode ? "#8FA6BD" : "#6C757D"}
                    selectTextOnFocus={true}
                  />

                  <Text style={[styles.label, darkMode && styles.labelDark]}>Observaciones:</Text>
                  <TextInput
                    style={[styles.inputObs, darkMode && styles.inputDark]}
                    value={observation}
                    onChangeText={setObservation}
                    placeholder="Escriba aqui algun detalle del ajuste..."
                    placeholderTextColor={darkMode ? "#8FA6BD" : "#6C757D"}
                    multiline={true}
                    numberOfLines={3}
                  />

                  <TouchableOpacity style={[styles.btnConfirm, darkMode && styles.btnConfirmDark]} onPress={handleSaveInventory}>
                    <Text style={styles.btnText}>GUARDAR AJUSTE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  containerDark: {
    backgroundColor: "#0F1720",
  },
  titleDark: {
    color: "#BFD0E0",
  },
  titleNameDark: {
    color: "#E8F0F8",
  },
  loaderContainer: {
    marginVertical: 40,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#666",
    fontStyle: "italic",
  },
  loaderTextDark: {
    color: "#BFD0E0",
  },
  stockListContainer: {
    marginBottom: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  sectionTitleDark: {
    color: "#BFD0E0",
  },
  formContainer: {
    marginTop: 10,
    width: "100%",
  },
  card: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardDark: {
    backgroundColor: "#152332",
    borderColor: "#2D4154",
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.DBLUE,
    marginBottom: 8,
  },
  labelDark: {
    color: "#8FC3FF",
  },
  inputQuantity: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 8,
    padding: 12,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#212529",
    marginBottom: 20,
  },
  inputObs: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 25,
    color: "#212529",
  },
  inputDark: {
    backgroundColor: "#0F1720",
    borderColor: "#2D4154",
    color: "#E8F0F8",
  },
  btnConfirm: {
    backgroundColor: Colors.DBLUE,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnConfirmDark: {
    backgroundColor: "#244A72",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
