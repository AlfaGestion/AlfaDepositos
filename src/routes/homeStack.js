import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ConfigurationScreen from "@screens/configurationScreen";
import AccountBalanceScreen from "@screens/Accounts/AccountBalanceScreen";
import AccountScreen from "@screens/Accounts/AccountScreen";
import AccountsScreen from "@screens/Accounts/AccountsScreen";
import HomeScreen from "@screens/homeScreen";
import ListOrdersScreen from "@screens/Orders/listOrdersScreen";
import NewOrderScreen from "@screens/Orders/newOrderScreen";
import NewStockScreen from "@screens/Orders/newStockScreen";
import OrderDetailScreen from "@screens/Orders/orderDetailScreen";
import OrdersRemoteScreen from "@screens/Orders/ordersRemoteScreen";
import NewPaymentScreen from "@screens/Payments/newPaymentScreen";
import PaymentsRemoteScreen from "@screens/Payments/paymentsRemoteScreen";
import PaymentsScreen from "@screens/Payments/paymentsScreen";
import ProductsScreen from "@screens/Products/listProductsScreen";
import ProductScreen from "@screens/Products/productScreen";
import ProductStockScreen from "@screens/Products/productStockScreen";
import ProductStockScreen2 from "@screens/Products/productStockScreen2";
import SendPendingsScreen from "@screens/Sync/SendPendingsScreen";
import SyncScreen from "@screens/Sync/SyncScreen";
import NewTaskScreen from "@screens/Tasks/newTaskScreen";
import TasksScreen from "@screens/Tasks/tasksScreen";
import VisitsScreen from "@screens/Sellers/VisitsScreen";
import NewAccountScreen from "@screens/Accounts/NewAccountScreen";
import OrderTabNavigator from "../routes/OrderTabNavigator"; // Si este es un tab navigator
import OrderViewTab from './OrderViewTab';
import CartProviderContainer from './CartProviderContainer';
import CartStockContainer from './CartStockContainer';
import { CartProvider } from '@hooks/useCart'; // Asegúrate de importar el Provider real

const Stack = createStackNavigator();

const HomeStack = () => (
  <NavigationContainer>
    <CartProvider>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          headerTintColor: "#444",
          headerStyle: { backgroundColor: "#e1e1e1" },
        }}
      >
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Inicio", headerLeft: () => { } }}
        />
        <Stack.Screen
          name="SyncScreen"
          component={SyncScreen}
          options={{ title: "Sincronización" }}
        />
        <Stack.Screen
          name="VisitsScreen"
          component={VisitsScreen}
          options={{ title: "Ruta Diaria" }}
        />
        <Stack.Screen
          name="ProductsScreen"
          component={ProductsScreen}
          options={{ title: "Artículos" }}
        />
        <Stack.Screen
          name="ProductScreen"
          component={ProductScreen}
          options={{ title: "Ficha de Articulo" }}
        />
        <Stack.Screen
          name="AccountsScreen"
          component={AccountsScreen}
          options={{ title: "Proveedores" }}
        />
        <Stack.Screen
          name="AccountScreen"
          component={AccountScreen}
          options={{ title: "Ficha de Cliente" }}
        />
        <Stack.Screen
          name="ListOrdersScreen"
          component={ListOrdersScreen}
          options={{ title: "Comprobantes" }}
        />
        <Stack.Screen
          name="NewOrderScreen"
          // component={NewOrderScreen}
          component={CartProviderContainer}
          // component={OrderTabNavigator} // Si es un tab navigator
          options={{ title: "Nueva recepción" }}
        />
        <Stack.Screen
          name="NewStockScreen"
          // component={NewStockScreen}
          component={CartStockContainer}
          // component={OrderTabNavigator} // Si es un tab navigator
          options={{ title: "Nuevo movimiento de stock" }}
        />
        <Stack.Screen
          name="EditOrderScreen"
          component={CartProviderContainer}
          options={{ title: "Editar recepción" }}
        />
        <Stack.Screen
          name="ProductStockScreen"
          component={ProductStockScreen}
          options={{ title: "Consulta de stock" }}
        />
        <Stack.Screen
          name="ProductStockScreen2"
          component={ProductStockScreen2}
          options={{ title: "Consulta de stock" }}
        />
        <Stack.Screen
          name="AccountBalanceScreen"
          component={AccountBalanceScreen}
          options={{ title: "Cuenta Corriente" }}
        />
        <Stack.Screen
          name="ConfigurationScreen"
          component={ConfigurationScreen}
          options={{ title: "Configuración" }}
        />
        <Stack.Screen
          name="PaymentsScreen"
          component={PaymentsScreen}
          options={{ title: "Cobranzas" }}
        />
        <Stack.Screen
          name="PaymentsRemoteScreen"
          component={PaymentsRemoteScreen}
          options={{ title: "Consulta Cobranzas" }}
        />
        <Stack.Screen
          name="NewPaymentScreen"
          component={NewPaymentScreen}
          options={{ title: "Carga de cobranzas" }}
        />
        <Stack.Screen
          name="OrdersRemoteScreen"
          component={OrdersRemoteScreen}
          options={{ title: "Consulta Pedidos" }}
        />
        <Stack.Screen
          name="OrderDetailScreen"
          component={OrderDetailScreen}
          options={{ title: "Detalle de pedido" }}
        />
        <Stack.Screen
          name="TasksScreen"
          component={TasksScreen}
          options={{ title: "Tareas" }}
        />
        <Stack.Screen
          name="NewTaskScreen"
          component={NewTaskScreen}
          options={{ title: "Nueva tarea" }}
        />
        <Stack.Screen
          name="SendPendingsScreen"
          component={SendPendingsScreen}
          options={{ title: "Enviar pendientes" }}
        />
        <Stack.Screen
          name="NewAccountScreen"
          component={NewAccountScreen}
          options={{ title: "Nuevo proveedor" }}
        />
      </Stack.Navigator>
    </CartProvider>
  </NavigationContainer>
);

export default HomeStack;
