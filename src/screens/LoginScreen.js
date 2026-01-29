import { UserContext } from "@context/UserContext";
import Configuration from "@db/Configuration";
import { existsDB } from "@db/Functions";
import Seller from "@db/Seller";
import { getUser } from "@storage/UserAsyncStorage";
import { useContext, useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View, Modal, StyleSheet, Pressable } from "react-native";

import { loginStyles } from "@styles/Styles";

import BrandMark from "@components/BrandMark";

import Colors from "@styles/Colors";

export default function LoginScreen({ navigation }) {
  const [login, loginAction] = useContext(UserContext);

  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession();
  }, [navigation]);

  async function getAutoUser() {
    try {
      const sellers = await Seller.query({ limit: 1, page: 1 });
      if (sellers && sellers.length > 0) {
        const seller = sellers[0];
        return {
          user: seller.code,
          password: seller.password || "",
          name: seller.name || "",
        };
      }
    } catch (e) {
      // Ignore and fall back to defaults
    }
    return {
      user: "1",
      password: "",
      name: "Vendedor",
    };
  }

  async function fetchSession() {
    //Primero verifico que exista la base de datos.
    let exists = false;
    try {
      exists = await existsDB();
    } catch (e) {
      exists = false;
    }

    if (!exists) {
      navigation.navigate("ConfigurationScreen", { firstIn: true });
      return;
    }
    const response = await getUser();

    if (response == null) {
      const autoUser = await getAutoUser();
      loginAction({ type: "sign", data: autoUser });
      await Configuration.setConfigValue("TOKEN", "");
      navigation.navigate("HomeScreen");
      return;
    }

    loginAction({ type: "sign-in", data: response });
    navigation.navigate("HomeScreen");
  }

  async function sessionInit() {
    const login = await Seller.logIn(userLogin, password);

    if (login.length == 0) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    loginAction({
      type: "sign",
      data: {
        user: userLogin,
        password,
        name: login[0].name,
      },
    });

    await Configuration.setConfigValue("TOKEN", "");

    navigation.navigate("HomeScreen");
  }

  return (
    <>
      <View style={[loginStyles.container]}>
        <BrandMark />
        <Text style={[loginStyles.title]}>Ingresar</Text>

        {error ? <Text style={[loginStyles.textError]}>{error}</Text> : <Text></Text>}

        <TextInput
          style={[loginStyles.inputs]}
          placeholder="Usuario"
          value={userLogin}
          keyboardType="number-pad"
          onChangeText={(user) => setUserLogin(user)}
          placeholderTextColor={Colors.GREY}
        />
        <TextInput
          style={[loginStyles.inputs]}
          placeholder="Password"
          value={password}
          onChangeText={(pass) => setPassword(pass)}
          keyboardType="number-pad"
          secureTextEntry={true}
          placeholderTextColor={Colors.GREY}
        />

        <TouchableOpacity
          style={[loginStyles.button]}
          onPress={() => {
            sessionInit();
          }}
        >
          <Text style={[loginStyles.textButton]}>Iniciar sesión</Text>
        </TouchableOpacity>

        <Text style={[loginStyles.footerText]}>Powered by Alfa Net</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 0,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    // fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
  },
});
