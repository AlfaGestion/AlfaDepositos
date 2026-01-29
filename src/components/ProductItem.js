import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { currencyFormat } from "@libraries/utils"

// import imgProduct from "@icons/product2.png";
import ProductImage from "./ProductImage";

export default function ProductItem(props) {
  // console.log(props.id)
  return (
    <TouchableOpacity onPress={() => props.navigation.navigate("ProductScreen", { id: props.id })}>
      <View style={styles.container}>
        <View>
          {/* <Image style={styles.image} source={imgProduct}></Image> */}

          <ProductImage fileName={props?.code} widthImage={40} heightImage={40} cancelaCarga={props.cancelaCarga} />
        </View>

        <View style={styles.highContainer}>
          <View>
            <Text>{props.name}</Text>
          </View>
          <View style={styles.lowContainer}>
            <Text># {props.code}</Text>
            <Text style={styles.price}> {currencyFormat(props.price)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    borderBottomColor: "#e1e1e1",
    borderBottomWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
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
    width: "85%",
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
