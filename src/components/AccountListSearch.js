import { useContext, useEffect, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";

import { newOrderStyles } from "@styles/OrderStyle";

import AccountSearch from "@components/AccountSearch";
import { UserContext } from "@context/UserContext";
import Account from "@db/Account";

export default function AccountListSearch({ handleSelAccount, mode }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [login, loginAction] = useContext(UserContext);

  useEffect(() => {
    loadAccounts();
  }, [login?.user?.user, mode]);

  const loadAccounts = async (text = "") => {
    setLoading(true);
    try {
      await Account.createTable();
      const seller = login?.user?.user ?? "";
      const data = await Account.getAll(seller, text || "");

      if (mode == "COMPRAS") {
        setAccounts(Array.isArray(data) ? data : []);
      } else if (mode == "INVENTARIO") {
        setAccounts(
          [{
            code: '2111010289',
            name: 'Depósito general',
            price_class: 1,
            lista: 1
          }]);
      }
    } catch (e) {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <Text style={[newOrderStyles.title]}>Seleccione un proveedor</Text>
      <TextInput
        autoFocus={true}
        style={[newOrderStyles.inputSearchAccount]}
        onChangeText={(text) => loadAccounts(text)}
        placeholder="Buscar un proveedor"
      ></TextInput>

      <View style={[newOrderStyles.viewSearch]}>
        <FlatList
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{ height: 200 }}
          scrollEnabled={true}
          data={accounts}
          keyExtractor={(item) => item.id + ""}
          renderItem={({ item }) => {
            // console.log(item)
            return (
              <AccountSearch
                name={item.name}
                code={item.code}
                priceClass={item.price_class}
                lista={item.lista}
                functionCall={handleSelAccount}
              ></AccountSearch>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
