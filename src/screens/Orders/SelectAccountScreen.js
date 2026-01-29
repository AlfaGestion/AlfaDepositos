import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCart } from '../../hooks/useCart';
import Account from "@db/Account";
import AccountListSearch from "../../components/AccountListSearch";
import { getFontSize } from '../../utils/Metrics';
import Colors from '../../styles/Colors';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export default function SelectAccountScreen({ jumpTo, route }) {
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
            <View style={{ marginTop: 10 }}>
                <AccountListSearch handleSelAccount={handleSelAccount} mode={modeFromParams} />
            </View>
        )
    }

    if (isLoading) {
        return <View>
            <ActivityIndicator size="large" />
        </View>
    }

    if (isLoadingAccount) {
        return <View>
            <ActivityIndicator size="large" color={Colors.GREEN} style={{ marginTop: 20 }} />
        </View>
    }

    return (
        <View>
            {isEditorder &&
                <TouchableOpacity onPress={() => handleDeleteOrder()} style={{ width: "100%", padding: 10, backgroundColor: Colors.RED, marginVertical: 10 }}>
                    <Text style={{ textAlign: "center", fontSize: getFontSize(17) }}>ELIMINAR COMPROBANTE</Text>
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
                            backgroundColor: Colors.SURFACE,
                            marginVertical: 10,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: Colors.BORDER,
                            shadowColor: Colors.GREY,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                    >
                        <Text style={{ textAlign: "center", fontSize: getFontSize(16), color: Colors.DGREY, fontWeight: "600", letterSpacing: 0.5 }}>
                            CAMBIAR PROVEEDOR
                        </Text>
                    </TouchableOpacity>

                    <View style={{ backgroundColor: "white", width: "100%", padding: 10 }}>
                        <Text style={{ textAlign: "center", fontSize: getFontSize(20) }}>{account?.code}</Text>
                        <Text style={{ textAlign: "center", fontSize: getFontSize(18) }}>{account?.name}</Text>
                    </View>
                </>
            )}

            {isInventory && (
                <View style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6 }}>
                    <Text style={{ color: "#6b7280", fontSize: 13 }}>Cargando información de inventario</Text>
                </View>
            )}


            <View style={{ zIndex: 99, paddingHorizontal: 10, marginTop: 10 }}>
                <Text style={{ fontSize: getFontSize(12), color: Colors.DGREY, marginBottom: 6, marginLeft: 4 }}>
                    Observación
                </Text>
                <TextInput
                    value={observation}
                    onChangeText={setObservation}
                    placeholder="Escribí una observación..."
                    multiline={true}
                    style={{
                        borderWidth: 1,
                        borderColor: Colors.GREY,
                        backgroundColor: Colors.WHITE,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        minHeight: 56,
                        textAlignVertical: "top",
                        marginBottom: 10,
                    }}
                />
                <TouchableOpacity
                    onPress={() => jumpTo("articulos")}
                    disabled={!canContinue}
                    style={{
                        backgroundColor: canContinue ? "#0872ae" : "#bdc3c7",
                        marginTop: 20,
                        paddingVertical: 10,
                        borderRadius: 10,
                        opacity: canContinue ? 1 : 0.8
                    }}
                >
                    <Text style={{
                        textAlign: "center",
                        color: canContinue ? "white" : "#7f8c8d",
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



