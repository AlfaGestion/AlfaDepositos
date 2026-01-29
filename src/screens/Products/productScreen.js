import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { currencyFormat } from "@libraries/utils"
import * as FileSystem from 'expo-file-system';

import imgProduct from "@icons/product2.png";
import { productScreenStyles } from "@styles/ProductStyle";

import ItemLineTextValue from "@components/ItemLineTextValue";

import Product from "@db/Product";
import { Entypo } from "@expo/vector-icons";
import ProductImage from "../../components/ProductImage";
import Configuration from "@db/Configuration";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProductScreen({ navigation, route }) {
  const [productInfo, setProductInfo] = useState([]);
  const [cargaImagenes, setCargaImagenes] = useState(false);
  const [reloadImage, setReloadImage] = useState(false)

  const { id: productId = null } = route?.params || {}

  const loadConfiguration = async () => {
    try {
      await Configuration.createTable();
      const value = await Configuration.getConfigValue("CARGA_IMAGENES");
      setCargaImagenes(value == '1');
    } catch (e) {
      setCargaImagenes(false);
    }
  }

  const loadProduct = async () => {
    const data = await Product.find(parseInt(productId));
    setProductInfo(data);
  };

  useEffect(() => {
    loadConfiguration()
    loadProduct();
  }, [route?.params]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={[productScreenStyles.mainContainer]}>
          {/* <Image style={[productScreenStyles.image]} source={imgProduct}></Image> */}
          {/* <Image
            style={[productScreenStyles.webImage]}
            source={{ uri: 'https://alfanet.com.ar/ac/public/assets/images/112010001/ACEITE.jpg' }}
            resizeMode="cover" // or "contain", "stretch"
          /> */}
          {productInfo &&
            <ProductImage reload={reloadImage} fileName={productInfo?.code} widthImage={150} heightImage={150} cancelaCarga={!cargaImagenes} />
          }
          <View style={[productScreenStyles.container]}>

            <Text style={[productScreenStyles.innerText]}>{productInfo?.name?.trim()}</Text>

            <Text style={[productScreenStyles.title]}># {productInfo?.code}</Text>

            {cargaImagenes &&
              <TouchableOpacity
                style={[productScreenStyles.buttonReloadImage]}
                onPress={async () => {
                  setReloadImage(true)
                  setTimeout(() => {
                    setReloadImage(false)
                  })
                }
                }
              >
                <Ionicons name="reload" size={24} color="white" />
                <Text style={{ color: 'white' }}> Recargar imagen</Text>
              </TouchableOpacity>
            }

            <TouchableOpacity
              style={[productScreenStyles.buttonModifyStock]}
              onPress={() =>
                navigation.navigate("ProductStockScreen", {
                  code: productInfo?.code,
                  name: productInfo?.name,
                })
              }
            >
              <Entypo name="box" size={24} color="white" />
              <Text style={[productScreenStyles.textButton]}>Consultar stock</Text>
            </TouchableOpacity>

            <ItemLineTextValue text="Iva" value={productInfo?.iva} tabs="                "></ItemLineTextValue>
            <ItemLineTextValue text="Código de barras" value={productInfo?.codigoBarras ? productInfo?.codigoBarras : 'No informado'} tabs="     "></ItemLineTextValue>

            <ItemLineTextValue
              text="Precio1"
              value={currencyFormat(productInfo?.price1)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio2"
              value={currencyFormat(productInfo?.price2)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio3"
              value={currencyFormat(productInfo?.price3)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio4"
              value={currencyFormat(productInfo?.price4)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio5"
              value={currencyFormat(productInfo?.price5)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio6"
              value={currencyFormat(productInfo?.price6)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio7"
              value={currencyFormat(productInfo?.price7)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio8"
              value={currencyFormat(productInfo?.price8)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio9"
              value={currencyFormat(productInfo?.price9)}
              tabs="      "
            ></ItemLineTextValue>
            <ItemLineTextValue
              text="Precio10"
              value={currencyFormat(productInfo?.price10)}
              tabs="    "
            ></ItemLineTextValue>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
