import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View, ScrollView } from "react-native";

import SyncItem from "@components/SyncItem";

import Category from "@db/Category";
import Configuration from "@db/Configuration";
import Account from "@db/Account";
import Family from "@db/Family";
import { bulkInsert } from "@db/Functions";
import Order from "@db/Order";
import OrderDetail from "@db/OrderDetail";
import Product from "@db/Product";
import { getDataFromAPI } from "@libraries/api";

import iconSync from "@icons/sincronizar.png";
import iconSyncDark from "@icons/sincronizar_b.png";
import { syncStyle } from "@styles/SyncStyle";

import { UserContext } from "@context/UserContext";
import { useThemeConfig } from "@context/ThemeContext";
import ProductLista from "../../libraries/db/ProductLista";

export default function SyncScreen({ navigation, route }) {
  const { firstIn = null } = route?.params || {};

  const [login] = useContext(UserContext);

  const [errorSync, setErrorSync] = useState("");
  const [showButtonSync, setShowButtonSync] = useState(true);
  const [final, setFinal] = useState(false);
  const { darkMode } = useThemeConfig();

  const [showLoaderConfig, setShowLoaderConfig] = useState(true);
  const [showLoaderRubro, setShowLoaderRubro] = useState(true);
  const [showLoaderFamilia, setShowLoaderFamilia] = useState(true);
  const [showLoaderVendedor, setShowLoaderVendedor] = useState(true);
  const [showLoaderPayments, setShowLoaderPayments] = useState(true);
  const [showLoaderServices, setShowLoaderServices] = useState(true);

  const [showLoaderDatosVisita, setShowLoaderDatosVisita] = useState(true);
  const [showLoaderClientes, setShowLoaderClientes] = useState(true);
  const [showLoaderArticulos, setShowLoaderArticulos] = useState(true);
  const [showLoaderArticulosListas, setShowLoaderArticulosListas] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const REQUEST_TIMEOUT_MS = 60000;

  const fetchWithTimeout = async (endpoint, message) => {
    setStatusMessage(message);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout en ${endpoint}`)), REQUEST_TIMEOUT_MS)
    );
    return Promise.race([getDataFromAPI(endpoint), timeout]);
  };

  const createTables = async () => {
    await Category.createTable();
    await Account.createTable();
    await Family.createTable();
    await Order.createTable();
    await OrderDetail.createTable();
    await Product.createTable();
    await ProductLista.createTable();
    await Product.ensureBarcodeColumns();
    await ProductLista.ensureBarcodeColumns();
    await Product.ensureIndexes();
  };

  async function syncData() {
    setShowButtonSync(false);

    try {
      await Configuration.createTable();
      await Configuration.setConfigValue("SYNC_IN_PROGRESS", 1);
      await createTables();

      setShowLoaderVendedor(false);
      setShowLoaderPayments(false);
      setShowLoaderServices(false);
      setShowLoaderDatosVisita(false);
      setShowLoaderArticulosListas(false);

      let props = {};
      let objectArray = [];
      let data;

      data = await fetchWithTimeout(`seller/config/${login.user.user ?? "1"}`, "Sincronizando configuracion...");

      if (!data.error) {
        const protectedKeys = new Set([
          "API_URI",
          "ALFA_ACCOUNT",
          "PASSWORD_SYNC",
          "USERNAME_SYNC",
          "ALFA_DATABASE_ID",
        ]);
        for (const item of data.data) {
          const itemKey = String(item.key ?? "").trim();
          const itemKeyUpper = itemKey.toUpperCase();
          if (protectedKeys.has(item.key)) {
            const currentValue = await Configuration.getConfigValue(item.key);
            if (currentValue !== null && currentValue !== undefined && currentValue !== "") {
              continue;
            }
          }
          await Configuration.setConfigValue(item.key, item.value);
          if (itemKeyUpper === "TIPOEAN") {
            await Configuration.setConfigValue("CodPesable", item.value);
            await Configuration.setConfigValue("CfgCodPesable", item.value);
            console.log("[SYNC][config] TipoEan:", item.value);
          }
          if (itemKeyUpper === "DECIMALESEAN") {
            await Configuration.setConfigValue("DecimalesEan", item.value);
            await Configuration.setConfigValue("cfgDecimalesEan", item.value);
            console.log("[SYNC][config] DecimalesEan:", item.value);
          }
        }
        updateStatus("configuration");
      } else {
        setErrorSync(data.message);
        return;
      }

      await Family.destroyAll();
      await Category.destroyAll();

      data = await fetchWithTimeout("category", "Sincronizando rubros...");
      if (!data.error) {
        data.data.forEach((item) => {
          objectArray.push({
            code: item.codigo,
            name: item.descripcion,
          });
        });
        await bulkInsert("categories", objectArray);
        updateStatus("rubros");
      } else {
        setErrorSync(data.message);
        return;
      }

      objectArray = [];
      data = await fetchWithTimeout("family", "Sincronizando familias...");
      if (!data.error) {
        data.data.forEach((item) => {
          objectArray.push({
            code: item.codigo,
            name: item.descripcion,
          });
        });
        await bulkInsert("families", objectArray);
        updateStatus("familias");
      } else {
        setErrorSync(data.message);
        return;
      }

      await Account.destroyAll();
      let pages = 50;
      for (let page = 1; page <= pages; page++) {
        data = await fetchWithTimeout(`account/paginate/${page}`, `Sincronizando proveedores (pagina ${page})...`);
        objectArray = [];
        if (!data.error) {
          if (Object.keys(data.data).length === 0) {
            updateStatus("proveedores");
            break;
          }
          data.data.forEach((item) => {
            props = {
              code: item.codigo,
              optional_code: item.codigo_opcional,
              name: item.razon_social,
              address: item.calle,
              location: item.localidad,
              cuit: item.cuit,
              iva: item.iva,
              price_class: item.clase,
              discount_perc: item.dto,
              tc_default: item.cpte_default,
              id_seller: item.idvendedor,
              phone: item.telefono,
              mail: item.email,
              lista: item.lista,
            };
            objectArray.push(props);
          });
          await bulkInsert("accounts", objectArray);
        } else {
          setErrorSync(data.message);
          return;
        }
      }
      updateStatus("proveedores");

      await Product.destroyAll();
      pages = 150;
      for (let page = 1; page <= pages; page++) {
        data = await fetchWithTimeout(`product/paginate/${page}`, `Sincronizando articulos (pagina ${page})...`);
        objectArray = [];
        if (!data.error) {
          if (Object.keys(data.data).length === 0) {
            updateStatus("articulos");
            break;
          }
          data.data.forEach((item) => {
            props = {
              code: item.idarticulo,
              codigoBarras: item?.codigobarras ?? item?.CODIGOBARRAS ?? item?.CodigoBarras ?? "",
              codigoBarra1: item?.codigobarra1 ?? item?.CODIGOBARRA1 ?? item?.CodigoBarra1 ?? "",
              codigoBarra2: item?.codigobarra2 ?? item?.CODIGOBARRA2 ?? item?.CodigoBarra2 ?? "",
              codigoBarra3: item?.codigobarra3 ?? item?.CODIGOBARRA3 ?? item?.CodigoBarra3 ?? "",
              codigoBarra4: item?.codigobarra4 ?? item?.CODIGOBARRA4 ?? item?.CodigoBarra4 ?? "",
              codigoBarraDun: item?.codigobarradun ?? item?.CODIGOBARRADUN ?? item?.CodigoBarraDun ?? "",
              name: item.descripcion,
              category: item.idrubro,
              family: item.idfamilia,
              internal_taxes: item.imp_internos,
              iva: item.iva,
              exempt: item.exento,
              price1: item.precio1,
              price2: item.precio2,
              price3: item.precio3,
              price4: item.precio4,
              price5: item.precio5,
              price6: item.precio6,
              price7: item.precio7,
              price8: item.precio8,
              price9: item.precio9,
              price10: item.precio10,
              cant_propuesta: item?.cantidadpropuesta,
            };
            objectArray.push(props);
          });
          await bulkInsert("products", objectArray);
        } else {
          setErrorSync(data.message);
          return;
        }
      }
      updateStatus("articulos");

      if (!errorSync) {
        setFinal(true);
      }
    } catch (e) {
      setErrorSync(e?.message || "Error en la sincronizacion.");
    } finally {
      try {
        await Configuration.setConfigValue("SYNC_IN_PROGRESS", 0);
      } catch (e) {
        // ignore
      }
    }
  }

  function updateStatus(tbl) {
    if (tbl == "rubros") {
      setShowLoaderRubro(false);
    } else if (tbl == "familias") {
      setShowLoaderFamilia(false);
    } else if (tbl == "vendedores") {
      setShowLoaderVendedor(false);
    } else if (tbl == "articulos") {
      setShowLoaderArticulos(false);
    } else if (tbl == "proveedores") {
      setShowLoaderClientes(false);
    } else if (tbl == "visitas") {
      setShowLoaderDatosVisita(false);
    } else if (tbl == "mediosPago") {
      setShowLoaderPayments(false);
    } else if (tbl == "servicios") {
      setShowLoaderServices(false);
    } else if (tbl == "configuration") {
      setShowLoaderConfig(false);
    } else if (tbl == "articulos_listas") {
      setShowLoaderArticulosListas(false);
    }
  }

  const configVerify = async () => {
    const data = await Configuration.getConfigAPI();
    const API_URI = data.find((item) => item.key == "API_URI");

    if (API_URI === undefined) {
      Alert.alert("Configurar", "Debe configurar los datos de la API para continuar.", [
        {
          text: "Cancelar",
          onPress: () => {
            navigation.goBack(null);
          },
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("ConfigurationScreen");
          },
        },
      ]);
    }
  };

  useEffect(() => {
    configVerify();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: darkMode ? "#16212D" : "#DDEAF8" },
      headerTintColor: darkMode ? "#E8F0F8" : "#1A395A",
      headerTitleStyle: { color: darkMode ? "#E8F0F8" : "#1A395A", fontWeight: "700" },
    });
  }, [navigation, darkMode]);

  return (
    <View style={[syncStyle.container, { flex: 1 }, darkMode && { backgroundColor: "#0F1720" }]}>
      <Text style={[syncStyle.text, darkMode && { color: "#E8F0F8" }]}>
        El proceso de sincronizacion descargara rubros, familias, proveedores y articulos. Este proceso puede demorar varios
        minutos, dependiendo de la cantidad de registros y su conexion a internet.
      </Text>

      {showButtonSync ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            syncStyle.cardButton,
            darkMode && { backgroundColor: "#152332", borderColor: "#2D4154" },
          ]}
          onPress={syncData}
        >
          <View style={[syncStyle.cardIconWrap, darkMode && { backgroundColor: "#243241", borderColor: "#2D4154" }]}>
            <Image style={syncStyle.cardIcon} source={darkMode ? iconSyncDark : iconSync} />
          </View>
          <Text style={[syncStyle.cardText, darkMode && { color: "#E8F0F8" }]}>Sincronizar</Text>
        </TouchableOpacity>
      ) : errorSync ? (
        <Text style={[syncStyle.errorMessage, darkMode && { color: "#FF8A80" }]}>{errorSync}</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {statusMessage ? <Text style={[syncStyle.text, darkMode && { color: "#E8F0F8" }]}>{statusMessage}</Text> : <Text />}
          <SyncItem showLoader={showLoaderConfig} text="Configuracion" darkMode={darkMode} />
          <SyncItem showLoader={showLoaderRubro} text="Rubros" darkMode={darkMode} />
          <SyncItem showLoader={showLoaderFamilia} text="Familias" darkMode={darkMode} />
          <SyncItem showLoader={showLoaderClientes} text="Proveedores" darkMode={darkMode} />
          <SyncItem showLoader={showLoaderArticulos} text="Articulos" darkMode={darkMode} />
        </ScrollView>
      )}

      {final ? (
        <View style={[syncStyle.finalText]}>
          <Text style={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>Sincronizacion finalizada</Text>
          <TouchableOpacity
            style={[syncStyle.btnReturn, darkMode && { backgroundColor: "#1F8B4C" }]}
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <Text style={[syncStyle.textBtnReturn]}>Regresar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text />
      )}
    </View>
  );
}
