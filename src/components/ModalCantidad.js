import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

// import { useNetInfo } from "@react-native-community/netinfo";
import { cModalQtyStyles } from "@styles/OrderStyle";
import { getProductStock } from "../services/product";
import Colors from "../styles/Colors";
import { useThemeConfig } from "@context/ThemeContext";

import Configuration from "@db/Configuration";

export default function ModalCantidad(props) {
  const [config, setConfig] = useState({
    showStock: "",
    descPorArticulo: "",
    bloqueaStockRealNegativo: "",
    bloqueaStockComprometidoNegativo: "",
    pideBultos: "",
    pidePrecio: ""
  })
  // const netInfo = useNetInfo();

  const [errorStock, setErrorStock] = useState(false)
  const [currentStock, setCurrentStock] = useState({ real: 0, comprometido: 0, total: null, disponible: null })
  const [isLoading, setIsLoading] = useState(false)
  const { modalVisible, setQtyProduct, setPriceProduct, priceProduct, setBultosProduct, setDiscProduct, handleAddProduct, setModalVisible, productSelected } = props;
  const { darkMode } = useThemeConfig();
  // const inputRef = React.useRef(null);

  async function loadStockOnline() {

    if (productSelected?.length == 0) {
      // if (productSelected?.length == 0 || !netInfo.isConnected) {
      // if (!netInfo.isConnected) {
      setCurrentStock({ real: 999999, comprometido: 0, total: 999999, disponible: 9999999 })
      // }
      return;
    }

    setIsLoading(true)
    const data = await getProductStock(productSelected.code);

    if (data) {
      if (data.data.length > 0) {
        let stockReal = 0;
        let stockComprometido = 0;
        data.data.map((item) => {
          if (item.deposito == '@COMPROMETIDO') {
            stockComprometido = parseFloat(item.stock)
          } else if (item.deposito == '@REAL') {
            stockReal = parseFloat(item.stock)
          }
        })

        // setCurrentStock(stockReal - stockComprometido)
        let disponible;

        if (config.bloqueaStockRealNegativo == "1") {
          disponible = stockReal
        } else if (config.bloqueaStockComprometidoNegativo == "1") {
          disponible = stockReal - stockComprometido
        } else {
          disponible = stockReal
        }

        setCurrentStock({ real: stockReal, comprometido: stockComprometido, total: stockReal - stockComprometido, disponible: disponible })

        if (config.bloqueaStockRealNegativo == "1") {
          if (stockReal <= 0) {
            setErrorStock(true)
          }
        } else if (config.bloqueaStockComprometidoNegativo == "1") {
          if ((stockReal - stockComprometido) <= 0) {
            setErrorStock(true)
          }
        }
      }
    }
    setIsLoading(false)
  }

  const loadConfig = async () => {
    let newConfig = {}

    setErrorStock(false)
    setCurrentStock({ real: 0, comprometido: 0, total: null, disponible: null })

    let data = await Configuration.getConfig("DESCUENTO_POR_ARTICULO");
    newConfig.descPorArticulo = data[0].value;

    data = await Configuration.getConfig("CONSULTA_STOCK_PEDIDOS");
    newConfig.showStock = data[0].value;

    data = await Configuration.getConfig("BLOQUEA_STK_REAL_NEGATIVO");
    newConfig.bloqueaStockRealNegativo = data[0].value;

    data = await Configuration.getConfig("BLOQUEA_STK_COMPROMETIDO_NEGATIVO");
    newConfig.bloqueaStockComprometidoNegativo = data[0].value;

    data = await Configuration.getConfig("PIDE_BULTOS");
    newConfig.pideBultos = data[0].value;

    data = await Configuration.getConfig("PIDE_PRECIO");
    newConfig.pidePrecio = data[0].value;

    setConfig(newConfig)

    // if (netInfo.isConnected) {
    if (productSelected?.length > 0 || productSelected?.code != '') {
      if (newConfig.bloqueaStockRealNegativo == "1" || newConfig.bloqueaStockComprometidoNegativo == "1") {
        await loadStockOnline()

      }
    }
    // }

  };

  const validateStock = (text) => {

    const cant = text != "" ? parseFloat(text) : 0

    // if (netInfo.isConnected) {
    if (config.bloqueaStockRealNegativo == "1" || config.bloqueaStockComprometidoNegativo == "1") {
      if (config.bloqueaStockRealNegativo == "1") {
        if (currentStock.real < parseFloat(cant)) {
          setErrorStock(true)
          return;
        }
      } else if (config.bloqueaStockComprometidoNegativo == "1") {
        if (currentStock.total < parseFloat(cant)) {
          setErrorStock(true)
          return;
        }
      }

      setErrorStock(false)
    }
    // }
    setQtyProduct(cant)

  }

  useEffect(() => {

    loadConfig();
    // console.log(productSelected)
    setPriceProduct(productSelected.price + "")
  }, [productSelected]);

  return (
    <View style={{ ...cModalQtyStyles.centeredView, ...cModalQtyStyles.mainContainer }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Debe presionar cancelar.");
        }}
      // onShow={() => inputRef.current.focus()}
      >
        <View style={{ ...cModalQtyStyles.centeredView, ...cModalQtyStyles.container }}>
          <View style={[cModalQtyStyles.modalView, darkMode && { backgroundColor: "#152332", borderColor: "#2D4154", borderWidth: 1 }]}>
            <View style={[cModalQtyStyles.inputQtyContainer]}>
              {config.showStock == 1 &&
                // {config.showStock == 1 && netInfo.isConnected &&
                <TouchableOpacity onPress={loadStockOnline} activeOpacity={.7} style={cModalQtyStyles.btnStock}>
                  <Text style={cModalQtyStyles.textBtnStock}>Obtener stock</Text>
                </TouchableOpacity>
              }

              {/* {!netInfo.isConnected &&
                <View style={cModalQtyStyles.containerWithOutConnecction}>
                  <Text style={cModalQtyStyles.textWithOutConnection}>No dispone de  conexión a internet, no se podrá validar el stock.</Text>
                </View>
              } */}

              {isLoading && <ActivityIndicator size="small" color={Colors.GREEN} />}
              {!isLoading && currentStock.disponible != null && (
                currentStock.disponible <= 0 ? (
                  <Text style={cModalQtyStyles.stockCritic}>Atención! Stock: {currentStock.disponible}</Text>
                ) : (
                  <Text style={cModalQtyStyles.stockOk}>Stock disponible: {currentStock.disponible}</Text>
                )
              )}

              {productSelected && (
                <View style={cModalQtyStyles.containerTextProduct}>
                  <Text style={[cModalQtyStyles.textProduct, darkMode && { color: "#BFD0E0" }]}># {productSelected.code}</Text>
                  <Text style={[cModalQtyStyles.textProduct, darkMode && { color: "#E8F0F8" }]}>{productSelected.name}</Text>
                </View>
              )}

              <Text style={[cModalQtyStyles.modalText, darkMode && { color: "#E8F0F8" }]}>Ingrese la cantidad</Text>

              <TextInput
                autoFocus={modalVisible}
                // ref={inputRef}
                style={[cModalQtyStyles.inputQty, darkMode && { backgroundColor: "#0F1720", borderColor: "#2D4154", color: "#E8F0F8" }]}
                onChangeText={(text) => validateStock(text)}
                keyboardType="number-pad"
                editable={!isLoading}
              />
              <Text style={[cModalQtyStyles.textSmall, darkMode && { color: "#9CB2C8" }]}>Si no se informa se toma 1</Text>
            </View>

            {config.pideBultos == "1" && (
              <View style={[cModalQtyStyles.inputQtyContainer]}>
                <Text style={[cModalQtyStyles.modalText, darkMode && { color: "#E8F0F8" }]}>Ingrese los bultos</Text>

                <TextInput
                  // autoFocus={modalVisible}
                  // ref={inputRef}
                  style={[cModalQtyStyles.inputQty, darkMode && { backgroundColor: "#0F1720", borderColor: "#2D4154", color: "#E8F0F8" }]}
                  onChangeText={(text) => setBultosProduct(text)}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              </View>
            )}

            {config.pidePrecio == "1" && (
              <View style={[cModalQtyStyles.inputQtyContainer]}>
                <Text style={[cModalQtyStyles.modalText, darkMode && { color: "#E8F0F8" }]}>Ingrese el precio</Text>

                <TextInput
                  // autoFocus={modalVisible}
                  // ref={inputRef}
                  value={priceProduct}
                  // defaultValue={productSelected.price + ""}
                  style={[cModalQtyStyles.inputQty, darkMode && { backgroundColor: "#0F1720", borderColor: "#2D4154", color: "#E8F0F8" }]}
                  onChangeText={(text) => setPriceProduct(text)}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              </View>
            )}

            {config.descPorArticulo == 1 ? (
              <View style={[cModalQtyStyles.inputQtyContainer]}>
                <Text style={[cModalQtyStyles.modalText, darkMode && { color: "#E8F0F8" }]}>Descuento</Text>
                <TextInput
                  style={[cModalQtyStyles.inputQty, darkMode && { backgroundColor: "#0F1720", borderColor: "#2D4154", color: "#E8F0F8" }]}
                  onChangeText={(text) => setDiscProduct(text)}
                  keyboardType="number-pad"
                  editable={!isLoading}
                ></TextInput>
              </View>
            ) : (
              <View></View>
            )}

            <View style={[cModalQtyStyles.containerButtons]}>
              <TouchableOpacity
                activeOpacity={.7}
                style={{ ...cModalQtyStyles.button, ...cModalQtyStyles.buttonCancel }}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={[cModalQtyStyles.textStyle]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={.7}
                style={{ ...cModalQtyStyles.button, ...cModalQtyStyles.buttonAccept }}
                disabled={errorStock || isLoading}
                onPress={() => {
                  handleAddProduct();
                }}
              >
                <Text style={[cModalQtyStyles.textStyle]}>Aceptar</Text>
              </TouchableOpacity>
            </View>
            {errorStock && !isLoading && <Text style={cModalQtyStyles.errorStockText}>No dispone de stock suficiente.</Text>}
          </View>
        </View>
      </Modal>
    </View>
  );
}
