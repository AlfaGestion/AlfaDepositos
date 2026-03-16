import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { currencyFormat } from "@libraries/utils"

// import imgProduct from "@icons/product2.png";
import ProductImage from "./ProductImage";

export default function ProductItem(props) {
  const darkMode = props.darkMode === true;

  return (
    <TouchableOpacity onPress={() => props.navigation.navigate("ProductScreen", { id: props.id })}>
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <View>
          {/* <Image style={styles.image} source={imgProduct}></Image> */}

          <ProductImage fileName={props?.code} widthImage={40} heightImage={40} cancelaCarga={props.cancelaCarga} />
        </View>

        <View style={styles.highContainer}>
          <View>
            <Text style={[styles.text, darkMode && styles.textDark]}>{props.name}</Text>
          </View>
          <View style={styles.lowContainer}>
            <Text style={[styles.subText, darkMode && styles.subTextDark]}># {props.code}</Text>
            <Text style={[styles.price, darkMode && styles.textDark]}> {currencyFormat(props.price)}</Text>
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
  containerDark: {
    backgroundColor: "#152332",
    borderBottomColor: "#2D4154",
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
  text: {
    color: "#1B1B1B",
  },
  textDark: {
    color: "#E8F0F8",
  },
  subText: {
    color: "#555",
  },
  subTextDark: {
    color: "#BFD0E0",
  },
});
