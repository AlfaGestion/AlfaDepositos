import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
// import { useNetInfo } from "@react-native-community/netinfo";

import iconSendPending from "@icons/send-orders.png";
import { sendPending } from "@styles/SyncStyle";

import SyncItem from "@components/SyncItem";

import Order from "@db/Order";
import OrderDetail from "@db/OrderDetail";
import Payment from "@db/Payment";
import PaymentInvoices from "@db/PaymentInvoices";
import PaymentMethods from "@db/PaymentMethods";
import Task from "@db/Task";
import VisitDetails from "@db/VisitDetails";
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
  const [showLoaderPayments, setShowLoaderPayments] = useState(true);
  const [showLoaderTasks, setShowLoaderTasks] = useState(true);
  const [showLoaderVisits, setShowLoaderVisits] = useState(true);
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
            setShowError("Ocurrió un error al enviar los nuevos proveedores :" + response.message);
            return true;
          }
        } catch (error) {
          setShowError("Ocurrió un error al enviar los nuevos proveedores :" + error);
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

        // console.log(detailSend)
      }

      // console.log(item)

      ordersSend.push({
        id: item.id,
        account: item.account,
        seller: item.id_seller,
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
        const response = await setDataToApi("order/", JSON.stringify(ordersSend));

        if (!response.error) {
          try {
            await Order.destroy(item.id);
            await OrderDetail.deleteItemsByOrderId(item.id);

            ordersSend = [];
          } catch (e) {
            setShowError("Error al eliminar los comprobantes enviados. No envie nuevamente por que se duplicarían. : " + e);
            return true;
          }
        } else {
          console.log("[SYNC][orders] response error", response);
          setShowError("Ocurrió un error al enviar los comprobantes: " + (response.message || "Error desconocido"));
          return true;
        }
      } catch (error) {
        setShowError("Ocurrió un error al enviar los comprobantes: " + error);
        return true;
      }
    }

    setShowLoaderOrders(false);
    return false;
  };

  const _sendPayments = async () => {
    let payments = await Payment.query();
    let paymentsSend = [];

    for (const item of payments) {
      const invoices = await PaymentInvoices.query({ where: { paymentId_eq: item.paymentId } });
      const methods = await PaymentMethods.query({ where: { paymentId_eq: item.paymentId } });

      paymentsSend.push({
        date: item.date,
        account: item.account,
        // mp: item.mp,
        amount: item.amount,
        // observation: item.obs ? item.obs.trim() : "",
        seller: item.seller,
        tc: item.tc,
        paymentId: item.paymentId,
        invoices: invoices,
        methods: methods,
        // check: {
        //   nro: item.numberCheck,
        //   expiration: "",
        //   idBank: "",
        // },
      });
    }

    if (paymentsSend.length > 0) {
      try {
        const response = await setDataToApi("payment/save", JSON.stringify(paymentsSend));

        if (!response.error) {
          setShowLoaderPayments(false);
          try {
            await Payment.destroyAll();
            return false;
          } catch (e) {
            setShowError("Error al eliminar las cobranzas enviadas. No envie nuevamente por que se duplicarían. : " + e);
            return true;
          }
        } else {
          setShowError("Ocurrió un error al enviar las cobranzas : " + response.message);
          return true;
        }
      } catch (error) {
        setShowError("Ocurrió un error al enviar las cobranzas : " + error);
        return true;
      }
    } else {
      setShowLoaderPayments(false);
      return false;
    }
  };

  const sendTasks = async () => {
    setShowLoaderTasks(false);
    return false;
  };

  const sendVisitsData = async () => {
    setShowLoaderVisits(false);
    return false;
  };

  const sendPayments = async () => {
    setShowLoaderPayments(false);
    return false;
  };

  const _sendTasks = async () => {
    let tasks = await Task.query();
    let tasksSend = [];

    for (const item of tasks) {
      tasksSend.push({
        date: setFormatDate(item.date, true),
        account: item.account,
        obs: item.obs ? item.obs.trim() : "",
        sign: item.sign,
        task: item.service,
        seller: item.seller,
        accountName: item?.accountName || '',
        document: item?.document || '',
        phone: item?.phone || '',
        image1a: item?.image1a || null,
        image1b: item?.image1b || null,
        image2a: item?.image2a || null,
        image2b: item?.image2b || null,
        image3a: item?.image3a || null,
        image3b: item?.image3b || null,
        image4a: item?.image4a || null,
        image4b: item?.image4b || null,
        image5a: item?.image5a || null,
        image5b: item?.image5b || null,
      });
    }

    if (tasksSend.length > 0) {
      try {
        const response = await setDataToApi("task/", JSON.stringify(tasksSend));

        if (!response.error) {
          setShowLoaderTasks(false);
          try {
            await Task.destroyAll();
            return false;
          } catch (e) {
            setShowError("Error al eliminar las tareas enviadas. No envie nuevamente por que se duplicarían. : " + e);
            return true;
          }
        } else {
          setShowError("Ocurrió un error al enviar las tareas :" + response.message);
          return true;
        }
      } catch (error) {
        setShowError("Ocurrió un error al enviar las tareas :" + error);
        return true;
      }
    } else {
      setShowLoaderTasks(false);
      return false;
    }
  };

  const _sendVisitsData = async () => {
    let visitDetail = await VisitDetails.query();
    let visitsSend = [];

    for (const item of visitDetail) {
      visitsSend.push({
        date: item.date,
        account: item.account,
        obs: item.obs ? item.obs.trim() : "",
        seller: item.seller,
        visited: item.visited ? item.visited : 0,
      });
    }

    if (visitsSend.length > 0) {
      try {
        const response = await setDataToApi("seller/visits", JSON.stringify(visitsSend));

        if (!response.error) {
          setShowLoaderVisits(false);
          try {
            const datenow = formatDate(new Date(), true, false)
            await VisitDetails.deleteVisits(datenow)

            return false;
          } catch (e) {
            setShowError("Error al eliminar los datos de visitas. No envie nuevamente por que se duplicarían. : " + e);
            return true;
          }
        } else {
          setShowError("Ocurrió un error al enviar los datos de visitas :" + response.message);
          return true;
        }
      } catch (error) {
        setShowError("Ocurrió un error al enviar los datos de visitas :" + error);
        return true;
      }
    } else {
      setShowLoaderVisits(false);
      return false;
    }
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
          Este proceso enviará todos los movimientos pendientes de sincronización, y una vez confirmada la recepción del servidor, los eliminará de la
          base local.
        </Text>

        <Image style={[sendPending.imageHeader]} source={iconSendPending} />

        {/* {!netInfo.isConnected && <Text style={{ marginBottom: 10, color: "red" }}>No dispone de conexión a internet</Text>} */}


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
