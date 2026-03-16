import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { Alert, BackHandler, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useFocusEffect } from "@react-navigation/native";

import iconClose from "@icons/salir.png";
import iconCloseDark from "@icons/salir_b.png";
import iconConfiguration from "@icons/config.png";
import iconConfigurationDark from "@icons/config_b.png";
import iconOrders from "@icons/comprobante.png";
import iconOrdersDark from "@icons/comprobante_b.png";
import iconProduct from "@icons/articulos.png";
import iconProductDark from "@icons/articulos_b.png";
import iconSendOrders from "@icons/enviarPendiente.png";
import iconSendOrdersDark from "@icons/enviarPendiente_b.png";
import iconSync from "@icons/sincronizar.png";
import iconSyncDark from "@icons/sincronizar_b.png";

import { UserContext } from "@context/UserContext";
import { useThemeConfig } from "@context/ThemeContext";
import { getUser } from "@storage/UserAsyncStorage";
import Colors from "../styles/Colors";
import BrandMark from "@components/BrandMark";
import { Fonts, Radii, Shadow } from "@styles/Theme";

import Configuration from "@db/Configuration";
import Seller from "@db/Seller";

const PAYMENT_ID = "7";

export default function Home({ navigation }) {
  const DATA = [
    {
      id: "1",
      title: "Sincronizar",
      screen: "SyncScreen",
      icon: iconSync,
      iconDark: iconSyncDark,
    },
    {
      id: "2",
      title: "Comprobantes",
      screen: "ListOrdersScreen",
      icon: iconOrders,
      iconDark: iconOrdersDark,
    },
    {
      id: "3",
      title: "Enviar pendientes",
      screen: "SendPendingsScreen",
      icon: iconSendOrders,
      iconDark: iconSendOrdersDark,
    },
    {
      id: "4",
      title: "Articulos",
      screen: "ProductsScreen",
      icon: iconProduct,
      iconDark: iconProductDark,
    },
    {
      id: "5",
      title: "Configuracion",
      screen: "ConfigurationScreen",
      icon: iconConfiguration,
      iconDark: iconConfigurationDark,
    },
    {
      id: "6",
      title: "Salir",
      action: "exit-app",
      icon: iconClose,
      iconDark: iconCloseDark,
      screen: "",
    },
  ];

  const [login, loginAction] = useContext(UserContext);
  const [menuData, setMenuData] = useState([]);
  const { darkMode } = useThemeConfig();

  const getAccentColor = (id) => {
    const map = {
      "1": "#1E88E5",
      "2": "#1565C0",
      "3": "#00897B",
      "4": "#EF6C00",
      "5": "#455A64",
      "6": "#D32F2F",
    };
    return map[id] || "#1E88E5";
  };

  useEffect(() => {
    ensureAutoLogin();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadSellerConfig();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: darkMode ? "#16212D" : "#DDEAF8" },
      headerTintColor: darkMode ? "#E8F0F8" : "#1A395A",
      headerTitleStyle: { color: darkMode ? "#E8F0F8" : "#1A395A", fontWeight: "700" },
    });
  }, [navigation, darkMode]);

  const loadSellerConfig = async () => {
    try {
      const paymentsConfig = await Configuration.getConfig("PERMITE_COBRANZAS");

      let newData;
      if (paymentsConfig.length > 0 && paymentsConfig[0].value == 0) {
        newData = DATA.filter((item) => item.id !== PAYMENT_ID);
      } else {
        newData = DATA;
      }

      setMenuData(newData);
    } catch (e) {
      setMenuData(DATA);
    }
  };

  const ensureAutoLogin = async () => {
    if (login?.logged) {
      return;
    }

    const stored = await getUser();
    if (stored) {
      loginAction({ type: "sign-in", data: stored });
      return;
    }

    let autoUser = { user: "1", password: "", name: "Vendedor" };
    try {
      const sellers = await Seller.query({ limit: 1, page: 1 });
      if (sellers && sellers.length > 0) {
        const seller = sellers[0];
        autoUser = {
          user: seller.code,
          password: seller.password || "",
          name: seller.name || "",
        };
      }
    } catch (e) {
      // Fallback a valores por defecto
    }

    loginAction({ type: "sign", data: autoUser });
    await Configuration.setConfigValue("TOKEN", "");
  };

  const exitApp = async () => {
    const response = await getUser();
    loginAction({ type: "sign-out", data: response });
    BackHandler.exitApp();
  };

  const Item = (props) => {
    const accent = getAccentColor(props.id);

    return (
      <View
        style={[
          styles.item,
          !darkMode && { borderLeftWidth: 4, borderLeftColor: accent },
          darkMode && styles.itemDark,
          darkMode && { borderLeftWidth: 3, borderLeftColor: `${accent}99` },
        ]}
      >
        <TouchableOpacity
          style={styles.touchableItem}
          onPress={() => {
            if (props.action === "exit-app") {
              Alert.alert("Salir", "Desea salir de la aplicacion?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", onPress: exitApp },
              ]);
              return;
            }
            navigation.navigate(props.screen);
          }}
        >
          <View
            style={[
              styles.iconBadge,
              darkMode ? styles.iconBadgeDark : styles.iconBadgeLight,
              !darkMode && { backgroundColor: `${accent}1A` },
              darkMode && { backgroundColor: `${accent}2D` },
            ]}
          >
            <Image source={darkMode ? props.iconDark : props.icon} style={styles.image} />
          </View>
          <Text style={[styles.title, darkMode ? styles.titleDark : styles.titleLight]}>{props.title}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <Item
      id={item.id}
      title={item.title}
      screen={item.screen}
      icon={item.icon}
      iconDark={item.iconDark}
      action={item.action}
    />
  );

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <FlatList
        data={menuData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <BrandMark label="Alfa Depositos" size={72} darkMode={darkMode} />
            <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
              Gestion agil de depositos y recepciones
            </Text>
          </View>
        }
      />
      <View style={[styles.footer, darkMode && styles.footerDark]}>
        <Text style={[styles.compilationName, darkMode && styles.footerTextDark]}>Nro comp.: 1.0.0</Text>
        <Text style={[styles.mainLabelName, darkMode && styles.footerTextDark]}>
          VENDEDOR: {login?.user?.user ?? ""} - {login?.user?.name ?? ""}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F2FC",
  },
  containerDark: {
    backgroundColor: "#0F1720",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  subtitle: {
    marginTop: 2,
    color: Colors.MUTED,
    fontFamily: Fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
  subtitleDark: {
    color: "#BFD0E0",
  },
  item: {
    backgroundColor: Colors.SURFACE,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    ...Shadow.sm,
  },
  itemDark: {
    backgroundColor: "#1B2633",
    borderColor: "#243241",
    shadowOpacity: 0.22,
  },
  touchableItem: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    fontSize: 18,
    marginLeft: 14,
    fontFamily: Fonts.display,
  },
  titleLight: {
    color: "#1E2A36",
  },
  titleDark: {
    color: "#E8F0F8",
  },
  image: {
    width: 24,
    height: 24,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeLight: {
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  iconBadgeDark: {
    borderWidth: 1,
    borderColor: "#2D4154",
  },
  mainLabelName: {
    color: Colors.DGREY,
    backgroundColor: Colors.SURFACE,
    padding: 12,
    textAlign: "right",
    fontFamily: Fonts.body,
  },
  compilationName: {
    color: Colors.MUTED,
    backgroundColor: Colors.SURFACE,
    padding: 12,
    textAlign: "left",
    fontSize: 10,
    fontFamily: Fonts.body,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.SURFACE,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  footerDark: {
    backgroundColor: "#16212D",
    borderTopColor: "#2A3949",
  },
  footerTextDark: {
    color: "#E8F0F8",
    backgroundColor: "transparent",
  },
});
