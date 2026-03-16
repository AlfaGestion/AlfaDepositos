import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";

import imgAccount from "@icons/clientes.png";
import { accountScreenStyles } from "@styles/AccountStyle";

import ItemLineTextValue from "@components/ItemLineTextValue";

import Account from "@db/Account";
import Configuration from "@db/Configuration";
import { MaterialIcons } from "@expo/vector-icons";

export default function AccountScreen({ navigation, route }) {

  const { id = null } = route?.params || {}


  const [accountInfo, setAccountInfo] = useState([]);
  const [canViewBalance, setCanViewBalance] = useState(false);

  const loadAccount = async (id) => {
    const data = await Account.find(parseInt(id));
    setAccountInfo(data);
  };

  const loadSellerConfig = async () => {
    const data = await Configuration.getConfig("PERMITE_VER_CTACTE");

    if (data.length > 0) {
      setCanViewBalance(data[0].value == "1");
    }
  };

  useEffect(() => {
    loadAccount(id);
    loadSellerConfig();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          {accountInfo.code != "" ? (
            <View>
              <View style={[accountScreenStyles.container]}>
                <View style={[accountScreenStyles.containerProfile]}>
                  <View style={[accountScreenStyles.profile]}>
                    <Image source={imgAccount}></Image>
                    <View>
                      <Text style={[accountScreenStyles.textName]}>{accountInfo.name}</Text>
                      <Text style={[accountScreenStyles.textCode]}>{accountInfo.code}</Text>
                    </View>
                  </View>

                  {canViewBalance && (
                    <View style={[accountScreenStyles.buttons]}>
                      <TouchableOpacity
                        style={[accountScreenStyles.btnCtaCte]}
                        onPress={() =>
                          navigation.navigate("AccountBalanceScreen", {
                            code: accountInfo.code,
                            name: accountInfo.name,
                          })
                        }
                      >
                        <MaterialIcons name="account-balance-wallet" size={24} color="white" />
                        <Text style={[accountScreenStyles.textBtn]}>Cuenta Corriente</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <ItemLineTextValue
                  text="Dirección"
                  value={accountInfo.address}
                  tabs="      "
                ></ItemLineTextValue>
                <ItemLineTextValue
                  text="Localidad"
                  value={accountInfo.location}
                  tabs="      "
                ></ItemLineTextValue>
                <ItemLineTextValue
                  text="Cuit"
                  value={accountInfo.cuit}
                  tabs="                 "
                ></ItemLineTextValue>
                <ItemLineTextValue
                  text="IVA"
                  value={accountInfo.iva}
                  tabs="                  "
                ></ItemLineTextValue>
                <ItemLineTextValue
                  text="Telefono"
                  value={accountInfo.phone}
                  tabs="        "
                ></ItemLineTextValue>
                <ItemLineTextValue
                  text="Email"
                  value={accountInfo.mail}
                  tabs="              "
                ></ItemLineTextValue>
              </View>
            </View>
          ) : (
            <ActivityIndicator style={[accountScreenStyles.loader]} size="large" color="#00ff00" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
