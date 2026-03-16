import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import OrderItem from "@components/OrderItem";
import { LocalOrdersStyles } from "@styles/OrderStyle";
import { useIsFocused } from "@react-navigation/native";
import Order from "@db/Order";
import Colors from "@styles/Colors";
import { useCart } from "@hooks/useCart";
import SQLite from "@db/SQLiteCompat";
import { useThemeConfig } from "@context/ThemeContext";

export default function ListOrdersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("compras");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const { darkMode } = useThemeConfig();
  const isFocused = useIsFocused();

  const { setOrderMode } = useCart();

  const hasAccountsTable = useCallback(async () => {
    const db = SQLite.openDatabase("alfadeposito.db");
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'",
          [],
          (_tx, result) => resolve(result.rows.length > 0),
          (_tx, error) => {
            console.error("Error validando tabla accounts:", error);
            resolve(false);
          }
        );
      });
    });
  }, []);

  const loadOrdersPending = useCallback(async (tab) => {
    setLoading(true);
    setIsEmpty(false);

    const tcFilter = tab === "compras" ? "RP" : "IR";

    try {
      const accountsReady = await hasAccountsTable();
      if (!accountsReady) {
        navigation.navigate("SyncScreen");
        return;
      }
      await Order.createTable();
      const data = await Order.findAll();
      const filteredData = data.filter((item) => item.tc === tcFilter);

      setOrders(filteredData);
      setIsEmpty(filteredData.length === 0);
    } catch (error) {
      console.error("Error cargando ordenes:", error);
    } finally {
      setLoading(false);
    }
  }, [hasAccountsTable, navigation]);

  useEffect(() => {
    if (isFocused) {
      loadOrdersPending(activeTab);
    }
  }, [isFocused, activeTab, loadOrdersPending]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: darkMode ? "#16212D" : "#DDEAF8" },
      headerTintColor: darkMode ? "#E8F0F8" : "#1A395A",
      headerTitleStyle: { color: darkMode ? "#E8F0F8" : "#1A395A", fontWeight: "700" },
    });
  }, [navigation, darkMode]);

  const handlePress = (screen, mode) => {
    setOrderMode(mode);
    navigation.navigate(screen, { mode });
    setActiveTab(mode === "COMPRAS" ? "compras" : "inventario");
  };

  const handleActiveTab = (tab) => {
    const mode = tab === "compras" ? "COMPRAS" : "INVENTARIO";
    setOrderMode(mode);
    setActiveTab(tab);
  };

  const renderEmptyContainer = () => (
    <Text style={[LocalOrdersStyles.emptyText, darkMode && { color: "#E8F0F8" }]}>
      {activeTab === "compras" ? "No hay recepciones cargadas." : "No hay movimientos de inventario."}
    </Text>
  );

  const renderList = (type) => (
    <>
      <View style={[LocalOrdersStyles.containerBtnNewOrden, darkMode && { borderBottomColor: "#2D4154" }]}>
        <TouchableOpacity
          style={[
            LocalOrdersStyles.btnNewOrder,
            darkMode && { backgroundColor: "#152332", borderColor: "#2D4154" },
          ]}
          onPress={() =>
            type === "compras"
              ? handlePress("NewOrderScreen", "COMPRAS")
              : handlePress("NewStockScreen", "INVENTARIO")
          }
        >
          <Text style={[LocalOrdersStyles.textNewOrderBtn, darkMode && { color: "#E8F0F8" }]}>
            {type === "compras" ? "Nueva recepcion +" : "Nuevo movimiento +"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={LocalOrdersStyles.loader} size="large" color={darkMode ? "#8FC3FF" : Colors.DBLUE} />
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <OrderItem
              code={item.account}
              total={item.total}
              date={item.date}
              name={item.name || "Deposito general"}
              id={item.id}
              item={item}
              remote={false}
              navigation={navigation}
              darkMode={darkMode}
            />
          )}
          ListFooterComponent={
            <Text style={[LocalOrdersStyles.textDelOrder, darkMode && { color: "#BFD0E0" }]}>Toque un comprobante para editarlo</Text>
          }
        />
      ) : (
        renderEmptyContainer()
      )}
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? "#0F1720" : "#E7F1F9" }}>
      <View
        style={{
          flexDirection: "row",
          height: 50,
          borderBottomWidth: 1,
          borderColor: darkMode ? "#2D4154" : "#ccc",
          backgroundColor: darkMode ? "#16212D" : "#E7F1F9",
        }}
      >
        <TouchableOpacity
          onPress={() => handleActiveTab("compras")}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            borderBottomWidth: activeTab === "compras" ? 3 : 0,
            borderBottomColor: darkMode ? "#8FC3FF" : Colors.DBLUE,
          }}
        >
          <Text
            style={{
              fontWeight: activeTab === "compras" ? "bold" : "normal",
              color: activeTab === "compras" ? (darkMode ? "#E8F0F8" : Colors.DBLUE) : (darkMode ? "#9CB2C8" : "#666"),
            }}
          >
            Recepcion de compras
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleActiveTab("inventario")}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            borderBottomWidth: activeTab === "inventario" ? 3 : 0,
            borderBottomColor: darkMode ? "#8FC3FF" : Colors.DBLUE,
          }}
        >
          <Text
            style={{
              fontWeight: activeTab === "inventario" ? "bold" : "normal",
              color: activeTab === "inventario" ? (darkMode ? "#E8F0F8" : Colors.DBLUE) : (darkMode ? "#9CB2C8" : "#666"),
            }}
          >
            Toma de inventario
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: darkMode ? "#0F1720" : "#E7F1F9" }}>
        {renderList(activeTab)}
      </View>
    </SafeAreaView>
  );
}
