import { useContext, useEffect, useState } from "react";
import { Alert, BackHandler, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import Ionicons from "@expo/vector-icons/Ionicons";

import iconClose from "@icons/close.png";
import iconConfiguration from "@icons/configuration.png";
import iconAccount from "@icons/account.png";
import iconMap from "@icons/map.png";
import iconOrders from "@icons/orders.png";
import iconOrdersHist from "@icons/orders2.png";
import iconPayments from "@icons/payment.png";
import iconProduct from "@icons/product.png";
import iconSendOrders from "@icons/send-orders.png";
import iconSync from "@icons/sync.png";
import iconTasks from "@icons/tasks.png";

import { UserContext } from "@context/UserContext";
import { getUser } from "@storage/UserAsyncStorage";
import Colors from "../styles/Colors";
import BrandMark from "@components/BrandMark";
import { Fonts, Radii, Shadow } from "@styles/Theme";

import Configuration from "@db/Configuration";
import Seller from "@db/Seller";

// import * as TaskManager from "expo-task-manager";
// import * as Location from "expo-location";
// import * as BackgroundFetch from "expo-background-fetch";

const PAYMENT_ID = "7";

// const BACKGROUND_LOCATION_TASK = "locationTask";
// const BACKGROUND_FETCH_TASK = "background-fetch";

// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   const now = Date.now();

//   console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);

//   try {
//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (error) {
//     console.log("ERROR", error);
//     return BackgroundFetch.Result.Failed;
//   }
// });

// async function registerBackgroundFetchAsync() {
//   return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
//     minimumInterval: 1, // 15 minutes
//     stopOnTerminate: false, // android only,
//     startOnBoot: true, // android only
//   });
// }

// async function unregisterBackgroundFetchAsync() {
//   return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
// }

export default function Home({ navigation }) {
  const DATA = [
    {
      id: "1",
      title: "Sincronizar",
      screen: "SyncScreen",
      icon: iconSync,
    },
    // {
    //   id: "2",
    //   title: "Ruta Diaria",
    //   screen: "VisitsScreen",
    //   icon: iconMap,
    // },
    {
      id: "2",
      title: "Comprobantes",
      screen: "ListOrdersScreen",
      icon: iconOrders,
    },
    {
      id: "3",
      title: "Enviar pendientes",
      screen: "SendPendingsScreen",
      icon: iconSendOrders,
    },
    {
      id: "4",
      title: "Artículos",
      screen: "ProductsScreen",
      icon: iconProduct,
    },
    // {
    //   id: "6",
    //   title: "Proveedores",
    //   screen: "AccountsScreen",
    //   icon: iconAccount,
    // },
    // {
    //   id: "7",
    //   title: "Cobranzas",
    //   screen: "PaymentsScreen",
    //   icon: iconPayments,
    // },
    // {
    //   id: "8",
    //   title: "Historial Pedidos",
    //   screen: "OrdersRemoteScreen",
    //   icon: iconOrdersHist,
    // },
    // {
    //   id: "9",
    //   title: "Tareas",
    //   screen: "TasksScreen",
    //   icon: iconTasks,
    // },
    {
      id: "5",
      title: "Configuración",
      screen: "ConfigurationScreen",
      icon: iconConfiguration,
    },
    {
      id: "6",
      title: "Salir",
      action: "true",
      icon: iconClose,
      screen: "",
    },
  ];

  const [login, loginAction] = useContext(UserContext);
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    ensureAutoLogin();
    loadSellerConfig();
    // checkStatusAsync();
  }, [navigation]);

  // const checkStatusAsync = async () => {
  //   const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);

  //   if (!isRegistered) {
  //     console.log("SE REGISTRO");
  //     await registerBackgroundFetchAsync();
  //   } else {
  //     // console.log("SE DESREGISTRO");
  //     // await unregisterBackgroundFetchAsync();
  //   }
  // };

  const loadSellerConfig = async () => {
    try {
      const data = await Configuration.getConfig("PERMITE_COBRANZAS");
      let newData;
      if (data.length > 0) {
        if (data[0].value == 0) {
          newData = DATA.filter((item) => item.id !== PAYMENT_ID);
        } else {
          newData = DATA;
        }
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
      // Ignore and fall back to defaults
    }

    loginAction({ type: "sign", data: autoUser });
    await Configuration.setConfigValue("TOKEN", "");
  };

  const logOut = async () => {
    const response = await getUser();

    loginAction({ type: "sign-out", data: response });
    navigation.navigate("HomeScreen");
  };

  const exitApp = async () => {
    const response = await getUser();
    loginAction({ type: "sign-out", data: response });
    BackHandler.exitApp();
  };

  const Item = (props) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.TouchableItem}
        onPress={() => {
          if (props.action) {
            Alert.alert(
              "Salir",
              "¿Desea salir de la aplicación?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", onPress: () => exitApp() },
              ]
            );
            return;
          }
          navigation.navigate(props.screen);
        }}
      >
        <View style={styles.iconBadge}>
          <Image source={props.icon} style={styles.imageNoTint} />
        </View>
        <Text style={styles.title}>{props.title}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Item title={item.title} screen={item.screen} icon={item.icon} action={item.action} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={menuData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <BrandMark label="Alfa Depósitos" size={72} />
            <Text style={styles.subtitle}>Gestión ágil de depósitos y recepciones</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <Text style={styles.compilationName}>Nro comp.: 1.0.0</Text>
        <Text style={styles.mainLabelName}>
          VENDEDOR: {login?.user?.user ?? ""} - {login?.user?.name ?? ""}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
//   console.log("PASO POR AQUI");
//   if (error) {
//     // Error occurred - check `error.message` for more details.
//     return;
//   }
//   if (data) {
//     const { locations } = data;
//     console.log("locations", locations);
//     // do something with the locations captured in the background
//   }
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7F1F9",
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
  TouchableItem: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    fontSize: 18,
    marginLeft: 14,
    fontFamily: Fonts.display,
    color: Colors.DGREY,
  },
  imageNoTint: {
    width: 28,
    height: 28,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5FA",
    borderWidth: 1,
    borderColor: Colors.BORDER,
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
});
