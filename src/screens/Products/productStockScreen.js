import { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";

import StorageStockInfo from "@components/StorageStockInfo";
import iconStock from "@icons/stock.png";
import { stockScreenStyles } from "@styles/ProductStyle";
import { getProductStock } from "../../services/product";
import { useThemeConfig } from "@context/ThemeContext";

export default function ProductStockScreen({ navigation, route }) {

  const { code = null, name = null } = route?.params || {}


  const [isEmpty, setIsEmpty] = useState(false);
  const [storageInfo, setStorageInfo] = useState([]);
  const [statusResponse, setStatusResponse] = useState("");
  const { darkMode } = useThemeConfig();



  async function loadStockOnline() {

    // const data = await getDataFromAPI("stock/product", JSON.stringify(payload), "POST");

    const data = await getProductStock(code);

    if (data.status_code === 200) {
      if (data.data.length > 0) {
        setStorageInfo(data.data);
      } else {
        setStatusResponse("No hay información disponible");
      }
      setIsEmpty(data.data.length == 0);
    } else {
      setIsEmpty(true);
      setStatusResponse(data.message);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? "#0F1720" : "#FFFFFF" }}>
      <View style={[stockScreenStyles.container, darkMode && styles.containerDark]}>
        <View>
          <Image style={[stockScreenStyles.image]} source={iconStock} />
        </View>
        <View style={[stockScreenStyles.containerTitle]}>
          <Text style={[stockScreenStyles.title, darkMode && styles.titleDark]}>Ficha de stock # {code}</Text>
          <Text style={[stockScreenStyles.titleName, darkMode && styles.titleNameDark]}>{name?.trim()}</Text>
        </View>

        {storageInfo.length > 0 ? (
          <FlatList
            ListFooterComponent={<View />}
            ListFooterComponentStyle={{ height: 200 }}
            scrollEnabled={true}
            style={[stockScreenStyles.flatList]}
            data={storageInfo}
            keyExtractor={(item) => item.deposito + ""}
            renderItem={({ item }) => {
              return <StorageStockInfo stock={item.stock} name={item.deposito} darkMode={darkMode}></StorageStockInfo>;
            }}
          />
        ) : isEmpty ? (
          <Text style={[stockScreenStyles.labelError]}>{statusResponse}</Text>
        ) : (
          <ActivityIndicator style={[stockScreenStyles.loader]} size="large" color={darkMode ? "#8FC3FF" : "#00aa00"} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = {
  containerDark: {
    flex: 1,
    backgroundColor: "#0F1720",
  },
  titleDark: {
    color: "#BFD0E0",
  },
  titleNameDark: {
    color: "#E8F0F8",
  },
};
