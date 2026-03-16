import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { getFontSize } from "../utils/Metrics";
import Colors from "@styles/Colors";

export default function DropdownSaleCondition({ value, setValue, darkMode = false }) {
    const [items, setItems] = useState([
        { label: "Contado", value: "contado" },
        { label: "Cuenta Corriente", value: "ctacte" },
        { label: "", value: "" },
    ]);

    const [open, setOpen] = useState(false);


    useEffect(() => {

    }, []);

    return (
        <>
            {/* <Text style={{ fontSize: getFontSize(18), marginBottom: 10, display: "flex", fontWeight: "500" }}>COND. DE VENTA</Text> */}
            <Text style={{ fontSize: getFontSize(17), marginBottom: 10, display: "flex", fontWeight: "400", backgroundColor: darkMode ? "#243241" : Colors.PRIMARY, color: "white", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>COND. DE VENTA</Text>

            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                // setValue={setValue}
                setValue={(cb) => {
                    const newValue = cb(value)
                    setValue(newValue)
                }}
                textStyle={{ fontSize: getFontSize(18), color: darkMode ? "#E8F0F8" : "#1B1B1B" }}

                setItems={setItems}
                placeholder="Cond. Venta"
                style={[styles.selecPriceClass, darkMode && { backgroundColor: "#152332", borderColor: "#2D4154" }]}
                dropDownDirection="BOTTOM"
                placeholderStyle={{ color: darkMode ? "#9CB2C8" : "#6D6D6D" }}
                dropDownContainerStyle={{ backgroundColor: darkMode ? "#152332" : "#FFFFFF", borderColor: darkMode ? "#2D4154" : Colors.GREY }}
                listItemLabelStyle={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}
                selectedItemLabelStyle={{ color: darkMode ? "#FFFFFF" : Colors.DBLUE, fontWeight: "600" }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    selecPriceClass: {
        marginBottom: 10,
        borderColor: Colors.GREY,
        // width: "40%"
    },
});
