import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import ThemeToggle from "@/components/theme-toggle";
import { useThemeMode } from "@/components/theme-mode-provider";
import { fetchTmdbTrailersCollection, type TrailerItem } from "@/constants/tmdb";
import { useThemeFade } from "@/hooks/use-theme-fade";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

export default function WelcomeScreen() {
  const router = useRouter();
  const sliderRef = useRef<FlatList<TrailerItem>>(null);
  const activeSlideRef = useRef(0);
  const { width } = useWindowDimensions();
  const { themeMode } = useThemeMode();
  const fadeOpacity = useThemeFade(themeMode);
  const [activeSlide, setActiveSlide] = useState(0);

  const isLight = themeMode === "light";
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const sliderWidth = width - 40;

  const heroTitleSize = isLargeScreen ? 76 : isTablet ? 60 : 46;
  const subtitleSize = isLargeScreen ? 22 : isTablet ? 18 : 16;

  const { data, isLoading } = useQuery({
    queryKey: ["welcome-slider", "popular"],
    queryFn: () => fetchTmdbTrailersCollection("popular", 1, 5),
  });

  const slides = useMemo(() => data?.results.slice(0, 5) ?? [], [data]);

  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      const next = (activeSlideRef.current + 1) % slides.length;
      activeSlideRef.current = next;
      setActiveSlide(next);
      sliderRef.current?.scrollToIndex({ index: next, animated: true });
    }, 4200);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (activeSlide >= slides.length) {
      activeSlideRef.current = 0;
      setActiveSlide(0);
    }
  }, [activeSlide, slides.length]);

  const handleSliderScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (slides.length === 0) {
        return;
      }

      const index = Math.round(event.nativeEvent.contentOffset.x / sliderWidth);
      const boundedIndex = Math.max(0, Math.min(index, slides.length - 1));

      if (boundedIndex !== activeSlideRef.current) {
        activeSlideRef.current = boundedIndex;
        setActiveSlide(boundedIndex);
      }
    },
    [sliderWidth, slides.length],
  );

  const renderSlide = ({ item }: { item: TrailerItem }) => (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={() =>
        router.push(
          {
            pathname: "/movie/[id]",
            params: { id: item.id },
          } as unknown as Href,
        )
      }
      style={{ width: sliderWidth }}
    >
      <ImageBackground
        source={{ uri: item.thumbnail }}
        style={styles.slideImage}
        imageStyle={styles.slideImageStyle}
      >
        <View style={styles.slideOverlay} />
        <View style={styles.slideContent}>
          <View style={styles.slideTopRow}>
            <View
              style={[
                styles.slidePill,
                isLight ? styles.slidePillLight : styles.slidePillDark,
              ]}
            >
              <Text
                style={[
                  styles.slidePillText,
                  isLight && styles.slidePillTextLight,
                ]}
              >
                Сейчас смотрят
              </Text>
            </View>

            <View style={styles.slideTapHint}>
              <Ionicons name="open-outline" size={14} color="#f4f7fb" />
            </View>
          </View>

          <Text style={styles.slideTitle}>{item.title}</Text>

          <View style={styles.slideMetaRow}>
            <View style={styles.slideMetaPill}>
              <Ionicons name="star" size={14} color="#f5c451" />
              <Text style={styles.slideMetaText}>{item.rating.toFixed(1)}</Text>
            </View>

            <View style={styles.slideMetaPill}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#d6e2ee"
              />
              <Text style={styles.slideMetaText}>
                {formatDate(item.releaseDate)}
              </Text>
            </View>
          </View>

          <View style={styles.slideGenreRow}>
            {item.genres.slice(0, 3).map((genre) => (
              <View key={genre} style={styles.slideGenreChip}>
                <Text style={styles.slideGenreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

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

      <Animated.View style={[styles.screen, { opacity: fadeOpacity }]}>
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
              <Text
                style={[styles.brandText, isLight && styles.brandTextLight]}
              >
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
                styles.sliderShell,
                isLight ? styles.sliderShellLight : styles.sliderShellDark,
              ]}
            >
              {slides.length > 0 ? (
                <>
                  <FlatList
                    ref={sliderRef}
                    data={slides}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSlide}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    bounces={false}
                    snapToInterval={sliderWidth}
                    snapToAlignment="start"
                    onScroll={handleSliderScroll}
                    scrollEventThrottle={16}
                    getItemLayout={(_, index) => ({
                      length: sliderWidth,
                      offset: sliderWidth * index,
                      index,
                    })}
                    onScrollToIndexFailed={() => undefined}
                  />

                  <View style={styles.sliderFooter}>
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

                    <Text
                      style={[
                        styles.sliderHelperText,
                        { color: isLight ? "#61778b" : "#9fb2c4" },
                      ]}
                    >
                      Свайпни или нажми на фильм
                    </Text>
                  </View>
                </>
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
              style={[
                styles.button,
                isLight ? styles.buttonLight : styles.buttonDark,
              ]}
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
                  subtitle: "Жанры и популярные релизы",
                  icon: "albums-outline",
                },
                {
                  title: "Карточки",
                  subtitle: "Рейтинг, актеры и описание",
                  icon: "document-text-outline",
                },
                {
                  title: "Поиск",
                  subtitle: "Быстрый доступ к нужному фильму",
                  icon: "search-outline",
                },
              ].map((item) => (
                <View
                  key={item.title}
                  style={[
                    styles.featureCard,
                    isLight && styles.featureCardLight,
                  ]}
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
      </Animated.View>
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
  sliderShell: {
    minHeight: 320,
    borderRadius: 8,
    overflow: "hidden",
  },
  sliderShellDark: {
    backgroundColor: "rgba(10, 19, 30, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.14)",
  },
  sliderShellLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dde6ee",
  },
  slideImage: {
    minHeight: 260,
    justifyContent: "flex-end",
  },
  slideImageStyle: {
    borderRadius: 8,
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 16, 25, 0.42)",
  },
  slideContent: {
    padding: 18,
  },
  slideTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  slidePill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  slidePillDark: {
    backgroundColor: "rgba(9, 18, 28, 0.72)",
  },
  slidePillLight: {
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  slidePillText: {
    color: "#f4f7fb",
    fontSize: 12,
    fontWeight: "800",
  },
  slidePillTextLight: {
    color: "#0d1722",
  },
  slideTapHint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(9, 18, 28, 0.72)",
    justifyContent: "center",
    alignItems: "center",
  },
  slideTitle: {
    color: "#f4f7fb",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    maxWidth: "88%",
  },
  slideMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  slideMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(9, 18, 28, 0.72)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  slideMetaText: {
    color: "#f4f7fb",
    fontSize: 13,
    fontWeight: "700",
  },
  slideGenreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  slideGenreChip: {
    backgroundColor: "rgba(19, 33, 49, 0.92)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  slideGenreText: {
    color: "#e3edf6",
    fontSize: 12,
    fontWeight: "700",
  },
  sliderFooter: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 12,
    alignItems: "center",
  },
  sliderDots: {
    flexDirection: "row",
    gap: 6,
  },
  sliderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(143, 167, 189, 0.38)",
  },
  sliderDotActive: {
    width: 18,
    backgroundColor: "#f5c451",
  },
  sliderHelperText: {
    fontSize: 13,
    marginTop: 10,
  },
  sliderFallback: {
    minHeight: 320,
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
