import StockViewTab from './StockViewTab'
import { LogBox } from 'react-native';
import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export default function CartStockContainer({ route, navigation }) {
    const { restartCart } = useCart();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            restartCart();
        });
        return unsubscribe;
    }, [navigation, restartCart]);

    // console.log(route.params)
    return (
        <StockViewTab route={route} navigation={navigation} />
    )
}
