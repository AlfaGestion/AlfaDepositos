import { useCart } from '@hooks/useCart';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, FlatList, InteractionManager, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from '@styles/Colors';
import { getFontSize } from '../../utils/Metrics';
import ListaProductos from '../../components/ListaProductos';
import FooterTotal from '../../components/Cart/FooterTotal';
import ItemCart from '../../components/Cart/ItemCart';
import { useRoute } from '@react-navigation/native';

export default function CartScreen({ jumpTo, isActive = false }) {

    const { account, cartItems } = useCart();
    const route = useRoute();
    const isInventory = route?.params?.mode === "INVENTARIO";
    const [showList, setShowList] = useState(isInventory);
    const [codeInput, setCodeInput] = useState('');
    const [qtyInput, setQtyInput] = useState('1');
    const [scanTrigger, setScanTrigger] = useState(0);
    const [searchTrigger, setSearchTrigger] = useState(0);
    const [lastAddedAt, setLastAddedAt] = useState(0);
    const [lastAddedItem, setLastAddedItem] = useState(null);
    const qtyInputRef = useRef(null);
    const codeInputRef = useRef(null);

    const focusQtyInput = () => {
        qtyInputRef.current?.focus?.();
    };

    const focusCodeInput = () => {
        codeInputRef.current?.focus?.();
    };

    const focusPrimaryInput = () => {
        if (isInventory) {
            focusCodeInput();
        } else {
            focusQtyInput();
        }
    };

    useEffect(() => {
        if (!isActive) return;
        let cancelled = false;
        const task = InteractionManager.runAfterInteractions(() => {
            if (cancelled) return;
            setTimeout(() => {
                if (cancelled) return;
                focusPrimaryInput();
                // Second attempt in case another input steals focus
                setTimeout(() => {
                    if (cancelled) return;
                    focusPrimaryInput();
                }, 150);
            }, 80);
        });
        return () => {
            cancelled = true;
            task?.cancel?.();
        };
    }, [isActive]);

    useEffect(() => {
        if (!isActive || !account) return;
        const t = setTimeout(() => {
            focusPrimaryInput();
        }, 120);
        return () => clearTimeout(t);
    }, [isActive, account, isInventory]);

    useEffect(() => {
        if (isInventory) {
            setShowList(true);
        }
    }, [isInventory]);

    if (!account) {
        return <View style={{ flex: 1, paddingHorizontal: 10, marginTop: 20, display: "flex" }}>
            <Text
                style={{
                    fontSize: 15,
                    marginBottom: 20,
                    backgroundColor: "orange"
                }}
            >
                Primero debe seleccionar el proveedor para poder ver los precios correctos</Text>
            <Button style={{ marginTop: 10 }} onPress={() => jumpTo("proveedor")} title='Seleccionar proveedor' />
        </View>
    }

    const handleSearchCode = () => {
        const code = String(codeInput ?? "").trim();
        if (!code) {
            Alert.alert("Atención", "Ingrese un código para buscar.");
            return;
        }
        setSearchTrigger((v) => v + 1);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
                <Text style={{ fontSize: getFontSize(12), color: Colors.DGREY, marginBottom: 6, marginLeft: 4 }}>
                    Cantidad
                </Text>
                <TextInput
                    ref={qtyInputRef}
                    value={qtyInput}
                    onChangeText={setQtyInput}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => codeInputRef.current?.focus?.()}
                    style={{
                        borderWidth: 1,
                        borderColor: Colors.GREY,
                        backgroundColor: Colors.WHITE,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        marginBottom: 10,
                    }}
                />

                <Text style={{ fontSize: getFontSize(12), color: Colors.DGREY, marginBottom: 6, marginLeft: 4 }}>
                    Código
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                    <TextInput
                        ref={codeInputRef}
                        value={codeInput}
                        onChangeText={setCodeInput}
                        placeholder="Ingrese el código"
                        onSubmitEditing={handleSearchCode}
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: Colors.GREY,
                            backgroundColor: Colors.WHITE,
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                        }}
                    />
                    <TouchableOpacity
                        onPress={handleSearchCode}
                        style={{
                            width: 48,
                            backgroundColor: Colors.DBLUE,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                        }}
                    >
                        <Ionicons name="checkmark" size={20} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setScanTrigger((v) => v + 1);
                        }}
                        style={{
                            width: 110,
                            backgroundColor: Colors.SURFACE,
                            borderWidth: 1,
                            borderColor: Colors.BORDER,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                        }}
                    >
                        <Ionicons name="camera-outline" size={18} color={Colors.DBLUE} />
                        <Text style={{ marginTop: 2, color: Colors.DGREY, fontSize: getFontSize(11) }}>
                            Escanear
                        </Text>
                    </TouchableOpacity>
                </View>

                {lastAddedItem && (
                    <View style={{
                        backgroundColor: Colors.SURFACE,
                        borderWidth: 1,
                        borderColor: Colors.BORDER,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        marginBottom: 10,
                    }}>
                        <Text style={{ fontSize: getFontSize(12), color: Colors.MUTED }}>
                            Agregado: {lastAddedItem?.name || lastAddedItem?.description || lastAddedItem?.descripcion || ""}
                        </Text>
                        <Text style={{ fontSize: getFontSize(12), color: Colors.DGREY }}>
                            Cantidad: {lastAddedItem?.quantity || 0}
                        </Text>
                    </View>
                )}

                <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                    <TouchableOpacity
                        onPress={() => setShowList(true)}
                        style={{
                            flex: 1,
                            backgroundColor: Colors.DBLUE,
                            paddingVertical: 12,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ color: Colors.WHITE, fontWeight: '600' }}>Consultar</Text>
                    </TouchableOpacity>
                    {showList && (
                        <TouchableOpacity
                            onPress={() => setShowList(false)}
                            style={{
                                width: 44,
                                backgroundColor: Colors.GREY,
                                borderRadius: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: Colors.DGREY, fontWeight: '700' }}>X</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

                <ListaProductos
                    priceClassSelected={account?.priceClass ?? 1}
                    lista={account?.lista}
                    scanTrigger={scanTrigger}
                    searchTrigger={searchTrigger}
                    searchCode={codeInput}
                    searchQuantity={qtyInput}
                    autoAddOnManualSearch={true}
                    searchAutoFocus={false}
                    isActive={isActive}
                    hideList={!showList}
                fillHeight={false}
                autoAddOnScan={true}
                scanQuantity={qtyInput}
                onAutoAdd={(product, qty) => {
                    setLastAddedAt(Date.now());
                    if (product) {
                        setLastAddedItem({ ...product, quantity: qty });
                    }
                    setQtyInput('1');
                    setCodeInput('');
                    focusCodeInput();
                }}
                showSearchCamera={false}
                showFooter={false}
                listCompact={true}
            />

            <View style={{ marginTop: 10, flex: 1 }}>
                <Text style={{ fontSize: getFontSize(13), color: Colors.DGREY, marginLeft: 10, marginBottom: 6 }}>
                    Items escaneados: {cartItems?.length || 0}
                </Text>
                {(cartItems?.length > 0 || lastAddedItem) ? (
                    <FlatList
                        data={cartItems?.length > 0 ? [...cartItems].sort((a, b) => (b._addedAt || 0) - (a._addedAt || 0)) : [lastAddedItem]}
                        keyExtractor={(item, idx) => `${item.code}_${idx}`}
                        renderItem={({ item }) => <ItemCart item={item} priceClass={account?.priceClass ?? 1} showImage={false} compact={true} />}
                        ListFooterComponent={<View />}
                        ListFooterComponentStyle={{ height: 120 }}
                        extraData={lastAddedAt}
                    />
                ) : (
                    <Text style={{ marginLeft: 10, color: Colors.GREY }}>Todavía no hay artículos.</Text>
                )}
            </View>
            <FooterTotal />
        </View>
    )

}

