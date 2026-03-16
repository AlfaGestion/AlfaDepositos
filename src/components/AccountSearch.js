import { Image, Text, TouchableOpacity, View } from "react-native";

import iconAccount from "@icons/clientes.png";
import iconAccountDark from "@icons/clientes_b.png";

import { cAccountSearchStyles } from "@styles/AccountStyle";

export default function AccountSearch({ name, code, priceClass, lista, functionCall, darkMode = false }) {
  return (
    <TouchableOpacity
      onPress={() => {
        // console.log("LIST", lista)
        functionCall(code, name, priceClass, lista);
      }}
    >
      <View style={[cAccountSearchStyles.container, darkMode && { borderBottomColor: "#2D4154", backgroundColor: "#152332" }]}>
        <Image source={darkMode ? iconAccountDark : iconAccount} style={[cAccountSearchStyles.image]} />
        <View>
          <Text style={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{name}</Text>
          <Text style={{ color: darkMode ? "#BFD0E0" : "#555" }}>{code}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
