import { useCart } from '@hooks/useCart';
import { useEffect, useRef, useState } from 'react';
import { Button, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from '@styles/Colors';
import { getFontSize } from '../../utils/Metrics';
import ListaProductos from '../../components/ListaProductos';
import FooterTotal from '../../components/Cart/FooterTotal';
import ItemCart from '../../components/Cart/ItemCart';
import { useRoute } from '@react-navigation/native';

export default function CartScreen({ jumpTo }) {

    const { account, cartItems } = useCart();
    const route = useRoute();
    const isInventory = route?.params?.mode === "INVENTARIO";
    const [showList, setShowList] = useState(isInventory);
    const [codeInput, setCodeInput] = useState('');
    const [qtyInput, setQtyInput] = useState('1');
    const [scanTrigger, setScanTrigger] = useState(0);
    const [lastAddedAt, setLastAddedAt] = useState(0);
    const [lastAddedItem, setLastAddedItem] = useState(null);
    const qtyInputRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => {
            qtyInputRef.current?.focus?.();
        }, 100);
        return () => clearTimeout(t);
    }, []);

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
                        value={codeInput}
                        onChangeText={setCodeInput}
                        placeholder="Ingrese el código"
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
                        data={cartItems?.length > 0 ? cartItems : [lastAddedItem]}
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

