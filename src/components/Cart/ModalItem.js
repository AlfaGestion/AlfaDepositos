import { View, Text, Modal, Alert, TouchableOpacity, TextInput, Inpu, InteractionManager } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { getFontSize } from '../../utils/Metrics'
import { useCart } from '../../hooks/useCart';
import Configuration from "@db/Configuration";
import Colors from '../../styles/Colors';

export default function ModalItem({ isVisible, setIsVisible, item, isNew = false, initialQuantity = null, onAdded = null }) {
    const [quantity, setQuantity] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [bultos, setBultos] = useState(0)
    const [price, setPrice] = useState(0)
    const inputRef = useRef(null)
    const [config, setConfig] = useState({
        showStock: "",
        descPorArticulo: "",
        bloqueaStockRealNegativo: "",
        bloqueaStockComprometidoNegativo: "",
        pideBultos: "",
        pidePrecio: ""
    })

    const { addToCart, account, getItem, removeFromCart } = useCart();

    const { code, name } = item || { code: '', name: '' }

    const loadConfig = async () => {
        try {
            await Configuration.createTable();
            const newConfig = {
                descPorArticulo: await Configuration.getConfigValue("DESCUENTO_POR_ARTICULO"),
                showStock: await Configuration.getConfigValue("CONSULTA_STOCK_PEDIDOS"),
                // bloqueaStockRealNegativo: await Configuration.getConfigValue("BLOQUEA_STK_REAL_NEGATIVO"),
                // bloqueaStockComprometidoNegativo: await Configuration.getConfigValue("BLOQUEA_STK_COMPROMETIDO_NEGATIVO"),
                pideBultos: await Configuration.getConfigValue("PIDE_BULTOS"),
                pidePrecio: await Configuration.getConfigValue("PIDE_PRECIO"),
            };
            setConfig(newConfig);
        } catch (e) {
            setConfig({
                descPorArticulo: "",
                showStock: "",
                pideBultos: "",
                pidePrecio: ""
            });
        }
    };

    // const quantity = getCurrentQuantity(code) || 0
    useEffect(() => {
        if (!isVisible) return;

        if (item) {
            setPrice(item[`price${account?.priceClass}`] + "");
            if (initialQuantity !== null && initialQuantity !== undefined && isNew) {
                setQuantity(String(initialQuantity));
            } else {
                setQuantity(item["cant_propuesta"] + "");
            }
        }

        loadConfig();
        const pItem = getItem(code);

        if (pItem && !isNew) {
            setQuantity(pItem?.quantity == 0 ? "1" : pItem?.quantity + "");

            if (pItem?.disc > 0) {
                setDiscount(pItem.disc + "");
            }
            setBultos(pItem?.bultos + "");

            //TODO chequear esto
            setPrice(pItem[`price${account?.priceClass}`] + "");
        }
    }, [isVisible, item, initialQuantity, account?.priceClass])

    useEffect(() => {
        if (!isVisible) return;
        let cancelled = false;
        const task = InteractionManager.runAfterInteractions(() => {
            if (cancelled) return;
            setTimeout(() => {
                if (cancelled) return;
                // Ensure quantity input grabs focus for keyboard
                inputRef.current?.focus?.();
            }, 80);
        });
        return () => {
            cancelled = true;
            task?.cancel?.();
        };
    }, [isVisible]);


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
            <View style={{ elevation: 5, marginTop: 80, marginHorizontal: 20, width: "90%", padding: 20, backgroundColor: "white", borderRadius: 16, alignItems: "center", justifyContent: "center" }}>

                <Text style={{ fontSize: getFontSize(14), fontWeight: "600", color: Colors.MUTED }}>{code}</Text>
                <Text style={{ fontSize: getFontSize(16), fontWeight: "600", color: Colors.DGREY, textAlign: "center" }}>{name}</Text>

                <View style={{ marginTop: 20, width: "100%" }}>

                    <Text style={{ fontSize: getFontSize(14), marginBottom: 6, color: Colors.DGREY }}>Ingrese la cantidad</Text>

                    <TextInput
                        ref={inputRef}
                        autoFocus={isVisible}
                        style={{ width: "100%", borderColor: Colors.BORDER, fontSize: getFontSize(16), borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: "#F8FAFC" }}
                        onChangeText={(text) => setQuantity(text)}
                        keyboardType="number-pad"
                        value={quantity}
                    // defaultValue={quantity}
                    // editable={!isLoading}
                    />
                    <Text style={{ fontSize: getFontSize(12), color: Colors.MUTED }}>Si no se informa se toma 1</Text>
                </View>

                {(config.pideBultos == "1" || config.pideBultos == 1) && (
                    <View style={{ marginTop: 20, width: "100%" }}>
                        <Text style={{ fontSize: getFontSize(14), marginBottom: 6, color: Colors.DGREY }}>Ingrese los bultos</Text>

                        <TextInput
                            // autoFocus={modalVisible}
                            // ref={inputRef}
                            value={bultos}
                            style={{ width: "100%", borderColor: Colors.BORDER, fontSize: getFontSize(16), borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: "#F8FAFC" }}
                            onChangeText={(text) => setBultos(text)}
                            keyboardType="number-pad"
                        // editable={!isLoading}
                        />
                    </View>
                )}

                {(config.pidePrecio == "1" || config.pidePrecio == 1) && (
                    <View style={{ marginTop: 20, width: "100%" }}>
                        <Text style={{ fontSize: getFontSize(14), marginBottom: 6, color: Colors.DGREY }}>Ingrese el precio</Text>

                        <TextInput
                            // autoFocus={modalVisible}
                            // ref={inputRef}
                            value={price}
                            // defaultValue={price}
                            style={{ width: "100%", borderColor: Colors.BORDER, fontSize: getFontSize(16), borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: "#F8FAFC" }}
                            onChangeText={(text) => setPrice(text)}
                            keyboardType="number-pad"
                        // editable={!isLoading}
                        />
                    </View>
                )}

                <View style={{ marginTop: 20, width: "100%" }}>
                    <TouchableOpacity style={{ width: "100%", backgroundColor: Colors.GREEN, paddingVertical: 12, borderRadius: 12 }} onPress={() => {
                        if (!isNew) {
                            removeFromCart(item.code)
                        }
                        addToCart(item, quantity == 0 ? 1 : quantity, discount, bultos, price, !isNew)
                        if (onAdded) onAdded()
                        setIsVisible(false)
                    }}>
                        <Text style={{ textAlign: "center", fontSize: getFontSize(15), fontWeight: "600", color: Colors.WHITE, letterSpacing: 0.4 }}>AGREGAR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ width: "100%", marginTop: 12, backgroundColor: Colors.RED, paddingVertical: 12, borderRadius: 12 }} onPress={() => setIsVisible(false)}>
                        <Text style={{ textAlign: "center", fontSize: getFontSize(15), fontWeight: "600", color: Colors.WHITE, letterSpacing: 0.4 }}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}
