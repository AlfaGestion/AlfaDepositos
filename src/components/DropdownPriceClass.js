import Configuration from "@db/Configuration";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { getFontSize } from "../utils/Metrics";
import Colors from "@styles/Colors";

export default function DropdownPriceClass({ priceClass, setPriceClass }) {
  const [items, setItems] = useState([
    { label: "Clase 1", value: 1 },
    { label: "Clase 2", value: 2 },
    { label: "Clase 3", value: 3 },
    { label: "Clase 4", value: 4 },
    { label: "Clase 5", value: 5 },
    { label: "Clase 6", value: 6 },
    { label: "Clase 7", value: 7 },
    { label: "Clase 8", value: 8 },
  ]);

  const [open, setOpen] = useState(false);
  const [canChangePriceClass, SetCanChangePriceClass] = useState(false);

  const getConfig = async () => {
    const changePriceClass = await Configuration.getConfigValue("MODIFICA_CLASE_PRECIO");
    SetCanChangePriceClass(true);
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <>
      {/* <Text style={{ fontSize: getFontSize(18), marginBottom: 10, display: "flex", fontWeight: "500" }}>CLASE DE PRECIO</Text> */}
      <Text style={{ fontSize: getFontSize(17), marginBottom: 10, display: "flex", fontWeight: "400", backgroundColor: Colors.PRIMARY, color: "white", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>CLASE DE PRECIO</Text>

      <DropDownPicker
        open={open}
        value={priceClass}
        items={items}
        setOpen={setOpen}
        setValue={(cb) => {
          const newValue = cb(priceClass)
          setPriceClass(newValue)
        }}
        // setValue={setPriceClass}
        setItems={setItems}
        placeholder="Clase de precio"
        disabled={!canChangePriceClass}
        style={styles.selecPriceClass}
        listMode="SCROLLVIEW"
        textStyle={{ fontSize: getFontSize(18) }}

        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        // style={{ marginBottom: 20 }}
        dropDownContainerStyle={{
          position: 'relative',
          top: 0
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  selecPriceClass: {
    marginBottom: 10,
    borderColor: Colors.GREY,
    marginBottom: 25
    // position: 'relative',
    // backgroundColor: 'red',
    // zIndex: '999999999 !important'
  },
});
