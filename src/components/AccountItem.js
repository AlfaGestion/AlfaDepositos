import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import imgAccount from "@icons/clientes.png";

export default function AccountItem(props) {
  return (
    <TouchableOpacity onPress={() => props.navigation.navigate("AccountScreen", { id: props.id })}>
      <View style={styles.container}>
        <View>
          <Image style={styles.image} source={imgAccount}></Image>
        </View>

        <View style={styles.accountContainer}>
          <Text>{props.name}</Text>
          <Text>{props.code}</Text>
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
  accountContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "85%",
  },
});
