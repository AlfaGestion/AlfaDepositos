import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Configuration from "@db/Configuration";

const ThemeContext = createContext({
  darkMode: false,
  themeLoaded: false,
  refreshTheme: async () => {},
});

function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  const refreshTheme = async () => {
    try {
      await Configuration.createTable();
      const value = await Configuration.getConfigValue("TEMA_OSCURO");
      setDarkMode(Configuration.isTruthyConfigValue(value));
    } catch (e) {
      setDarkMode(false);
    } finally {
      setThemeLoaded(true);
    }
  };

  useEffect(() => {
    refreshTheme();
  }, []);

  const value = useMemo(() => ({
    darkMode,
    themeLoaded,
    refreshTheme,
  }), [darkMode, themeLoaded]);

  if (!themeLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#0F1720" }} />;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeConfig() {
  return useContext(ThemeContext);
}

export { ThemeProvider, useThemeConfig };
