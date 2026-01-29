import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import OrderItem from "@components/OrderItem";
import { LocalOrdersStyles } from "@styles/OrderStyle";
import { useIsFocused } from "@react-navigation/native";
import Order from "@db/Order";
import Colors from "@styles/Colors";
import { useCart } from '@hooks/useCart';

export default function ListOrdersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("compras");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const isFocused = useIsFocused();

  const { setOrderMode } = useCart();

  // Función de carga unificada con filtro por TC
  const loadOrdersPending = useCallback(async (tab) => {
    setLoading(true);
    setIsEmpty(false);
    
    // Definimos el filtro según la pestaña
    const tcFilter = tab === "compras" ? "RP" : "IR";
    
    try {
      await Order.createTable();
      // Importante: Asegúrate que tu método Order.findAll() soporte 
      // el filtrado por TC o filtra el resultado aquí:
      const data = await Order.findAll();
      const filteredData = data.filter(item => item.tc === tcFilter);

      setOrders(filteredData);
      setIsEmpty(filteredData.length === 0);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para recargar cuando la pantalla gana foco o cambia la pestaña
  useEffect(() => {
    if (isFocused) {
      loadOrdersPending(activeTab);
    }
  }, [isFocused, activeTab, loadOrdersPending]);

  const handlePress = (screen, mode) => {
    setOrderMode(mode);
    navigation.navigate(screen, { mode: mode });
    
    // Sincronizamos la pestaña y el modo antes de navegar
    const nextTab = mode === "COMPRAS" ? "compras" : "inventario";
    setActiveTab(nextTab);
  };

  const handleActiveTab = (tab) => {
    const mode = tab === "compras" ? "COMPRAS" : "INVENTARIO";
    setOrderMode(mode);
    setActiveTab(tab);
  };

  // --- RENDERS ---

  const renderEmptyContainer = () => (
    <Text style={LocalOrdersStyles.emptyText}>
      {activeTab === "compras" ? "No hay recepciones cargadas." : "No hay movimientos de inventario."}
    </Text>
  );

  const renderList = (type) => (
    <>
      <View style={[LocalOrdersStyles.containerBtnNewOrden]}>
        <TouchableOpacity
          style={[LocalOrdersStyles.btnNewOrder]}
          onPress={() => 
            type === "compras" 
              ? handlePress("NewOrderScreen", "COMPRAS") 
              : handlePress("NewStockScreen", "INVENTARIO")
          }
        >
          <Text style={[LocalOrdersStyles.textNewOrderBtn]}>
            {type === "compras" ? "Nueva recepción +" : "Nuevo movimiento +"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={LocalOrdersStyles.loader} size="large" color={Colors.DBLUE} />
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <OrderItem
              code={item.account}
              total={item.total}
              date={item.date}
              name={item.name || "Depósito general"}
              id={item.id}
              item={item}
              remote={false}
              navigation={navigation}
            />
          )}
          ListFooterComponent={
            <Text style={LocalOrdersStyles.textDelOrder}>Toque un comprobante para editarlo</Text>
          }
        />
      ) : (
        renderEmptyContainer()
      )}
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E7F1F9" }}>
      {/* SELECTOR DE PESTAÑAS */}
      <View style={{ flexDirection: "row", height: 50, borderBottomWidth: 1, borderColor: "#ccc", backgroundColor: "#E7F1F9" }}>
        <TouchableOpacity
          onPress={() => handleActiveTab("compras")}
          style={{
            flex: 1, justifyContent: 'center', alignItems: 'center',
            borderBottomWidth: activeTab === "compras" ? 3 : 0,
            borderBottomColor: Colors.DBLUE
          }}
        >
          <Text style={{
            fontWeight: activeTab === "compras" ? 'bold' : 'normal',
            color: activeTab === "compras" ? Colors.DBLUE : '#666'
          }}>Recepción de compras</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleActiveTab("inventario")}
          style={{
            flex: 1, justifyContent: 'center', alignItems: 'center',
            borderBottomWidth: activeTab === "inventario" ? 3 : 0,
            borderBottomColor: Colors.DBLUE
          }}
        >
          <Text style={{
            fontWeight: activeTab === "inventario" ? 'bold' : 'normal',
            color: activeTab === "inventario" ? Colors.DBLUE : '#666'
          }}>Toma de inventario</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO DINÁMICO */}
      <View style={{ flex: 1 }}>
        {renderList(activeTab)}
      </View>
    </SafeAreaView>
  );
}
