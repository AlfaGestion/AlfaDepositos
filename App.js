import { StatusBar } from "expo-status-bar";
import { UserProvider } from "@context/UserContext";
// Importa CartProvider desde el archivo donde vive el hook
import { CartProvider } from "./src/hooks/useCart"; // <--- Ajusta esta ruta a la real
import HomeStack from "@routes/homeStack"

const App = () => {
  return (
    <UserProvider>
      <CartProvider>
        <StatusBar style="dark" backgroundColor="#e1e1e1" />
        <HomeStack />
      </CartProvider>
    </UserProvider>
  );
};

export default App;