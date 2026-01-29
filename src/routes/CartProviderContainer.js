import OrderViewTab from './OrderViewTab'
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export default function CartProviderContainer({ route, navigation }) {
    // console.log(route.params)
    return (
        <OrderViewTab route={route} navigation={navigation} />
    )
}
