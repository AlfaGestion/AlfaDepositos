import { useContext, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";


import { newOrderStyles } from "@styles/OrderStyle";

import CartList from "@components/CartList";
import ModalCantidad from "@components/ModalCantidad";
import ModalMessage from "@components/ModalMessage";

import Configuration from "@db/Configuration";
import Order from "@db/Order";

import { bulkInsert } from "@db/Functions";
import { formatDate } from "@libraries/utils";

import { UserContext } from "@context/UserContext";
import AccountListSearch from "../../components/AccountListSearch";
import ProductListSearch from "../../components/ProductListSearch";

import Account from "@db/Account";
import OrderDetail from "@db/OrderDetail";
import Product from "@db/Product";
import VisitDetails from "@db/VisitDetails";
// import { getLocation } from "../../services/location";
import { getAvailableStockProducts } from "../../services/product";

import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
// import { useNetInfo } from "@react-native-community/netinfo";

import usePrintAndShare from "@hooks/usePrintAndShare";
import useTemplateShare from "@hooks/useTemplateShare";
import { generarComprobanteElectronico } from "../../libraries/arca";

export default function NewStockScreen({ route }) {

  const { id = null, account = null } = route?.params || {}

  const [login, loginAction] = useContext(UserContext);
  // const netInfo = useNetInfo();

  const [errorCpte, setErrorCpte] = useState(null)
  const [currentAccount, setCurrentAccount] = useState({
    code: 2111010289,
    name: 'DepÃ³sito general',
    priceClass: 1,
    lista: 1
  });

  const [priceClass, setPriceClass] = useState(null);
  const [typeDocument, setTypeDocument] = useState("IR");
  const [saleCondition, setSaleCondition] = useState(null);
  const [typeInvoice, setTypeInvoice] = useState(null);
  const [observation, setObservation] = useState("");

  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSavingVisible, setModalSavingVisible] = useState(false);
  const [productSelected, setProductSelected] = useState([]);

  const [qtyProduct, setQtyProduct] = useState(0);
  const [priceProduct, setPriceProduct] = useState(0);
  const [bultosProduct, setBultosProduct] = useState(0);
  const [discProduct, setDiscProduct] = useState(0);
  const [showAmounts, setShowAmounts] = useState(false);
  const [isEditOrder, setIsEditOrder] = useState(false);

  const { generatePdf, printDocument } = usePrintAndShare();
  const { getTemplate } = useTemplateShare();

  const getConfig = async () => {
    const showAmountsInOrder = await Configuration.getConfigValue("MOSTRAR_TOTALES_PEDIDOS");
    setShowAmounts(showAmountsInOrder);
  };

  useEffect(() => {
    // console.log('PARAMETRO: ',route?.params)

    getConfig();
    if (id) {
      loadOrderFromDb(id);
    } else {
      if (currentAccount) {
        loadAccountSelected(currentAccount);
      }
    }
  }, []);

  const loadAccountSelected = async (account) => {
    const newAccount = await Account.findBy({ code_eq: account });
    if (newAccount) {

      // console.log("CUSTOMER", newAccount)
      setPriceClass(newAccount.price_class);
      setTimeout(() => {
        setCurrentAccount({
          code: account,
          name: newAccount.name,
          priceClass: newAccount.price_class,
          lista: newAccount.lista
        });
      }, 50);
    }
  };

  const loadOrderFromDb = async (id) => {
    const dataOrder = await Order.findById(id);
    const accountData = await Account.findBy({ code_eq: dataOrder[0].account });
    const orderDetail = await OrderDetail.findByIdOrder(id);

    setIsEditOrder(true);
    setPriceClass(dataOrder[0].price_class);
    setSaleCondition(dataOrder[0].condition);
    setTypeInvoice(dataOrder[0].cpte);
    setTypeDocument(dataOrder[0].tc)

    const productsCart = [];
    for (const item in orderDetail) {
      const productData = await Product.findBy({ code_eq: orderDetail[item].product });
      productsCart.push({
        code: orderDetail[item].product,
        name: productData.name,
        price: orderDetail[item].unitary,
        qty: orderDetail[item].qty,
        disc: orderDetail[item].discount_perc,
      });
    }

    setProducts(productsCart);
    // console.log("PASO")

    // console.log(accountData)
    setCurrentAccount({
      code: accountData.code,
      name: accountData.name,
      priceClass: dataOrder.price_class,
      lista: accountData.lista
    });
  };

  const handleSelAccount = (code, name, priceClass, lista) => {
    setCurrentAccount({
      code,
      name,
      priceClass,
      lista
    });
    setPriceClass(priceClass);
  };

  const addProductToCart = (code, name, price, qty, disc, bultos = 0) => {
    //Busco si el producto ya esta cargado, entonces sumo las cantidades
    // var res = products.map((s) => s.code === code).lastIndexOf(true);
    // if (res > -1) {
    //   products[res].qty += qty;
    //   setProducts(products);
    // } else {
    const newProduct = {
      code: code,
      name: name,
      price: price,
      bultos: bultos,
      qty: qty,
      disc: disc,
    };
    const joined = products.concat(newProduct);
    setProducts(joined);
    // }

    setProductSelected([]);
    setQtyProduct(0);
    setBultosProduct(0);
    setDiscProduct(0);
    setPriceProduct(0)
  };

  const handleSelProduct = (code, name, price) => {
    setProductSelected({
      code: code,
      name: name,
      price: price,
    });

    setModalVisible(true);
  };

  const handleAddProduct = () => {
    addProductToCart(
      productSelected.code,
      productSelected.name,
      priceProduct,
      parseFloat(qtyProduct || 1),
      parseFloat(discProduct),
      parseFloat(bultosProduct)
    );
    setModalVisible(false);
  };



  async function saveProducts(id, isShare = false, isPrint = false) {
    let objectArray = [];
    let props = {};
    const esCpteElectronico = (typeDocument == 'eFC' || typeDocument == 'eNC' || typeDocument == 'eND')

    products.map((item) => {
      props = {
        order_id: parseInt(id),
        product: item.code,
        qty: item.qty,
        bultos: item.bultos,
        unitary: item.price,
        total:
          item.disc > 0 ? (item.price - (item.disc * item.price) / 100) * item.qty : item.price * item.qty,
        transferred: 0,
        discount_perc: item.disc,
      };
      objectArray.push(props);
    });

    try {
      bulkInsert("orders_detail", objectArray);

      //GENERO COMPROBANTE ELECTRONICO
      // console.log(typeDocument)
      if (esCpteElectronico) {
        const eRes = await generarComprobanteElectronico(typeDocument, parseInt(id))
        // console.log(eRes)

        if (eRes?.error) {
          setErrorCpte(eRes.message)
          setModalSavingVisible(false)
          return
        }
      }

      if (isShare || isPrint || esCpteElectronico) {
        const order = await Order.find(parseInt(id));
        const payload = { order, products, };

        const account = await Account.findBy({ code_eq: order.account });
        payload.accountName = account ? currentAccount.name : "";
        payload.sellerName = login.user.name;

        if (isShare) {
          const html = await getTemplate(esCpteElectronico ? "efc" : "order", payload);
          generatePdf(html);
        } else {
          printDocument(payload)
        }
      }

      if (currentAccount != null) {
        navigation.setParams("realod", true);
        navigation.navigate("VisitsScreen");
      } else {
        navigation.setParams("reloadOrderList", true);
        navigation.navigate("ListOrdersScreen", { reloadOrderList: true });
      }
    } catch (e) {
      console.log("Error al grabar items de pedido: " + e);
    }
  }

  const handleDeleteOrder = () => {
    return Alert.alert("Â¿Eliminar?", "Â¿EstÃ¡ seguro que desea eliminar el pedido? No podrÃ¡ recuperarlo.", [
      {
        text: "Si",
        onPress: () => {
          deleteOrder();
        },
      },
      {
        text: "No",
      },
    ]);
  };

  const deleteOrder = async () => {
    await OrderDetail.deleteItemsByOrderId(id);
    await Order.destroy(id);
    navigation.setParams("reloadOrderList", true);
    navigation.navigate("ListOrdersScreen", { reloadOrderList: true });
  };

  const handleSaveOrder = async (isShare = false, forcePrint = false) => {
    setModalSavingVisible(true);
    setErrorCpte(null)
    let total = 0;
    let isPrint = false;
    const esCpteElectronico = (typeDocument == 'eFC' || typeDocument == 'eNC' || typeDocument == 'eND')

    // if (esCpteElectronico && !netInfo.isConnected) {
    //   setErrorCpte("No hay conexiÃ³n a internet.")
    //   return
    // }

    isPrint = await Configuration.getConfigValue("PRINT_SUNMI") == 1
    if (forcePrint) {
      isPrint = true
    }

    const comprobanteTransferido = esCpteElectronico ? 1 : 0

    for await (const product of products) {
      if (product.disc > 0) {
        total += (product.price - (product.disc * product.price) / 100) * product.qty;
      } else {
        total += product.qty * product.price;
      }
    }

    let id = isEditOrder ? id : 0;

    let coords;
    if (!isEditOrder) {
      // coords = await getLocation();
      coords = {
        latitude: 0,
        longitude: 0,
      };
    }

    const props = {
      account: currentAccount.code,
      date: formatDate(new Date(), true),
      id_seller: login.user.user,
      net: total,
      iva: 21,
      total: total,
      transferred: comprobanteTransferido,
      bill: 0,
      delivery: 0,
      price_class: priceClass,
      condition: saleCondition || null,
      cpte: typeInvoice || null,
      tc: typeDocument || null,
      obs: observation || ''// !netInfo.isConnected ? "No se valido stock por falta de conexion" : ""
    };

    if (isEditOrder) {
      props["id"] = id;
    } else {
      props["latitude"] = coords.latitude;
      props["longitude"] = coords.longitude;
    }

    try {
      if (isEditOrder) {
        await Order.update(props);

        //Elimino los productos de la base
        await OrderDetail.deleteItemsByOrderId(id);
      } else {
        try {
          const order = new Order(props);
          await order.save();

          const dataId = await Order.getLastId();
          id = dataId[0].id;

          //Inserto la visita
          const existsVisit = await VisitDetails.findBy({ account_eq: currentAccount.code });

          if (!existsVisit) {
            const dataVisit = {
              visited: 1,
              obs: "",
              account: currentAccount.code,
              seller: login.user.user,
              date: formatDate(new Date(), true, false),
            };

            const visit = new VisitDetails(dataVisit);
            visit.save();
          }
        } catch (err) {
          console.log(err);
        }
      }

      saveProducts(id, isShare, isPrint);
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <SafeAreaView styles={[newOrderStyles.mainContainer]}>
      <ModalCantidad
        modalVisible={modalVisible}
        setQtyProduct={setQtyProduct}
        setBultosProduct={setBultosProduct}
        setModalVisible={setModalVisible}
        handleAddProduct={handleAddProduct}
        setDiscProduct={setDiscProduct}
        setPriceProduct={setPriceProduct}
        priceProduct={priceProduct}
        productSelected={productSelected}
      ></ModalCantidad>

      <ModalMessage
        modalVisible={modalSavingVisible}
        setModalVisible={setModalSavingVisible}
        message="Grabando"
      ></ModalMessage>


      <View>
        <View style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6 }}>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>Cargando información de inventario</Text>
        </View>
        <View style={[newOrderStyles.containerButtons]}>
          <TouchableOpacity
            onPress={() => {
              handleSaveOrder();
            }}
            style={{ ...newOrderStyles.btnOptions, ...newOrderStyles.btnSave }}
          >
            <Entypo name="save" color="white" size={18} />
            <Text style={[newOrderStyles.textBtnOptions]}>Grabar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleSaveOrder(true);
            }}
            style={{ ...newOrderStyles.btnOptions, ...newOrderStyles.btnSave }}
          >
            <AntDesign name="sharealt" color="white" size={18} />
            <Text style={[newOrderStyles.textBtnOptions]}>Grabar y compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ ...newOrderStyles.btnOptions, ...newOrderStyles.btnCancel }}
          >
            <MaterialIcons name="cancel" size={18} color="white" />
            <Text style={[newOrderStyles.textBtnOptions]}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {isEditOrder && (
          <View style={[newOrderStyles.containerEditButtons]}>
            <TouchableOpacity
              onPress={() => handleDeleteOrder()}
              style={{ ...newOrderStyles.btnCancel, ...newOrderStyles.btnDeleteOrder }}
            >
              <AntDesign name="delete" size={20} color="white" />
              <Text style={[newOrderStyles.textBtnOptions]}>Eliminar pedido</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => handleSaveOrder(false, true)}
              style={{ ...newOrderStyles.btnCancel, ...newOrderStyles.btnDeleteOrder, marginTop: 10, backgroundColor: "blue" }}
            >
              <AntDesign name="printer" size={20} color="white" />
              <Text style={[newOrderStyles.textBtnOptions]}>Imprimir</Text>
            </TouchableOpacity> */}
          </View>
        )}

        <View style={[newOrderStyles.searchProducts, { zIndex: 99 }]}>
          <View style={{ zIndex: 999999999999 }}>
            <Text style={newOrderStyles.observationLabel}>Observación</Text>
            <TextInput
              value={observation}
              onChangeText={setObservation}
              placeholder="Escribí una observación..."
              multiline={true}
              style={newOrderStyles.observationInput}
            />
          </View>
        </View>
      </View>



      {currentAccount.code != "" && (
        <ProductListSearch
          handleSelProduct={handleSelProduct}
          showAmounts={showAmounts}
          priceClassSelected={priceClass}
          lista={currentAccount?.lista}
        />
      )}

      {errorCpte && <Text style={{ fontSize: 12, backgroundColor: "red", color: "white", paddingVertical: 4, textAlign: "center", marginTop: 5 }}>{errorCpte}</Text>}

      {products.length > 0 && currentAccount.code != "" ? (
        <CartList data={products} fnSetData={setProducts} showAmounts={showAmounts} />
      ) : (
        <Text></Text>
      )}
    </SafeAreaView>
  );
}

