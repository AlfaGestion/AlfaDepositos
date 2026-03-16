import { useCart } from '@hooks/useCart';
import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { currencyFormat } from '../../libraries/utils';
import { getFontSize } from "../../utils/Metrics";
import ModalItem from './ModalItem';
import ProductImage from '../ProductImage';


export default function ItemResumeCart({ item, darkMode = false }) {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [priceClassSelected, setPriceClassSelected] = useState(null)

    const { addToCart, noPermiteDuplicarItem, loadImages, decreaseQuantity, removeFromCart, getCurrentQuantity, globalPriceClass } = useCart();

    useEffect(() => {
        const priceToShow = `price${globalPriceClass}`;
        setPriceClassSelected(priceToShow)
    }, [globalPriceClass])

    // console.log(item)

    return (
        <TouchableOpacity style={{ width: "100%", paddingHorizontal: 1, backgroundColor: darkMode ? "#0F1720" : "white" }} onPress={() => setIsModalVisible(true)} >

            <View style={{ backgroundColor: darkMode ? "#152332" : "white", display: "flex", flexDirection: "row", width: "100%" }}>
                <ModalItem isVisible={isModalVisible} setIsVisible={setIsModalVisible} item={item} darkMode={darkMode} />

                {loadImages &&
                    <View style={{ flex: 0, alignItems: "center", justifyContent: "flex-start", marginRight: 4 }}>
                        {/* <Image source={imgProduct}></Image> */}
                        <ProductImage widthImage={60} heightImage={60} fileName={item.code} />
                    </View>
                }
                <View style={{ flex: 3, paddingVertical: 3, borderBottomColor: darkMode ? "#2D4154" : "gray", borderBottomWidth: 1 }}>
                    <Text style={{ fontSize: getFontSize(12), color: darkMode ? "#BFD0E0" : "#1B1B1B" }}>#{item?.code}</Text>
                    {parseInt(item?.disc) > 0 && <Text style={{ fontSize: getFontSize(12), color: darkMode ? "#BFD0E0" : "#1B1B1B" }}>DESCUENTO : {item?.disc}%</Text>}
                    <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{item?.name}</Text>
                    {item?.disc > 0 ?
                        <Text style={{ fontSize: getFontSize(16), fontWeight: "600", color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{currencyFormat(item?.quantity * item?.priceWithDiscount)} ({item?.quantity} x {currencyFormat(item?.priceWithDiscount)}) <Text style={{ textDecorationLine: "line-through", color: darkMode ? "#9CB2C8" : "#1B1B1B" }}>{currencyFormat(item?.[priceClassSelected])}</Text></Text>
                        :
                        <Text style={{ fontSize: getFontSize(16), fontWeight: "600", color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{currencyFormat(item?.quantity * item?.[priceClassSelected])} ({item?.quantity} x {currencyFormat(item?.[priceClassSelected])}) </Text>
                    }
                    {item?.bultos > 0 && <Text style={{ fontSize: getFontSize(14), color: darkMode ? "#BFD0E0" : "#1B1B1B" }}>{item?.bultos} Bultos</Text>}

                    <View style={{ flexDirection: "row", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <TouchableOpacity onPress={() => removeFromCart(item.code)} style={{ backgroundColor: "red", paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5 }}>
                            <Text style={{ fontSize: getFontSize(14), color: "white" }}>Eliminar</Text>
                        </TouchableOpacity>

                        {!noPermiteDuplicarItem ?
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", }}>
                                <TouchableOpacity onPress={() => decreaseQuantity(item.code)} style={{ borderWidth: 1, borderColor: darkMode ? "#2D4154" : "gray", borderRadius: 20 }}>
                                    <Text style={{ paddingHorizontal: 15, fontWeight: "500", paddingVertical: 5, fontSize: getFontSize(20), color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>-</Text>
                                </TouchableOpacity>

                                <Text style={{ fontSize: getFontSize(18), fontWeight: "bold", paddingHorizontal: 10, textAlign: "center", minWidth: 60, color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{getCurrentQuantity(item.code)}</Text>

                                <TouchableOpacity onPress={() => {
                                    addToCart(item)
                                }} style={{ borderWidth: 1, borderColor: darkMode ? "#2D4154" : "gray", borderRadius: 20 }}>
                                    <Text style={{ paddingHorizontal: 15, paddingVertical: 5, fontWeight: "500", fontSize: getFontSize(20), color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>+</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingVertical: 20 }}>
                            </View>
                        }
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}
