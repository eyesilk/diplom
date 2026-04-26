import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
const THEME_MODE_STORAGE_KEY = "lynx-theme-mode";

export function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    deviceColorScheme === "light" ? "light" : "dark",
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreThemeMode = async () => {
      try {
        const storedThemeMode = await AsyncStorage.getItem(
          THEME_MODE_STORAGE_KEY,
        );

        if (
          isMounted &&
          (storedThemeMode === "light" || storedThemeMode === "dark")
        ) {
          setThemeMode(storedThemeMode);
        }
      } catch {
        // Keep the device theme if storage is temporarily unavailable.
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    restoreThemeMode();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode).catch(() => {
      // Theme switching should still work even if persistence fails.
    });
  }, [isHydrated, themeMode]);

  const updateThemeMode = useCallback((nextThemeMode: ThemeMode) => {
    setThemeMode(nextThemeMode);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode: updateThemeMode,
      toggleThemeMode,
    }),
    [themeMode, toggleThemeMode, updateThemeMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }

  return context;
}
