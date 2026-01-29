import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";

import { ConfigStyles } from "@styles/ConfigurationStyle";

import ConfigItem from "@components/ConfigItem";

import Configuration from "@db/Configuration";
import { restartTables } from "../services/db";
import iconSave from "@icons/ok.png";
import iconSync from "@icons/sync.png";

export default function ConfigurationScreen({ navigation, route }) {

  const { firstIn = null } = route?.params || {}

  const [config, setConfig] = useState({
    API_URI: "http://alfanetac.ddns.net:7705/api/v2/",
    //API_URI: 'http://192.168.1.36:5000/api/v2/',
    API_KEY: "",
    ALFA_ACCOUNT: "112010001",
    //ALFA_DATABASE_ID: "156",
    ALFA_DATABASE_ID: "3239",
    USERNAME_SYNC: "Administrador",
    PASSWORD_SYNC: "1",
    MODIFICA_CLASE_PRECIO: false,
    SOLO_CLIENTES_VENDEDOR: false,
    STOCK_ONLINE_CONSULTAS: false,
    STOCK_COMPROMETIDO_REAL: false,
    MOSTRAR_TOTALES_PEDIDOS: false,
    PERMITE_EFC: false,
    PERMITE_FP: false,
    TOP_CONSULTA_ARTICULOS: "0",
    DESCUENTO_POR_ARTICULO: "0",
    PERMITE_COBRANZAS: "0",
    PERMITE_VER_CTACTE: "0",
    TOKEN: "",
    PRINT_SUNMI: false,
    CARGA_IMAGENES: false,
    NO_PERMITE_ITEMS_DUPLICADOS_CPTE: false
  });

  const [saving, setSaving] = useState(false);
  const [showText, setShowText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadConfiguration = async () => {
    await Configuration.createTable();

    const data = await Configuration.query();

    let value;
    const configUpdate = {};
    data.forEach((item) => {
      if (item.key == 'PRINT_SUNMI' || item.key == 'CARGA_IMAGENES' || item.key == 'NO_PERMITE_ITEMS_DUPLICADOS_CPTE') {
        value = item.value == '0' ? false : true
      } else {
        value = item.value
      }
      configUpdate[item.key] = value;
    });

    setConfig({
      ...config,
      ...configUpdate,
    });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await Configuration.createTable();
      for (let item in config) {
        let value = config[item];
        if (typeof value === "boolean") {
          value = value ? 1 : 0;
        }
        if (value === null || value === undefined) {
          value = "";
        }
        if (item == "API_URI" && typeof value === "string") {
          value = value.toLowerCase();
        }
        await Configuration.setConfigValue(item, value);
      }
      setShowText("Grabado correctamente");
    } catch (e) {
      setShowText(e?.message || "Error al grabar configuraciÃ³n.");
    } finally {
      setSaving(false);
    }

    if (firstIn) {
      if (
        config.ALFA_ACCOUNT != "" &&
        config.API_URI != "" &&
        config.PASSWORD_SYNC != "" &&
        config.USERNAME_SYNC != "" &&
        config.ALFA_DATABASE_ID != ""
      ) {
        navigation.navigate("SyncScreen", { firstIn: true });
      } else {
        setShowText("Debe configurar la API URL, el codigo de cuenta de Alfanet, el usuario y la contraseña");
      }
    } else {
      navigation.navigate("HomeScreen");
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const handleChange = (name, value) => {
    let newConfig = {};
    for (let item in config) {
      if (item == name) {
        newConfig[name] = value;
      } else {
        newConfig[item] = config[item];
      }
    }

    setConfig(newConfig);
  };

  const handleDeleteTables = async () => {
    setDeleting(true);
    try {
      await restartTables();
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudieron reiniciar las tablas.");
    } finally {
      setDeleting(false);
    }
  };

  const showAlert = () =>
    Alert.alert(
      "ATENCIÓN",
      "Este proceso eliminará todos los datos cargados. Incluyendo pedidos y maestros. Se recomienda sincronizar antes de realizarlo, ya que la información no se podrá recuperar.",
      [
        {
          text: "Cancelar",
          style: "destructive",
        },
        {
          text: "Reiniciar",
          onPress: () => handleDeleteTables(),
          style: "default",
        },
      ]
    );

  return (
    <SafeAreaView style={[ConfigStyles.mainContainer]}>
      <View style={[ConfigStyles.container]}>
        <ScrollView>
          <View>
            <ConfigItem
              type="input"
              title="Ruta Web Service (*)"
              placeholder="API URL"
              field="API_URI"
              value={config.API_URI}
              handleChange={handleChange}
            ></ConfigItem>

            <ConfigItem
              type="input"
              title="Codigo Cuenta AlfaNet (*)"
              field="ALFA_ACCOUNT"
              placeholder="Ej. 112010001"
              value={config.ALFA_ACCOUNT}
              handleChange={handleChange}
            ></ConfigItem>

            {/* TODO Hacer opcion de stock en consulta  */}
            {/* <ConfigItem
              type="checkbox"
              title="Stock online en consulta de articulos"
              field="STOCK_ONLINE_CONSULTAS"
              value={config.STOCK_ONLINE_CONSULTAS == 1}
              handleChange={handleChange}
            ></ConfigItem> */}

            {/* TODO Hacer opcion de stock comprometido + real */}
            {/* <ConfigItem type="checkbox" title="Stock comprometido + real" field="STOCK_COMPROMETIDO_REAL" value={config.STOCK_COMPROMETIDO_REAL == 1} handleChange={handleChange}></ConfigItem> */}

            {/* TODO Ver si esta opción es practica */}
            {/* <ConfigItem
              type="input"
              title="Articulos por consulta"
              field="TOP_CONSULTA_ARTICULOS"
              placeholder="20"
              keyboardType="numeric"
              value={"" + config.TOP_CONSULTA_ARTICULOS}
              handleChange={handleChange}
            ></ConfigItem> */}

            <ConfigItem
              type="input"
              title="Usuario Sync (*)"
              field="USERNAME_SYNC"
              placeholder="..."
              value={"" + config.USERNAME_SYNC}
              handleChange={handleChange}
            ></ConfigItem>

            <ConfigItem
              type="input"
              title="Password Sync (*)"
              field="PASSWORD_SYNC"
              placeholder="..."
              value={"" + config.PASSWORD_SYNC}
              handleChange={handleChange}
            ></ConfigItem>

            <ConfigItem
              type="input"
              title="ID Database (*)"
              field="ALFA_DATABASE_ID"
              placeholder="..."
              value={"" + config.ALFA_DATABASE_ID}
              handleChange={handleChange}
            ></ConfigItem>

            <ConfigItem
              type='checkbox'
              title='Imprimir comprobante (SunmiV2)'
              field='PRINT_SUNMI'
              value={config.PRINT_SUNMI}
              handleChange={handleChange}

            />

            <ConfigItem
              type='checkbox'
              title='Utiliza imagenes web'
              field='CARGA_IMAGENES'
              value={config.CARGA_IMAGENES}
              handleChange={handleChange}

            />

            <ConfigItem
              type='checkbox'
              title='Valida item único en comprobantes'
              field='NO_PERMITE_ITEMS_DUPLICADOS_CPTE'
              value={config.NO_PERMITE_ITEMS_DUPLICADOS_CPTE}
              handleChange={handleChange}
            />


            {!firstIn && (
              <TouchableOpacity style={[ConfigStyles.buttonRestartTables]} onPress={() => showAlert()}>
                <Image source={iconSync} style={ConfigStyles.buttonIcon} />
                <Text style={[ConfigStyles.buttonRestartTablesText]}>Reiniciar tablas</Text>
              </TouchableOpacity>
            )}

            {deleting && (
              <Text style={[ConfigStyles.textDeletingTables]}>Reiniciando tablas... Aguarde.</Text>
            )}

            <TouchableOpacity
              disabled={deleting}
              style={[ConfigStyles.buttonSave]}
              onPress={() => handleSave()}
            >
              <Image source={iconSave} style={ConfigStyles.buttonIcon} />
              <Text style={[ConfigStyles.buttonSaveText]}>Grabar</Text>
            </TouchableOpacity>
            {saving ? (
              <ActivityIndicator style={[ConfigStyles.loader]} size="large" color="#00ff00" />
            ) : showText ? (
              <Text style={[ConfigStyles.messageStatus]}>{showText}</Text>
            ) : (
              <View></View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
