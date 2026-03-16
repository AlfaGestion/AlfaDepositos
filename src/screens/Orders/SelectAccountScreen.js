import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCart } from '../../hooks/useCart';
import Account from "@db/Account";
import AccountListSearch from "../../components/AccountListSearch";
import { getFontSize } from '../../utils/Metrics';
import Colors from '../../styles/Colors';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export default function SelectAccountScreen({ jumpTo, route, darkMode = false }) {
    const { account, deleteOrder, addAccount, isLoading, isEditorder, removeAccount, documentData, resetEditState, observation, setObservation } = useCart();
    const navigation = useNavigation()
    const router = useRoute();
    const modeFromParams = router.params?.mode;
    const [isLoadingAccount, setIsLoadingAccount] = useState(false)
    const isInventory = modeFromParams === "INVENTARIO";
    const defaultInventoryAccount = {
        code: 2111010289,
        name: 'Depósito general',
        priceClass: 1,
        lista: 1
    };

    // Variable para verificar si el botón debe estar habilitado
    const canContinue = !!account?.code;

    const handleSelAccount = (code, name, priceClass, lista) => {
        setIsLoadingAccount(true);

        addAccount({
            code,
            name,
            priceClass,
            lista,
        });

        setIsLoadingAccount(false);

        jumpTo('articulos');
    };

    const removeOrderFromDB = async () => {
        await deleteOrder()
        navigation.goBack()
    }

    const handleDeleteOrder = () => {
        return Alert.alert("Â¿Eliminar?", "Â¿EstÃ¡ seguro que desea eliminar el comprobante? No podrÃ¡ recuperarlo.", [
            {
                text: "Si",
                onPress: () => {
                    removeOrderFromDB();
                },
            },
            {
                text: "No",
            },
        ]);
    };

    useEffect(() => {
        if (!router.params?.id) {
            resetEditState();
        }
    }, [router.params?.id]);

    useEffect(() => {
        if (isInventory && !account) {
            addAccount(defaultInventoryAccount);
            jumpTo('articulos');
        }
    }, [isInventory, account, addAccount, jumpTo]);

    if (!account) {
        return (
            <View style={{ marginTop: 10, backgroundColor: darkMode ? "#0F1720" : "transparent", minHeight: "100%" }}>
                <AccountListSearch handleSelAccount={handleSelAccount} mode={modeFromParams} darkMode={darkMode} />
            </View>
        )
    }

    if (isLoading) {
        return <View style={{ backgroundColor: darkMode ? "#0F1720" : "transparent", flex: 1 }}>
            <ActivityIndicator size="large" color={darkMode ? "#8FC3FF" : Colors.DBLUE} />
        </View>
    }

    if (isLoadingAccount) {
        return <View style={{ backgroundColor: darkMode ? "#0F1720" : "transparent", flex: 1 }}>
            <ActivityIndicator size="large" color={Colors.GREEN} style={{ marginTop: 20 }} />
        </View>
    }

    return (
        <View style={{ backgroundColor: darkMode ? "#0F1720" : "transparent", flex: 1 }}>
            {isEditorder &&
                <TouchableOpacity onPress={() => handleDeleteOrder()} style={{ width: "100%", padding: 10, backgroundColor: Colors.RED, marginVertical: 10 }}>
                    <Text style={{ textAlign: "center", fontSize: getFontSize(17), color: "#FFFFFF", fontWeight: "700" }}>ELIMINAR COMPROBANTE</Text>
                </TouchableOpacity>
            }

            {!isInventory && (
                <>
                    <TouchableOpacity
                        onPress={() => removeAccount()}
                        style={{
                            width: "100%",
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            backgroundColor: darkMode ? "#152332" : Colors.SURFACE,
                            marginVertical: 10,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: darkMode ? "#2D4154" : Colors.BORDER,
                            shadowColor: darkMode ? "#000000" : Colors.GREY,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: darkMode ? 0.3 : 0.2,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                    >
                        <Text style={{ textAlign: "center", fontSize: getFontSize(16), color: darkMode ? "#E8F0F8" : Colors.DGREY, fontWeight: "600", letterSpacing: 0.5 }}>
                            CAMBIAR PROVEEDOR
                        </Text>
                    </TouchableOpacity>

                    <View style={{ backgroundColor: darkMode ? "#152332" : "white", width: "100%", padding: 10 }}>
                        <Text style={{ textAlign: "center", fontSize: getFontSize(20), color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{account?.code}</Text>
                        <Text style={{ textAlign: "center", fontSize: getFontSize(18), color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{account?.name}</Text>
                    </View>
                </>
            )}

            {isInventory && (
                <View style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6 }}>
                    <Text style={{ color: darkMode ? "#BFD0E0" : "#6b7280", fontSize: 13 }}>Cargando informacion de inventario</Text>
                </View>
            )}


            <View style={{ zIndex: 99, paddingHorizontal: 10, marginTop: 10 }}>
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
                <TouchableOpacity
                    onPress={() => jumpTo("articulos")}
                    disabled={!canContinue}
                    style={{
                        backgroundColor: canContinue ? (darkMode ? "#244A72" : "#0872ae") : (darkMode ? "#30465A" : "#bdc3c7"),
                        marginTop: 20,
                        paddingVertical: 10,
                        borderRadius: 10,
                        opacity: canContinue ? 1 : 0.8
                    }}
                >
                    <Text style={{
                        textAlign: "center",
                        color: canContinue ? "white" : (darkMode ? "#9CB2C8" : "#7f8c8d"),
                        fontWeight: "600",
                        fontSize: getFontSize(18)
                    }}>
                        IR A CARGA DE ARTÍCULOS {`>`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View >
    )
}



