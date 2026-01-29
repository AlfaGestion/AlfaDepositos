import { useCart } from '@hooks/useCart';
import imgProduct from "@icons/product2.png";
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getFontSize } from "../../utils/Metrics";
import { useEffect, useState } from 'react';
import ModalItem from './ModalItem';
import ProductImage from '../ProductImage';

export default function ItemCart({ item, priceClass, showImage = true, compact = false }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { addToCart, noPermiteDuplicarItem, decreaseQuantity, loadImages, getCurrentQuantity, removeFromCart, setGlobalPriceClass } = useCart();

    // Al montar el componente o si cambia priceClass, lo seteamos globalmente
    useEffect(() => {
        setGlobalPriceClass(priceClass);
    }, [priceClass]);

    const priceKey = `price${priceClass}`;
    const priceToShow = item[priceKey] ?? 0;
    const quantity = getCurrentQuantity(item.code);

    const imageSize = compact ? 46 : 80;
    const rightPadding = compact ? 6 : 0;
    const nameSize = compact ? 14 : 16;
    const priceSize = compact ? 16 : 20;
    const codeSize = compact ? 11 : 12;
    const rowPadding = compact ? 6 : 1;
    const actionFont = compact ? 12 : 14;
    const qtyFont = compact ? 16 : 20;
    const btnPadding = compact ? 8 : 15;

    return (
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ marginBottom: 8, backgroundColor: "white", flexDirection: "row", paddingHorizontal: rowPadding }}>
            <ModalItem isVisible={isModalVisible} setIsVisible={setIsModalVisible} item={item} />

            {showImage && (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    {/* <Image source={imgProduct}></Image> */}
                    <ProductImage cancelaCarga={!loadImages} fileName={item?.code} widthImage={imageSize} heightImage={imageSize} />
                </View>
            )}

            <View style={{ flex: showImage ? 3 : 4, paddingVertical: 4, paddingRight: rightPadding }}>
                <Text style={{ fontSize: getFontSize(codeSize) }}>#{item?.code}</Text>
                <Text style={{ fontSize: getFontSize(nameSize) }}>{item?.name}</Text>
                <Text style={{ fontSize: getFontSize(priceSize), fontWeight: "600" }}>$ {priceToShow}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: quantity > 0 ? "space-between" : "flex-end" }}>
                    {quantity > 0 && (
                        <TouchableOpacity onPress={() => removeFromCart(item.code)} style={{ backgroundColor: "red", paddingHorizontal: compact ? 8 : 10, paddingVertical: 2, borderRadius: 5 }}>
                            <Text style={{ fontSize: getFontSize(actionFont), color: "white" }}>Eliminar</Text>
                        </TouchableOpacity>
                    )}

                    {!noPermiteDuplicarItem ?
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginRight: 10, paddingVertical: 5 }}>
                            <TouchableOpacity onPress={() => decreaseQuantity(item.code)} style={{ borderWidth: 1, borderColor: "gray", borderRadius: 20 }}>
                                <Text style={{ paddingHorizontal: btnPadding, fontWeight: "bold", paddingVertical: 5, fontSize: getFontSize(qtyFont) }}>-</Text>
                            </TouchableOpacity>

                            <Text style={{ fontSize: getFontSize(qtyFont), textAlign: "center", fontWeight: "bold", paddingHorizontal: 10, minWidth: compact ? 48 : 70 }}>{quantity}</Text>

                            <TouchableOpacity onPress={() => addToCart(item, 1, 0, priceClass)} style={{ borderWidth: 1, borderColor: "gray", borderRadius: 20 }}>
                                <Text style={{ paddingHorizontal: btnPadding, paddingVertical: 5, fontWeight: "bold", fontSize: getFontSize(qtyFont) }}>+</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginRight: 10, paddingVertical: 20 }}>
                        </View>
                    }
                </View>
            </View>
        </TouchableOpacity>
    );
}
