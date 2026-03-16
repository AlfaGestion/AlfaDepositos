import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import iconStorage from "@icons/warehouse.png";

export default function StorageStockInfo(props) {
  const darkMode = props.darkMode === true;

  return (
    <TouchableOpacity>
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <View>
          <Image style={styles.image} source={iconStorage}></Image>
        </View>

        <View style={styles.highContainer}>
          <View style={styles.lowContainer}>
            <Text style={[styles.text, darkMode && styles.textDark]}>{props.name.trim() != "" ? props.name.replace("@", "") : "OTROS"}</Text>
            <Text style={[styles.stockText, styles.text, darkMode && styles.textDark]}>{props.stock}</Text>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderBottomColor: "#e1e1e1",
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 2,
  },
  containerDark: {
    backgroundColor: "#152332",
    borderBottomColor: "#2D4154",
    borderRadius: 10,
  },
  image: {
    width: 35,
    height: 35,
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
  text: {
    fontSize: 16,
    color: "#1B1B1B",
  },
  textDark: {
    color: "#E8F0F8",
  },
  stockText: {
    textAlign: "right",
  },
});
