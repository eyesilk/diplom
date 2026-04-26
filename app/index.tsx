import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import ThemeToggle from "@/components/theme-toggle";
import { useThemeMode } from "@/components/theme-mode-provider";
import { fetchTmdbTrailersCollection } from "@/constants/tmdb";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { themeMode } = useThemeMode();
  const [activeSlide, setActiveSlide] = useState(0);

  const isLight = themeMode === "light";
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const heroTitleSize = isLargeScreen ? 76 : isTablet ? 60 : 46;
  const subtitleSize = isLargeScreen ? 22 : isTablet ? 18 : 16;

  const { data, isLoading } = useQuery({
    queryKey: ["welcome-slider", "popular"],
    queryFn: () => fetchTmdbTrailersCollection("popular", 1, 5),
  });

  const slides = useMemo(() => data?.results.slice(0, 5) ?? [], [data]);
  const currentSlide = slides[activeSlide] ?? null;

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, slides.length]);

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

      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
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

          <ThemeToggle />
        </View>

        <View style={styles.hero}>
          <View style={styles.copyBlock}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: heroTitleSize,
                  lineHeight: heroTitleSize * 1.06,
                  color: isLight ? "#0c1723" : "#f6f8fb",
                },
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
              styles.sliderCard,
              isLight ? styles.sliderCardLight : styles.sliderCardDark,
            ]}
          >
            {currentSlide ? (
              <ImageBackground
                source={{ uri: currentSlide.thumbnail }}
                style={styles.sliderImage}
                imageStyle={styles.sliderImageStyle}
              >
                <View style={styles.sliderOverlay} />
                <View style={styles.sliderContent}>
                  <View style={styles.sliderTopRow}>
                    <View
                      style={[
                        styles.sliderPill,
                        isLight ? styles.sliderPillLight : styles.sliderPillDark,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sliderPillText,
                          isLight && styles.sliderPillTextLight,
                        ]}
                      >
                        Сейчас смотрят
                      </Text>
                    </View>

                    <View style={styles.sliderDots}>
                      {slides.map((slide, index) => (
                        <View
                          key={slide.id}
                          style={[
                            styles.sliderDot,
                            index === activeSlide && styles.sliderDotActive,
                          ]}
                        />
                      ))}
                    </View>
                  </View>

                  <Text style={styles.sliderTitle}>{currentSlide.title}</Text>

                  <View style={styles.sliderMetaRow}>
                    <View style={styles.sliderMetaPill}>
                      <Ionicons name="star" size={14} color="#f5c451" />
                      <Text style={styles.sliderMetaText}>
                        {currentSlide.rating.toFixed(1)}
                      </Text>
                    </View>

                    <View style={styles.sliderMetaPill}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#d6e2ee"
                      />
                      <Text style={styles.sliderMetaText}>
                        {formatDate(currentSlide.releaseDate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sliderGenreRow}>
                    {currentSlide.genres.slice(0, 3).map((genre) => (
                      <View key={genre} style={styles.sliderGenreChip}>
                        <Text style={styles.sliderGenreText}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.sliderFallback}>
                {isLoading ? (
                  <>
                    <ActivityIndicator size="large" color="#f5c451" />
                    <Text
                      style={[
                        styles.sliderFallbackText,
                        { color: isLight ? "#61778b" : "#9fb2c4" },
                      ]}
                    >
                      Собираем актуальные трейлеры
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="film-outline"
                      size={34}
                      color={isLight ? "#0d1722" : "#f5c451"}
                    />
                    <Text
                      style={[
                        styles.sliderFallbackText,
                        { color: isLight ? "#61778b" : "#9fb2c4" },
                      ]}
                    >
                      Популярные фильмы и свежие трейлеры
                    </Text>
                  </>
                )}
              </View>
            )}
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

          <View style={styles.featureGrid}>
            {[
              {
                title: "Подборки",
                subtitle: "Популярное и жанры",
                icon: "albums-outline",
              },
              {
                title: "Карточки",
                subtitle: "Рейтинг, актеры, описание",
                icon: "document-text-outline",
              },
              {
                title: "Трейлеры",
                subtitle: "Быстрый переход к фильму",
                icon: "play-circle-outline",
              },
            ].map((item) => (
              <View
                key={item.title}
                style={[styles.featureCard, isLight && styles.featureCardLight]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={isLight ? "#0d1722" : "#f5c451"}
                />
                <Text
                  style={[
                    styles.featureTitle,
                    { color: isLight ? "#0d1722" : "#f4f7fb" },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.featureSubtitle,
                    { color: isLight ? "#61778b" : "#8ea7bd" },
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>
            ))}
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
    maxWidth: 520,
  },
  subtitle: {
    marginTop: 14,
    lineHeight: 24,
    maxWidth: 460,
  },
  sliderCard: {
    minHeight: 260,
    borderRadius: 8,
    overflow: "hidden",
  },
  sliderCardDark: {
    backgroundColor: "rgba(10, 19, 30, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.14)",
  },
  sliderCardLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dde6ee",
  },
  sliderImage: {
    minHeight: 260,
    justifyContent: "flex-end",
  },
  sliderImageStyle: {
    borderRadius: 8,
  },
  sliderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 16, 25, 0.42)",
  },
  sliderContent: {
    padding: 18,
  },
  sliderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderPill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  sliderPillDark: {
    backgroundColor: "rgba(9, 18, 28, 0.72)",
  },
  sliderPillLight: {
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  sliderPillText: {
    color: "#f4f7fb",
    fontSize: 12,
    fontWeight: "800",
  },
  sliderPillTextLight: {
    color: "#0d1722",
  },
  sliderDots: {
    flexDirection: "row",
    gap: 6,
  },
  sliderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  sliderDotActive: {
    backgroundColor: "#f5c451",
    width: 18,
  },
  sliderTitle: {
    color: "#f4f7fb",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    maxWidth: "88%",
  },
  sliderMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  sliderMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(9, 18, 28, 0.72)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sliderMetaText: {
    color: "#f4f7fb",
    fontSize: 13,
    fontWeight: "700",
  },
  sliderGenreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  sliderGenreChip: {
    backgroundColor: "rgba(19, 33, 49, 0.92)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sliderGenreText: {
    color: "#e3edf6",
    fontSize: 12,
    fontWeight: "700",
  },
  sliderFallback: {
    minHeight: 260,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  sliderFallbackText: {
    fontSize: 15,
    textAlign: "center",
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
  featureGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  featureCard: {
    flex: 1,
    minHeight: 108,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(9, 18, 28, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.12)",
    justifyContent: "space-between",
  },
  featureCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#dde6ee",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },
  featureSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
});
