import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
// import { useNetInfo } from "@react-native-community/netinfo";

import iconSendPending from "@icons/send-orders.png";
import { sendPending } from "@styles/SyncStyle";

import SyncItem from "@components/SyncItem";

import Order from "@db/Order";
import OrderDetail from "@db/OrderDetail";
import Account from '@db/Account';
import { formatDate } from "@libraries/utils";


import { setDataToApi } from "@libraries/api";
// import Visit from "../../libraries/db/Visit";

function setFormatDate(date, alter = false) {
  const year = date.substring(6, 10);
  const day = date.substring(0, 2);
  const month = date.substring(3, 5);
  if (alter) {
    return `${year}-${month}-${day}`;
  }
  return `${year}${month}${day}000000`;
}

export default function SendPendingsScreen({ navigation }) {
  // const netInfo = useNetInfo();

  const [showLoaders, setShowLoaders] = useState(false);
  const [showLoaderOrders, setShowLoaderOrders] = useState(true);
  const [showLoaderAccounts, setShowLoaderAccounts] = useState(true);

  const [showError, setShowError] = useState("");

  const sendNewAccounts = async () => {
    let accounts = await Account.query({ where: { tc_default_eq: 'NEW' } });
    // let accountsSend = [];

    for (const item of accounts) {
      let accountsSend = {
        code: '',
        name: item.name,
        email: item.mail,
        address: item.address,
        location: item.location,
        cuit: item.cuit,
        iva: item.iva,
        phone: item.phone,
        seller: item.id_seller
      }

      if (accountsSend) {
        try {
          const response = await setDataToApi("account/", JSON.stringify(accountsSend));

          if (!response.error) {

            await Account.update({
              id: item.id,
              code: response.data,
              tc_default: ''
            })

            let orders = await Order.query({ where: { account_eq: item.code } });
            for (const order of orders) {
              await Order.update({
                id: order.id,
                account: response.data
              })
            }
            // return false;

          } else {
            setShowError("OcurriÃ³ un error al enviar los nuevos proveedores :" + response.message);
            return true;
          }
        } catch (error) {
          setShowError("OcurriÃ³ un error al enviar los nuevos proveedores :" + error);
          return true;
        }
      } else {
        setShowLoaderAccounts(false);
        return false;
      }
    }

    setShowLoaderAccounts(false)
  };

  const sendOrders = async () => {
    let orders = await Order.query();
    let ordersSend = [];
    let detailSend = [];
    let detail;

    for (const item of orders) {
      detail = await OrderDetail.findByIdOrder(item.id);

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
            try {
              await Order.destroy(item.id);
              await OrderDetail.deleteItemsByOrderId(item.id);
            } catch (e) {
              setShowError("Error al eliminar los comprobantes enviados. No envie nuevamente por que se duplicarian. : " + e);
              return true;
            }
          } else {
            console.log("[SYNC][inventario] response error", response);
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
        tc: item?.tc
      });

      detailSend = [];
      try {
        console.log('ORDENES: ', ordersSend)
        const response = await setDataToApi("order_c/", JSON.stringify(ordersSend));

        if (!response.error) {
          try {
            await Order.destroy(item.id);
            await OrderDetail.deleteItemsByOrderId(item.id);

            ordersSend = [];
          } catch (e) {
            setShowError("Error al eliminar los comprobantes enviados. No envie nuevamente por que se duplicarian. : " + e);
            return true;
          }
        } else {
          console.log("[SYNC][orders] response error", response);
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

    let error = await sendOrders();
    if (error) {
      return;
    }
  };

  return (
    <SafeAreaView style={[sendPending.mainContainer]}>
      <View style={[sendPending.container]}>
        <Text style={[sendPending.textHeader]}>
          Este proceso enviarÃ¡ todos los movimientos pendientes de sincronizaciÃ³n, y una vez confirmada la recepciÃ³n del servidor, los eliminarÃ¡ de la
          base local.
        </Text>

        <Image style={[sendPending.imageHeader]} source={iconSendPending} />

        {/* {!netInfo.isConnected && <Text style={{ marginBottom: 10, color: "red" }}>No dispone de conexiÃ³n a internet</Text>} */}


        {showError == "" ? (
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={showLoaders}
              onPress={handleSendPending}
              style={[
                sendPending.cardButton,
                showLoaders ? sendPending.btnSendPendingDisabled : null,
              ]}
            >
              <View style={sendPending.cardIconWrap}>
                <Image style={sendPending.cardIcon} source={iconSendPending} />
              </View>
              <Text style={[sendPending.cardText]}>Enviar pendientes</Text>
            </TouchableOpacity>

            {showLoaders && (
              <View>
              <SyncItem showLoader={showLoaderOrders} text="Comprobantes" />
              </View>
            )}
          </View>
        ) : (
          <View style={[sendPending.containerTextError]}>
            <Text style={[sendPending.textError]}>{showError}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

