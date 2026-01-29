import Account from "@db/Account";
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import Colors from "@styles/Colors";
import { Fonts } from "@styles/Theme";
import { useCart } from '../hooks/useCart';
import CartScreen from '../screens/Orders/CartScreen';

import { Alert, BackHandler } from 'react-native';
import ResumeCartScreen from '../screens/Orders/ResumeCartScreen';
import SelectAccountScreen from '../screens/Orders/SelectAccountScreen';

const renderScene = SceneMap({
    proveedor: SelectAccountScreen,
    articulos: CartScreen,
    resumeCart: ResumeCartScreen
});

const routes = [
    { key: 'proveedor', title: 'PROVEEDOR' },
    { key: 'articulos', title: 'ARTICULOS' },
    { key: 'resumeCart', title: 'RESUMEN' },
];

export default function OrderViewTab({ navigation, route }) {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);

    const { id = null, account = null } = route?.params || {}

    const { loadEditOrder, addAccount } = useCart();

    // console.log(route)
    // console.log(id, account)

    const loadAccount = async () => {
        const account = await Account.findBy({ code_eq: account });

        addAccount({
            code: account?.code,
            name: account?.name,
            priceClass: account?.price_class,
            lista: account?.lista,
        })
    }

    useEffect(() => {
        if (account) {
            loadAccount()
        }
    }, [account])

    useEffect(() => {
        if (id) {
            const loadOrder = async (orderId) => {
                await loadEditOrder(orderId)
            }

            loadOrder(id)
        }
    }, [id])


    useEffect(() => {
        const onBackPress = () => {
            Alert.alert(
                'Cancelar carga de comprobante',
                '¿Está seguro que desea cancelar la carga del comprobante?',
                [
                    {
                        text: 'Continuar',
                        onPress: () => {
                            // Do nothing
                        },
                        style: 'cancel',
                    },
                    { text: 'Si, Cancelar', onPress: () => navigation.goBack() },
                ],
                { cancelable: false }
            );

            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => backHandler.remove();
    }, []);

    return (
        // <CartProvider>

        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={(props) => (
                <TabBar
                    {...props}
                    style={{ backgroundColor: "#1E5AA8" }}
                    indicatorStyle={{
                        backgroundColor: Colors.SURFACE,
                        height: 34,
                        borderRadius: 18,
                        margin: 6,
                    }}
                    tabStyle={{ minHeight: 48, borderRadius: 18 }}
                    activeColor={Colors.PRIMARY_DARK}
                    inactiveColor="rgba(255,255,255,0.7)"
                    labelStyle={{
                        fontFamily: Fonts.display,
                        fontSize: 12,
                        letterSpacing: 1,
                    }}
                />
            )}
        />
        // </CartProvider>

    );
}
