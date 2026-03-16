import { Image, Text, TouchableOpacity, View } from "react-native";
import { currencyFormat } from "@libraries/utils"
import { useThemeConfig } from "@context/ThemeContext";

import imgProduct from "@icons/articulos.png";
import imgProductDark from "@icons/articulos_b.png";
import { cProductSearchStyles } from "@styles/ProductStyle";

export default function ProductSearch(props) {
  const { darkMode } = useThemeConfig();

  return (
    <TouchableOpacity
      onPress={() => {
        props.handleRestart();
        props.functionCall(props.code, props.name, props.price);
      }}
    >
      <View style={[cProductSearchStyles.container]}>
        <Image style={[cProductSearchStyles.image]} source={darkMode ? imgProductDark : imgProduct}></Image>

        <View style={[cProductSearchStyles.highContainer]}>
          <View>
            <Text style={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{props.name?.trim()}</Text>
          </View>
          {props.showAmount == 1 ? (
            <View style={[cProductSearchStyles.lowContainer]}>
              <Text style={{ color: darkMode ? "#BFD0E0" : "#1B1B1B" }}># {props.code}</Text>
              <Text style={[cProductSearchStyles.price, { color: darkMode ? "#E8F0F8" : "#1B1B1B" }]}>{currencyFormat(props.price)}</Text>
            </View>
          ) : (
            <View style={[cProductSearchStyles.lowContainer]}>
              <Text style={{ color: darkMode ? "#BFD0E0" : "#1B1B1B" }}># {props.code}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
