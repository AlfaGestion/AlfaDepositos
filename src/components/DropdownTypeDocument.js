import Configuration from "@db/Configuration";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { getFontSize } from "../utils/Metrics";
import Colors from "@styles/Colors";

export default function DropdownTypeDocument({ value, setValue, darkMode = false }) {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);

    const fetchDocuments = async () => {
        const docs = [{ label: "Recepción", value: "RP" },]
        const permiteEFC = await Configuration.getConfigValue("PERMITE_EFC");
        const permiteFP = await Configuration.getConfigValue("PERMITE_FP");
        let cpteDefecto = await Configuration.getConfigValue("CPTE_DEFECTO");

        if (cpteDefecto == null || cpteDefecto == undefined || cpteDefecto == '') {
            cpteDefecto = "RP"
        }

        if (permiteEFC == "1" || permiteEFC == 1) {
            docs.push({ label: "e-Factura", value: "eFC" })
            docs.push({ label: "e-Nota de crédito", value: "eNC" })
            docs.push({ label: "e-Nota de débito", value: "eND" })
        }

        if (permiteFP == "1" || permiteFP == 1) {
            docs.push({ label: "Proforma", value: "FP" })
        }

        setValue(cpteDefecto)
        setItems(docs)
    }

    useEffect(() => {
        fetchDocuments()
    }, []);

    return (
        <>
            <Text style={{ fontSize: getFontSize(17), marginBottom: 10, display: "flex", fontWeight: "400", backgroundColor: darkMode ? "#243241" : Colors.PRIMARY, color: "white", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>COMPROBANTE</Text>

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
                setItems={setItems}
                textStyle={{ fontSize: getFontSize(18), color: darkMode ? "#E8F0F8" : "#1B1B1B" }}
                placeholder="Comprobante"
                style={[styles.selecPriceClass, darkMode && { backgroundColor: "#152332", borderColor: "#2D4154" }]}
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
        marginBottom: 25

        // fontSize: 50
        // width: "40%"

    },
});
