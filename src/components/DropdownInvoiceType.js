import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { getFontSize } from "../utils/Metrics";
import Colors from "@styles/Colors";

export default function DropdownInvoiceType({ value, setValue }) {
    const [items, setItems] = useState([
        { label: "Factura", value: "fc" },
        { label: "Proforma", value: "fp" },
        { label: "", value: "" },
    ]);

    const [open, setOpen] = useState(false);


    useEffect(() => {

    }, []);

    return (
        <>
            {/* <Text style={{ fontSize: getFontSize(18), marginBottom: 10, display: "flex", fontWeight: "500" }}>APLICAR A</Text> */}
            <Text style={{ fontSize: getFontSize(17), marginBottom: 10, display: "flex", fontWeight: "400", backgroundColor: Colors.PRIMARY, color: "white", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>APLICAR A</Text>

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
                textStyle={{ fontSize: getFontSize(18) }}
                setItems={setItems}
                placeholder="Comprobante"
                style={styles.selecPriceClass}
                dropDownDirection="BOTTOM"
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
