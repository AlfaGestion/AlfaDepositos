import { useCart } from '@hooks/useCart';
import { ActivityIndicator, Button, FlatList, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ItemResumeCart from '../../components/Cart/ItemResumeCart';
import Colors from '../../styles/Colors';
import { getFontSize } from '../../utils/Metrics';
import { useRoute } from '@react-navigation/native';

export default function ResumeCartScreen({ jumpTo, darkMode = false }) {
    const { cartItems, getTotal, getSubtotal, account, getDetalleIva, save, getTotalDiscount, status, isSaving, observation, setObservation, getTotalItems } = useCart();
    const route = useRoute();
    const isInventory = route?.params?.mode === "INVENTARIO";
    const insets = useSafeAreaInsets();

    const formatAmount = (value) => {
        const num = Number.parseFloat(value);
        if (!Number.isFinite(num)) return "0,00";
        return new Intl.NumberFormat("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };
    const formatQuantity = (value) => {
        const num = Number.parseFloat(value);
        if (!Number.isFinite(num)) return "0";
        if (Number.isInteger(num)) return String(num);
        return num.toFixed(3);
    };

    const handleSaveOrder = () => {
        Alert.alert(
            'Compartir comprobante',
            'Desea compartir el comprobante generado?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Compartir', onPress: async () => { await save(true, false); }, style: 'default' },
                { text: 'Solo generar', onPress: async () => { await save(false, false); } },
            ],
            { cancelable: false }
        );
    };

    if (!account) {
        return <View style={{ flex: 1, paddingHorizontal: 10, marginTop: 20, display: "flex", backgroundColor: darkMode ? "#0F1720" : "transparent" }}>
            <Text style={{
                fontSize: 15,
                marginBottom: 20,
                marginTop: 30,
                backgroundColor: darkMode ? "#5A3B14" : "orange",
                color: darkMode ? "#F8E7C2" : "#1B1B1B",
                textAlign: "center",
                padding: 10,
                borderRadius: 10,
            }}>
                Seleccione un proveedor para comenzar
            </Text>
            <Button style={{ marginTop: 10 }} onPress={() => jumpTo("proveedor")} title='Seleccionar proveedor' />
        </View>;
    }

    if (cartItems?.length == 0) {
        return <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: darkMode ? "#0F1720" : "transparent" }}>
            <Text style={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>Actualmente no tiene articulos en su carrito</Text>
        </View>;
    }

    return (
        <View style={{ position: "relative", flex: 1, backgroundColor: darkMode ? "#0F1720" : "transparent" }}>
            <FlatList
                style={{ backgroundColor: darkMode ? "#0F1720" : "white", paddingHorizontal: 6, width: "100%", flex: 1 }}
                contentContainerStyle={{ paddingBottom: 220 + (insets?.bottom || 0) }}
                scrollEnabled={true}
                data={cartItems}
                ListHeaderComponent={
                    <View style={{ paddingHorizontal: 6, paddingTop: 8, paddingBottom: 6 }}>
                        <Text style={{ fontSize: getFontSize(12), color: darkMode ? "#E8F0F8" : Colors.DGREY, marginBottom: 6, marginLeft: 4 }}>
                            Observacion
                        </Text>
                        <TextInput
                            value={observation}
                            onChangeText={setObservation}
                            placeholder="Escribi una observacion..."
                            placeholderTextColor={darkMode ? "#9CB2C8" : "#7A7A7A"}
                            multiline={true}
                            style={{
                                borderWidth: 1,
                                borderColor: darkMode ? "#2D4154" : Colors.GREY,
                                backgroundColor: darkMode ? "#152332" : Colors.WHITE,
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                minHeight: 56,
                                textAlignVertical: "top",
                                marginBottom: 10,
                                color: darkMode ? "#E8F0F8" : "#1B1B1B",
                            }}
                        />
                    </View>
                }
                keyExtractor={(item, idx) => item?._lineId ? String(item._lineId) : `${item.code}_${idx}`}
                renderItem={({ item }) => <ItemResumeCart item={item} darkMode={darkMode} />}
            />

            <View style={{ position: "absolute", width: "100%", minHeight: 100, backgroundColor: darkMode ? "#16212D" : "#F0F5FA", bottom: 0, zIndex: 99, paddingVertical: 8, paddingBottom: 8 + (insets?.bottom || 0) }}>
                <View style={{ width: "100%", paddingHorizontal: 12 }}>
                    {(status?.message && status?.error) && <Text style={{ color: "white", backgroundColor: status?.error ? Colors.RED : Colors.GREEN, width: "100%", textAlign: "center", padding: 5 }}>{status.message}</Text>}

                    {isInventory ? (
                        <>
                            <View style={{ width: "100%", justifyContent: "space-between", flexDirection: "row", borderBottomColor: darkMode ? "#2D4154" : "#D0D7E2", borderBottomWidth: 1, paddingVertical: 4 }}>
                                <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#9CB2C8" : Colors.MUTED }}>ARTICULOS CONTADOS</Text>
                                <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#E8F0F8" : Colors.DGREY }}>{cartItems?.length || 0}</Text>
                            </View>
                            <View style={{ width: "100%", justifyContent: "space-between", flexDirection: "row", paddingTop: 4 }}>
                                <Text style={{ fontSize: getFontSize(18), fontWeight: "bold", color: darkMode ? "#E8F0F8" : Colors.DGREY }}>CANTIDAD TOTAL</Text>
                                <Text style={{ fontSize: getFontSize(18), fontWeight: "bold", color: darkMode ? "#E8F0F8" : Colors.DGREY }}>{formatQuantity(getTotalItems())}</Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={{ width: "100%", justifyContent: "space-between", flexDirection: "row", borderBottomColor: darkMode ? "#2D4154" : "#D0D7E2", borderBottomWidth: 1, paddingVertical: 4 }}>
                                <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#9CB2C8" : Colors.MUTED }}>SUBTOTAL</Text>
                                <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#E8F0F8" : Colors.DGREY }}>${formatAmount(getSubtotal())}</Text>
                            </View>
                            <View style={{ width: "100%", justifyContent: "space-between", flexDirection: "row", borderBottomColor: darkMode ? "#2D4154" : "#D0D7E2", borderBottomWidth: 1, paddingVertical: 4 }}>
                                <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#9CB2C8" : Colors.MUTED }}>DESCUENTO</Text>
                                <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#E8F0F8" : Colors.DGREY }}>${formatAmount(getTotalDiscount())}</Text>
                            </View>
                            {getDetalleIva()?.map((item, idx) => (
                                <View key={`iva_${idx}`} style={{ width: "100%", justifyContent: "space-between", flexDirection: "row", borderBottomColor: darkMode ? "#2D4154" : "#D0D7E2", borderBottomWidth: 1, paddingVertical: 4 }}>
                                    <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#9CB2C8" : Colors.MUTED }}>IVA {item.iva}%</Text>
                                    <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#E8F0F8" : Colors.DGREY }}>${formatAmount(item.importe)}</Text>
                                </View>
                            ))}
                            <View style={{ width: "100%", justifyContent: "space-between", flexDirection: "row", paddingTop: 4 }}>
                                <Text style={{ fontSize: getFontSize(18), fontWeight: "bold", color: darkMode ? "#E8F0F8" : Colors.DGREY }}>TOTAL</Text>
                                <Text style={{ fontSize: getFontSize(18), fontWeight: "bold", color: darkMode ? "#E8F0F8" : Colors.DGREY }}>${formatAmount(getTotal())}</Text>
                            </View>
                        </>
                    )}
                </View>

                <TouchableOpacity disabled={isSaving} onPress={() => handleSaveOrder()} style={{ width: "100%", marginTop: 10, paddingHorizontal: 10 }}>
                    {isSaving ?
                        <View style={{ flexDirection: "row", width: "100%", backgroundColor: Colors.GREEN, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
                            <ActivityIndicator size="small" />
                            <Text style={{ textAlign: "center", fontSize: getFontSize(18), fontWeight: "600", color: "white", marginLeft: 5 }}>GENERANDO</Text>
                        </View>
                        :
                        <View style={{ width: "100%", backgroundColor: Colors.GREEN, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
                            <Text style={{ textAlign: "center", fontSize: getFontSize(18), fontWeight: "600", color: "white" }}>ACEPTAR</Text>
                        </View>
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
}
