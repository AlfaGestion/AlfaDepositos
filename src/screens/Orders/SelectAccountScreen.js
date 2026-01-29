import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCart } from '../../hooks/useCart';
import Account from "@db/Account";
import AccountListSearch from "../../components/AccountListSearch";
import { getFontSize } from '../../utils/Metrics';
import Colors from '../../styles/Colors';
import DropdownPriceClass from "@components/DropdownPriceClass";
import DropdownSaleCondition from "@components/DropdownSaleCondition";
import DropdownInvoiceType from "@components/DropdownInvoiceType";
import DropdownTypeDocument from "@components/DropdownTypeDocument";
import DropdownTypeDocumentStock from "@components/DropdownTypeDocumentStock";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export default function SelectAccountScreen({ jumpTo, route }) {
    const { account, deleteOrder, addAccount, isLoading, isEditorder, removeAccount, setPriceClass, documentData, setInvoiceType, setTypeDocument, setSaleCondition, orderMode } = useCart();
    const navigation = useNavigation()
    const router = useRoute();
    const modeFromParams = router.params?.mode;
    const [isLoadingAccount, setIsLoadingAccount] = useState(false)

    // Variable para verificar si el botón debe estar habilitado
    const canContinue = account?.priceClass != null && account?.priceClass !== '';

    const handleSelAccount = (code, name, priceClass, lista) => {
        setIsLoadingAccount(true);

        addAccount({
            code,
            name,
            priceClass,
            lista,
        });

        setIsLoadingAccount(false);
    };

    const removeOrderFromDB = async () => {
        await deleteOrder()
        navigation.goBack()
    }

    const handleDeleteOrder = () => {
        return Alert.alert("¿Eliminar?", "¿Está seguro que desea eliminar el comprobante? No podrá recuperarlo.", [
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


            <View style={{ zIndex: 99, paddingHorizontal: 10, marginTop: 10 }}>
                <View style={{ zIndex: 999999999999 }}>
                    <DropdownPriceClass priceClass={account?.priceClass} setPriceClass={setPriceClass} />
                </View>

                <View style={{ zIndex: 999999999999 }}>
                    {(documentData?.typeDocument == 'eFC' || documentData?.typeDocument == 'eNC' || documentData?.typeDocument == 'eND') &&
                        <View style={{ width: "100%", backgroundColor: "orange", marginBottom: 5, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: getFontSize(14), paddingVertical: 5 }}>Requiere conexión a internet</Text>
                        </View>
                    }
                    {
                        modeFromParams == 'COMPRAS' &&
                        <DropdownTypeDocument value={documentData?.typeDocument} setValue={setTypeDocument} />
                    }
                    {
                        modeFromParams == 'INVENTARIO' &&
                        <DropdownTypeDocumentStock value={documentData?.typeDocument} setValue={setTypeDocument} />
                    }
                </View>

                <View style={{ flexDirection: "row", gap: 10, width: "100%", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ width: `${(documentData?.typeDocument == 'NP' || documentData?.typeDocument == 'RM') ? '48%' : '100%'}`, zIndex: 10 }}>
                        <DropdownSaleCondition value={documentData?.saleCondition} setValue={setSaleCondition} />
                    </View>
                    {(documentData?.typeDocument == 'NP' || documentData?.typeDocument == 'RM') &&
                        <View style={{ width: "48%", zIndex: 20 }}>
                            <DropdownInvoiceType value={documentData?.invoiceType} setValue={setInvoiceType} />
                        </View>
                    }
                </View>

                {/* BOTÓN CORREGIDO CON VALIDACIÓN */}
                <TouchableOpacity
                    onPress={() => jumpTo("articulos")}
                    disabled={!canContinue}
                    style={{
                        backgroundColor: canContinue ? "#0872ae" : "#bdc3c7", // Azul si ok, Gris si falta clase
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
                        IR A CARGA DE ARTICULOS {`>`}
                    </Text>
                </TouchableOpacity>

                {/* Mensaje de ayuda si el botón está bloqueado */}
                {!canContinue && (
                    <Text style={{ color: Colors.RED, textAlign: 'center', marginTop: 8, fontSize: getFontSize(13), fontWeight: '500' }}>
                        * Seleccione una Clase de Precio para continuar
                    </Text>
                )}

            </View>
        </View >
    )
}
