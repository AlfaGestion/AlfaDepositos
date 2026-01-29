import { Image, Text, StyleSheet, View } from "react-native";
import Colors from "@styles/Colors";
import { Fonts, Shadow } from "@styles/Theme";

import alfaLogo from "../../assets/alfa_new_logo_editable.png";

export default function BrandMark({ label = "Alfa Depósitos", size = 64, logoSource = alfaLogo }) {
  const logoSize = size;

  return (
    <View style={styles.container}>
      <Image
        source={logoSource}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: {
    borderRadius: 999,
    backgroundColor: Colors.SURFACE,
    padding: 6,
    ...Shadow.sm,
  },
  label: {
    marginTop: 12,
    fontFamily: Fonts.display,
    fontSize: 20,
    color: Colors.DGREY,
  },
});
