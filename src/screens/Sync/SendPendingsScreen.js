import { useEffect, useLayoutEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";

import iconSendPending from "@icons/enviarPendiente.png";
import iconSendPendingDark from "@icons/enviarPendiente_b.png";
import { sendPending } from "@styles/SyncStyle";

import SyncItem from "@components/SyncItem";

import Order from "@db/Order";
import OrderDetail from "@db/OrderDetail";
import Account from "@db/Account";
import Configuration from "@db/Configuration";
import { useThemeConfig } from "@context/ThemeContext";

import { setDataToApi } from "@libraries/api";

export default function SendPendingsScreen({ navigation }) {
  const [showLoaders, setShowLoaders] = useState(false);
  const [showLoaderOrders, setShowLoaderOrders] = useState(true);
  const [showLoaderAccounts, setShowLoaderAccounts] = useState(true);
  const [showError, setShowError] = useState("");
  const { darkMode } = useThemeConfig();

  const sendNewAccounts = async () => {
    let accounts = await Account.query({ where: { tc_default_eq: "NEW" } });

    for (const item of accounts) {
      let accountsSend = {
        code: "",
        name: item.name,
        email: item.mail,
        address: item.address,
        location: item.location,
        cuit: item.cuit,
        iva: item.iva,
        phone: item.phone,
        seller: item.id_seller,
      };

      try {
        const response = await setDataToApi("account/", JSON.stringify(accountsSend));

        if (!response.error) {
          await Account.update({
            id: item.id,
            code: response.data,
            tc_default: "",
          });

          let orders = await Order.query({ where: { account_eq: item.code } });
          for (const order of orders) {
            await Order.update({
              id: order.id,
              account: response.data,
            });
          }
        } else {
          setShowError("Ocurrio un error al enviar los nuevos proveedores: " + response.message);
          return true;
        }
      } catch (error) {
        setShowError("Ocurrio un error al enviar los nuevos proveedores: " + error);
        return true;
      }
    }

    setShowLoaderAccounts(false);
  };

  const sendOrders = async () => {
    let orders = await Order.query();
    let ordersSend = [];
    let detailSend = [];

    for (const item of orders) {
      const detail = await OrderDetail.findByIdOrder(item.id);

      for (const det of detail) {
        detailSend.push({
          id: item.id,
          product: det.product,
          quantity: det.qty,
          bultos: det.bultos,
          amount: det.unitary,
          dto: det.discount_perc,
          total: det.total,
        });
      }

      const isInventory = item?.tc === "IR";

      if (isInventory) {
        const inventoryPayload = {
          observacion: item.obs || "",
          items: detailSend.map((det) => ({
            idarticulo: det.product,
            idunidad: "",
            conteo1: det.quantity,
            costo: det.amount,
          })),
        };

        detailSend = [];
        try {
          const response = await setDataToApi("inventario/", JSON.stringify(inventoryPayload));

          if (!response.error) {
            await Order.destroy(item.id);
            await OrderDetail.deleteItemsByOrderId(item.id);
          } else {
            setShowError("Ocurrio un error al enviar el inventario: " + (response.message || "Error desconocido"));
            return true;
          }
        } catch (error) {
          setShowError("Ocurrio un error al enviar el inventario: " + error);
          return true;
        }
        continue;
      }

      ordersSend.push({
        id: item.id,
        account: item.account,
        date: item.date,
        total_net: item.net,
        total: item.total,
        facturar: item.bill,
        incluirenreparto: item.delivery,
        items: detailSend,
        lat: item.latitude,
        lng: item.longitude,
        condition: item.condition,
        type: item.cpte,
        obs: item.obs,
        tc: item?.tc,
      });

      detailSend = [];
      try {
        const response = await setDataToApi("order_c/", JSON.stringify(ordersSend));

        if (!response.error) {
          await Order.destroy(item.id);
          await OrderDetail.deleteItemsByOrderId(item.id);
          ordersSend = [];
        } else {
          setShowError("Ocurrio un error al enviar los comprobantes: " + (response.message || "Error desconocido"));
          return true;
        }
      } catch (error) {
        setShowError("Ocurrio un error al enviar los comprobantes: " + error);
        return true;
      }
    }

    setShowLoaderOrders(false);
    return false;
  };

  const handleSendPending = async () => {
    setShowLoaders(true);
    let error = await sendNewAccounts();
    if (error) {
      return;
    }
    error = await sendOrders();
    if (error) {
      return;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: darkMode ? "#16212D" : "#DDEAF8" },
      headerTintColor: darkMode ? "#E8F0F8" : "#1A395A",
      headerTitleStyle: { color: darkMode ? "#E8F0F8" : "#1A395A", fontWeight: "700" },
    });
  }, [navigation, darkMode]);

  return (
    <SafeAreaView style={[sendPending.mainContainer, darkMode && { backgroundColor: "#0F1720" }]}>
      <View style={[sendPending.container, darkMode && { backgroundColor: "#0F1720" }]}>
        <Text style={[sendPending.textHeader, darkMode && { color: "#E8F0F8" }]}>
          Este proceso enviara todos los movimientos pendientes de sincronizacion, y una vez confirmada la recepcion del servidor, los eliminara de la
          base local.
        </Text>

        <Image style={[sendPending.imageHeader]} source={darkMode ? iconSendPendingDark : iconSendPending} />

        {showError == "" ? (
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={showLoaders}
              onPress={handleSendPending}
              style={[
                sendPending.cardButton,
                showLoaders ? sendPending.btnSendPendingDisabled : null,
                darkMode && { backgroundColor: "#152332", borderColor: "#2D4154" },
              ]}
            >
              <View style={[sendPending.cardIconWrap, darkMode && { backgroundColor: "#243241", borderColor: "#2D4154" }]}>
                <Image style={sendPending.cardIcon} source={darkMode ? iconSendPendingDark : iconSendPending} />
              </View>
              <Text style={[sendPending.cardText, darkMode && { color: "#E8F0F8" }]}>Enviar pendientes</Text>
            </TouchableOpacity>

            {showLoaders && (
              <View>
                <SyncItem showLoader={showLoaderAccounts} text="Proveedores" darkMode={darkMode} />
                <SyncItem showLoader={showLoaderOrders} text="Comprobantes" darkMode={darkMode} />
              </View>
            )}
          </View>
        ) : (
          <View style={[sendPending.containerTextError]}>
            <Text style={[sendPending.textError, darkMode && { color: "#FF8A80" }]}>{showError}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
