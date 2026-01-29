import { useCart } from '@hooks/useCart';
import { Button, Text, View } from 'react-native';
import ListaProductos from '../../components/ListaProductos';

export default function CartScreen({ jumpTo }) {

    const { account } = useCart();

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
        <View>
            <ListaProductos
                priceClassSelected={account?.priceClass ?? 1}
                lista={account?.lista}
            />
        </View>
    )

}
