import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useThemeMode } from "@/components/theme-mode-provider";

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { themeMode, setThemeMode } = useThemeMode();

  const isLight = themeMode === "light";
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const heroTitleSize = isLargeScreen ? 76 : isTablet ? 60 : 46;
  const subtitleSize = isLargeScreen ? 22 : isTablet ? 18 : 16;

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isLight ? "#f4f6f8" : "#08111b" },
      ]}
    >
      {isLight ? (
        <View style={styles.lightBackdrop}>
          <View style={styles.lightBandTop} />
          <View style={styles.lightBandBottom} />
          <View style={styles.lightFrameLeft} />
          <View style={styles.lightFrameRight} />
        </View>
      ) : (
        <ImageBackground
          source={require("../assets/images/background.png")}
          style={styles.darkBackdrop}
          resizeMode="cover"
        >
          <View style={styles.darkOverlay} />
        </ImageBackground>
      )}

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.topBar}>
          <View style={[styles.brandPill, isLight && styles.brandPillLight]}>
            <Ionicons
              name="film-outline"
              size={16}
              color={isLight ? "#0d1722" : "#f5c451"}
            />
            <Text style={[styles.brandText, isLight && styles.brandTextLight]}>
              Trailers
            </Text>
          </View>

          <View style={[styles.themeToggle, isLight && styles.themeToggleLight]}>
            <Ionicons
              name="moon-outline"
              size={16}
              color={isLight ? "#8aa0b5" : "#f4f7fb"}
            />
            <Switch
              value={isLight}
              onValueChange={(value) =>
                setThemeMode(value ? "light" : "dark")
              }
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
        </View>

        <View style={styles.hero}>
          <View style={styles.copyBlock}>
            <Text
              style={[
                styles.title,
                { fontSize: heroTitleSize, color: isLight ? "#0c1723" : "#f6f8fb" },
              ]}
            >
              Выбирай кино по настроению
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: subtitleSize,
                  color: isLight ? "#506579" : "#c6d4e1",
                },
              ]}
            >
              Трейлеры, рейтинги и детали фильма в одном аккуратном потоке.
            </Text>
          </View>

          <View
            style={[
              styles.showcase,
              isLight ? styles.showcaseLight : styles.showcaseDark,
            ]}
          >
            <View style={styles.showcaseHeader}>
              <Text
                style={[
                  styles.showcaseEyebrow,
                  isLight && styles.showcaseEyebrowLight,
                ]}
              >
                Сегодня в фокусе
              </Text>
              <View
                style={[
                  styles.livePill,
                  isLight ? styles.livePillLight : styles.livePillDark,
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: isLight ? "#ff7a59" : "#f5c451" },
                  ]}
                />
                <Text
                  style={[
                    styles.liveText,
                    isLight && styles.liveTextLight,
                  ]}
                >
                  Movie Feed
                </Text>
              </View>
            </View>

            <View style={styles.showcaseRow}>
              <View
                style={[
                  styles.posterMock,
                  isLight ? styles.posterMockLight : styles.posterMockDark,
                ]}
              >
                <Ionicons
                  name="play-circle"
                  size={34}
                  color={isLight ? "#0d1722" : "#f5c451"}
                />
              </View>

              <View style={styles.showcaseTextBlock}>
                <Text
                  style={[
                    styles.showcaseTitle,
                    { color: isLight ? "#0d1722" : "#f4f7fb" },
                  ]}
                >
                  Популярное. Фантастика. Боевики.
                </Text>
                <Text
                  style={[
                    styles.showcaseSubtitle,
                    { color: isLight ? "#61778b" : "#9fb2c4" },
                  ]}
                >
                  Открывай карточку фильма, смотри трейлер и переходи к полной
                  информации без лишних шагов.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              {["Популярное", "Фантастика", "Комедии"].map((item) => (
                <View
                  key={item}
                  style={[
                    styles.featureChip,
                    isLight ? styles.featureChipLight : styles.featureChipDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.featureChipText,
                      isLight && styles.featureChipTextLight,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.button, isLight ? styles.buttonLight : styles.buttonDark]}
            onPress={() => router.push("/home")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isLight ? "#ffffff" : "#08111b" },
              ]}
            >
              Начать просмотр
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={isLight ? "#ffffff" : "#08111b"}
            />
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={[styles.statItem, isLight && styles.statItemLight]}>
              <Text
                style={[
                  styles.statValue,
                  { color: isLight ? "#0d1722" : "#f4f7fb" },
                ]}
              >
                12
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isLight ? "#61778b" : "#8ea7bd" },
                ]}
              >
                подборок
              </Text>
            </View>

            <View style={[styles.statItem, isLight && styles.statItemLight]}>
              <Text
                style={[
                  styles.statValue,
                  { color: isLight ? "#0d1722" : "#f4f7fb" },
                ]}
              >
                TMDB
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isLight ? "#61778b" : "#8ea7bd" },
                ]}
              >
                база фильмов
              </Text>
            </View>

            <View style={[styles.statItem, isLight && styles.statItemLight]}>
              <Text
                style={[
                  styles.statValue,
                  { color: isLight ? "#0d1722" : "#f4f7fb" },
                ]}
              >
                HD
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isLight ? "#61778b" : "#8ea7bd" },
                ]}
              >
                постеры
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  darkBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 11, 18, 0.52)",
  },
  lightBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f4f6f8",
  },
  lightBandTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "34%",
    backgroundColor: "#e6edf3",
  },
  lightBandBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "22%",
    backgroundColor: "#edf2f7",
  },
  lightFrameLeft: {
    position: "absolute",
    top: "18%",
    left: 18,
    width: 4,
    height: "56%",
    backgroundColor: "#d9e3ec",
    borderRadius: 999,
  },
  lightFrameRight: {
    position: "absolute",
    top: "12%",
    right: 18,
    width: 4,
    height: "44%",
    backgroundColor: "#d9e3ec",
    borderRadius: 999,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(9, 18, 28, 0.78)",
  },
  brandPillLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dde6ee",
  },
  brandText: {
    color: "#f4f7fb",
    fontSize: 14,
    fontWeight: "700",
  },
  brandTextLight: {
    color: "#0d1722",
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(9, 18, 28, 0.78)",
  },
  themeToggleLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dde6ee",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 18,
    paddingBottom: 12,
  },
  copyBlock: {
    marginBottom: 24,
  },
  title: {
    fontWeight: "800",
    lineHeight: 52,
    maxWidth: 520,
  },
  subtitle: {
    marginTop: 14,
    lineHeight: 24,
    maxWidth: 460,
  },
  showcase: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  showcaseDark: {
    backgroundColor: "rgba(10, 19, 30, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.14)",
  },
  showcaseLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dde6ee",
  },
  showcaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  showcaseEyebrow: {
    color: "#f5c451",
    fontSize: 13,
    fontWeight: "700",
  },
  showcaseEyebrowLight: {
    color: "#d79d2f",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  livePillDark: {
    backgroundColor: "#132131",
  },
  livePillLight: {
    backgroundColor: "#f4f6f8",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    color: "#dce8f3",
    fontSize: 12,
    fontWeight: "700",
  },
  liveTextLight: {
    color: "#54697d",
  },
  showcaseRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  posterMock: {
    width: 88,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  posterMockDark: {
    backgroundColor: "#132131",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.12)",
  },
  posterMockLight: {
    backgroundColor: "#eef3f7",
    borderWidth: 1,
    borderColor: "#dbe4ec",
  },
  showcaseTextBlock: {
    flex: 1,
  },
  showcaseTitle: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
  },
  showcaseSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  featureChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featureChipDark: {
    backgroundColor: "#132131",
  },
  featureChipLight: {
    backgroundColor: "#eef3f7",
  },
  featureChipText: {
    color: "#d9e6f2",
    fontSize: 13,
    fontWeight: "700",
  },
  featureChipTextLight: {
    color: "#43586c",
  },
  bottomArea: {
    paddingBottom: 8,
  },
  button: {
    borderRadius: 8,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonDark: {
    backgroundColor: "#f5c451",
  },
  buttonLight: {
    backgroundColor: "#112639",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statItem: {
    flex: 1,
    minHeight: 76,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(9, 18, 28, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.12)",
    justifyContent: "space-between",
  },
  statItemLight: {
    backgroundColor: "#ffffff",
    borderColor: "#dde6ee",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
