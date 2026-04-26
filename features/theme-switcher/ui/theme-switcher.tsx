import React from "react";
import { StyleSheet, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeMode } from "@/shared/model";

export default function ThemeSwitcher() {
  const { themeMode, setThemeMode } = useThemeMode();
  const isLight = themeMode === "light";

  return (
    <View style={[styles.wrap, isLight && styles.wrapLight]}>
      <Ionicons
        name="moon-outline"
        size={16}
        color={isLight ? "#8aa0b5" : "#f4f7fb"}
      />
      <Switch
        value={isLight}
        onValueChange={(value) => setThemeMode(value ? "light" : "dark")}
        trackColor={{ false: "#24384d", true: "#cfd9e4" }}
        thumbColor={isLight ? "#ffffff" : "#f5c451"}
        ios_backgroundColor={isLight ? "#cfd9e4" : "#24384d"}
      />
      <Ionicons
        name="sunny-outline"
        size={16}
        color={isLight ? "#d79d2f" : "#8ea7bd"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(9, 18, 28, 0.78)",
  },
  wrapLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dde6ee",
  },
});
