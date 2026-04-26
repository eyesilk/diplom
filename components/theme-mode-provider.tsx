import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    deviceColorScheme === "light" ? "light" : "dark",
  );

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode: () =>
        setThemeMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [themeMode],
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
