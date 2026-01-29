import { useCart } from '@hooks/useCart';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFontSize } from '../../utils/Metrics';
import Colors from '../../styles/Colors';

export default function FooterTotal() {
    const { getTotal, cartItems } = useCart();
    const [total, setTotal] = useState(0)
    const insets = useSafeAreaInsets();

    const formatAmount = (value) => {
        const num = Number.parseFloat(value);
        if (!Number.isFinite(num)) return "0,00";
        return new Intl.NumberFormat("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    useEffect(() => {
        setTotal(getTotal())
    }, [cartItems])

    return (
        <View style={{ zIndex: 99, flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", position: "absolute", bottom: 0, paddingBottom: 10 + (insets?.bottom || 0), backgroundColor: "#F0F5FA", borderTopColor: Colors.BORDER, borderTopWidth: 1, width: "100%" }}>
            <Text style={{ fontSize: getFontSize(18), fontWeight: "700", color: Colors.DGREY, marginRight: 6 }}>TOTAL:</Text>
            <Text style={{ fontSize: getFontSize(22), fontWeight: "700", color: Colors.DGREY }}>$ {formatAmount(total)}</Text>
            {/* <TouchableOpacity onPress={() => clearCart()} style={{ backgroundColor: "#f58383", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5 }}>
                <Text style={{ fontSize: getFontSize(20) }}>Vaciar</Text>
            </TouchableOpacity> */}
        </View>
    )
}
