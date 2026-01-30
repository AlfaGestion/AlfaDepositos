import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { currencyFormat } from "@libraries/utils"

import Order from "@db/Order";
import OrderDetail from "@db/OrderDetail";
import Product from "@db/Product";
import Account from "@db/Account";
import imgOrders from "@icons/orders2.png";
import imgArca from "@icons/arca.png";
import useTemplateShare from "../hooks/useTemplateShare";
import usePrintAndShare from "../hooks/usePrintAndShare";
import { UserContext } from "@context/UserContext";
import { useContext } from "react";

export default function OrderItem(props) {
  const { tc, invoice, name, id, date, total, remote, navigation, item } = props;
  const { getTemplate } = useTemplateShare();
  const { generatePdf } = usePrintAndShare();
  const [login] = useContext(UserContext);

  const handleClic = async (remote) => {
    if (remote) {
      navigation.navigate("OrderDetailScreen", {
        tc: tc,
        invoice: invoice,
        name: name,
      });
    } else {
      //Verifico si existe el pedido
      const order = await Order.findById(id);
      if (order.length > 0) {
        if (item?.ecpte == null) {
          navigation.navigate("EditOrderScreen", { navigation, id });
        } else {
          // const html = await getTemplate("efc", { order: item });
          // generatePdf(html);

        }
      } else {
        Alert.alert("Comprobante inexistente", "El comprobante fue eliminado, recarge la pantalla.");
        return;
      }
    }
  };

  const handleShare = async () => {
    if (remote) {
      Alert.alert("No disponible", "No se puede compartir un comprobante remoto.");
      return;
    }
    try {
      const orderRows = await Order.findById(id);
      if (!orderRows || orderRows.length === 0) {
        Alert.alert("Comprobante inexistente", "El comprobante fue eliminado, recargue la pantalla.");
        return;
      }
      const order = orderRows[0];
      const details = await OrderDetail.findByIdOrder(id);
      const priceClass = order?.price_class || 1;
      const products = [];

      for (const det of details || []) {
        const prodRows = await Product.findByCode(det.product, "");
        const product = (prodRows && prodRows.length > 0) ? prodRows[0] : { code: det.product, name: det.product };
        const merged = {
          ...product,
          name: product?.name || det.product,
          quantity: det.qty,
          disc: det.discount_perc || 0,
        };
        if (det.unitary != null) {
          merged[`price${priceClass}`] = det.unitary;
        }
        products.push(merged);
      }

      const account = await Account.findBy({ code_eq: order?.account });
      const payload = {
        order,
        products,
        accountName: account?.name || "",
        sellerName: login?.user?.name || "",
      };
      const templateType = order?.ecpte ? "efc" : "order";
      const html = await getTemplate(templateType, payload);
      generatePdf(html);
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo compartir el comprobante.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mainTap}
        onPress={() => {
          handleClic(remote);
        }}
        onLongPress={() => {
          Alert.alert(
            "Compartir comprobante",
            "¿Desea compartir este comprobante?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Compartir", onPress: () => handleShare() },
            ]
          );
        }}
      >
        <View>
          <Image style={styles.image} source={(item?.ecpte == null) ? imgOrders : imgArca}></Image>
        </View>

        <View style={styles.highContainer}>
          <View>
            <Text>{name}</Text>
          </View>

          <View style={styles.lowContainer}>
            <Text>{date}</Text>
            <Text style={styles.price}> {currencyFormat(total || 0)}</Text>
          </View>

          <View>
            <Text>{item?.tc} {item?.ecpte}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    borderBottomColor: "#e1e1e1",
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 2,
  },
  mainTap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  highContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },
  lowContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "space-between",
    alignItems: "center",
  },
  price: {
    textAlign: "right",
  },
});
