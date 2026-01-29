import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CartScreen from '../screens/Orders/CartScreen';
import SelectAccountScreen from '../screens/Orders/SelectAccountScreen';
import ResumeCartScreen from '../screens/Orders/ResumeCartScreen';
import { Ionicons } from 'react-native-vector-icons';
import Colors from '@styles/Colors';
import { Fonts } from '@styles/Theme';

const Tab = createBottomTabNavigator();

const OrderTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    // Aquí puedes personalizar el ícono según la pantalla
                    if (route.name === 'Proveedor') {
                        iconName = 'person';  // Ícono de proveedor
                    } else if (route.name === 'Articulos') {
                        iconName = 'cart';  // Ícono de carrito
                    } else if (route.name === 'Finalizar') {
                        iconName = 'save';  // Ícono de carrito
                    }
                    return <Ionicons name={iconName} size={25} color={color} />;
                },
                tabBarActiveTintColor: Colors.PRIMARY,
                tabBarInactiveTintColor: Colors.MUTED,
                tabBarStyle: {
                    backgroundColor: Colors.SURFACE,
                    borderTopColor: Colors.BORDER,
                    borderTopWidth: 1,
                    height: 62,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontFamily: Fonts.body,
                    fontSize: 12,
                },
            })}
        >

            <Tab.Screen name="Proveedor" component={SelectAccountScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Articulos" component={CartScreen} options={{ headerShown: false, lazy: true }} />
            <Tab.Screen name="Finalizar" component={ResumeCartScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export default OrderTabNavigator;
