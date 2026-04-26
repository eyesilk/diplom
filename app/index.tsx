import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

export default function Welcomes() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const dynamicStyles = StyleSheet.create({
    title: {
      fontSize: isLargeScreen ? 72 : isTablet ? 56 : 42,
    },
    subtitle: {
      fontSize: isLargeScreen ? 26 : isTablet ? 20 : 16,
      maxWidth: isTablet ? 400 : 300,
    },
    button: {
      paddingVertical: isTablet ? 18 : 14,
      paddingHorizontal: isTablet ? 40 : 28,
    },
  });

  return (
    <ImageBackground
      source={require("../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.container, { paddingTop: height * 0.1 }]}>
        <Text style={[styles.title, dynamicStyles.title]}>Trailers</Text>

        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          Сервис для просмотра трейлеров на любой вкус и цвет.
        </Text>

        <TouchableOpacity
          style={[styles.button, dynamicStyles.button]}
          onPress={() => router.push("/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Начать просмотр</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: "#c0bfbc",
    textAlign: "center",
    marginBottom: 40,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: "#112639",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
