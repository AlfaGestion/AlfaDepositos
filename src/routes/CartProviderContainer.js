import OrderViewTab from './OrderViewTab'
import { LogBox } from 'react-native';
import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export default function CartProviderContainer({ route, navigation }) {
    const { restartCart } = useCart();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            restartCart();
        });
        return unsubscribe;
    }, [navigation, restartCart]);

    // console.log(route.params)
    return (
        <OrderViewTab route={route} navigation={navigation} />
    )
}
