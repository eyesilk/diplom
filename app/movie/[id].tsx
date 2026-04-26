import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import Svg, { Circle } from "react-native-svg";

import ThemeToggle from "@/components/theme-toggle";
import { useThemeMode } from "@/components/theme-mode-provider";
import { fetchMovieDetails } from "@/constants/tmdb";

function formatDate(value: string) {
  if (!value) {
    return "Неизвестно";
  }

  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRuntime(value: number | null) {
  if (!value) {
    return "—";
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (!hours) {
    return `${minutes} мин`;
  }

  return `${hours} ч ${minutes} мин`;
}

function getScoreColor(score: number) {
  if (score < 4) {
    return "#ff5d5d";
  }

  if (score < 7) {
    return "#f5c451";
  }

  return "#21d07a";
}

function ScoreRing({
  score,
  backgroundColor,
  textColor,
  mutedTextColor,
}: {
  score: number;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  const size = 72;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(score / 10, 1));
  const offset = circumference * (1 - progress);
  const color = getScoreColor(score);

  return (
    <View style={styles.scoreRingWrap}>
      <Svg width={size} height={size} style={styles.scoreRingSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.scoreRingInner, { backgroundColor }]}>
        <Text style={[styles.scoreRingValue, { color: textColor }]}>
          {score.toFixed(1)}
        </Text>
        <Text style={[styles.scoreRingLabel, { color: mutedTextColor }]}>
          /10
        </Text>
      </View>
    </View>
  );
}

function SectionHeading({
  title,
  subtitle,
  textColor,
  mutedTextColor,
}: {
  title: string;
  subtitle: string;
  textColor: string;
  mutedTextColor: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: mutedTextColor }]}>
        {subtitle}
      </Text>
    </View>
  );
}

function FactItem({
  icon,
  label,
  value,
  palette,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  palette: {
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
  };
}) {
  return (
    <View
      style={[
        styles.factItem,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View
        style={[styles.factIconWrap, { backgroundColor: palette.surfaceAlt }]}
      >
        <Ionicons name={icon} size={18} color={palette.accent} />
      </View>
      <View style={styles.factTextWrap}>
        <Text style={[styles.factLabel, { color: palette.textMuted }]}>
          {label}
        </Text>
        <Text style={[styles.factValue, { color: palette.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function MovieDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const movieId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { themeMode } = useThemeMode();
  const isLight = themeMode === "light";

  const palette = isLight
    ? {
        background: "#f4f6f8",
        surface: "#ffffff",
        surfaceAlt: "#eef3f7",
        surfaceStrong: "#e7eef5",
        text: "#0d1722",
        textMuted: "#61778b",
        border: "#dde6ee",
        overlay: "rgba(6, 11, 18, 0.28)",
        backButton: "rgba(255, 255, 255, 0.92)",
        backButtonText: "#0d1722",
        accent: "#112639",
        accentText: "#ffffff",
        chip: "#eef3f7",
      }
    : {
        background: "#08111b",
        surface: "#0f1b28",
        surfaceAlt: "#132131",
        surfaceStrong: "#182738",
        text: "#f4f7fb",
        textMuted: "#8ea7bd",
        border: "rgba(167, 199, 231, 0.12)",
        overlay: "rgba(6, 11, 18, 0.5)",
        backButton: "rgba(8, 17, 27, 0.72)",
        backButtonText: "#f4f7fb",
        accent: "#f5c451",
        accentText: "#0c1520",
        chip: "#23384d",
      };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movie-details", movieId],
    queryFn: () => fetchMovieDetails(movieId ?? ""),
    enabled: Boolean(movieId),
  });

  if (isLoading) {
    return (
      <View
        style={[styles.loadingScreen, { backgroundColor: palette.background }]}
      >
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={[styles.loadingText, { color: palette.textMuted }]}>
          Загружаем фильм
        </Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView
        style={[styles.errorScreen, { backgroundColor: palette.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.errorTopBar}>
          <TouchableOpacity
            style={[styles.backButtonStatic, { backgroundColor: palette.surfaceAlt }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={palette.backButtonText} />
            <Text style={[styles.backButtonText, { color: palette.backButtonText }]}>
              К трейлерам
            </Text>
          </TouchableOpacity>
          <ThemeToggle />
        </View>
        <Text style={[styles.errorTitle, { color: palette.text }]}>
          Не удалось загрузить фильм
        </Text>
        <Text style={[styles.errorSubtitle, { color: palette.textMuted }]}>
          Попробуй вернуться к списку и открыть карточку еще раз.
        </Text>
      </SafeAreaView>
    );
  }

  const infoChips = [
    data.releaseDate
      ? new Date(data.releaseDate).getFullYear().toString()
      : null,
    data.runtime ? formatRuntime(data.runtime) : null,
    data.status || null,
  ].filter((item): item is string => Boolean(item));

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={
            data.backdrop
              ? { uri: data.backdrop }
              : require("../../assets/images/background.png")
          }
          style={styles.hero}
        >
          <View style={[styles.heroOverlay, { backgroundColor: palette.overlay }]} />
          <SafeAreaView style={styles.heroSafeArea} edges={["top"]}>
            <View style={styles.heroTopBar}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: palette.backButton }]}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={palette.backButtonText}
                />
                <Text
                  style={[styles.backButtonText, { color: palette.backButtonText }]}
                >
                  Назад
                </Text>
              </TouchableOpacity>
              <ThemeToggle />
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.summaryWrap}>
          <View style={styles.posterWrap}>
            {data.poster ? (
              <Image source={{ uri: data.poster }} style={styles.poster} />
            ) : (
              <View
                style={[
                  styles.poster,
                  styles.posterFallback,
                  { backgroundColor: palette.surfaceAlt },
                ]}
              >
                <Ionicons name="film-outline" size={42} color={palette.textMuted} />
              </View>
            )}
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            {data.tagline ? (
              <Text style={[styles.tagline, { color: palette.accent }]}>
                {data.tagline}
              </Text>
            ) : null}

            <Text style={[styles.title, { color: palette.text }]}>{data.title}</Text>

            {data.originalTitle !== data.title ? (
              <Text style={[styles.originalTitle, { color: palette.textMuted }]}>
                {data.originalTitle}
              </Text>
            ) : null}

            <View style={styles.chipRow}>
              {infoChips.map((chip) => (
                <View
                  key={chip}
                  style={[styles.infoChip, { backgroundColor: palette.surfaceAlt }]}
                >
                  <Text style={[styles.infoChipText, { color: palette.text }]}>
                    {chip}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.scoreSection,
                { backgroundColor: palette.surfaceAlt },
              ]}
            >
              <ScoreRing
                score={data.rating}
                backgroundColor={palette.surfaceStrong}
                textColor={palette.text}
                mutedTextColor={palette.textMuted}
              />
              <View style={styles.scoreTextBlock}>
                <Text style={[styles.scoreHeading, { color: palette.text }]}>
                  Пользовательский рейтинг
                </Text>
                <Text style={[styles.scoreCaption, { color: palette.textMuted }]}>
                  Оценка TMDB на основе{" "}
                  {data.voteCount.toLocaleString("ru-RU")} голосов
                </Text>
              </View>
            </View>

            <View style={styles.genreRow}>
              {data.genres.map((genre) => (
                <View
                  key={genre}
                  style={[styles.genreChip, { backgroundColor: palette.chip }]}
                >
                  <Text style={[styles.genreChipText, { color: palette.text }]}>
                    {genre}
                  </Text>
                </View>
              ))}
            </View>

            {data.director ? (
              <Text style={[styles.creditLine, { color: palette.text }]}>
                Режиссер: {data.director}
              </Text>
            ) : null}

            {data.writers.length ? (
              <Text style={[styles.creditLine, { color: palette.text }]}>
                Сценарий: {data.writers.slice(0, 3).join(", ")}
              </Text>
            ) : null}
          </View>
        </View>

        {data.trailerKey ? (
          <View style={styles.section}>
            <SectionHeading
              title="Трейлер"
              subtitle="Смотри прямо на странице фильма"
              textColor={palette.text}
              mutedTextColor={palette.textMuted}
            />
            <View
              style={[
                styles.playerWrap,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <YoutubePlayer height={220} play={false} videoId={data.trailerKey} />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeading
            title="Описание"
            subtitle="Коротко о сюжете"
            textColor={palette.text}
            mutedTextColor={palette.textMuted}
          />
          <View
            style={[
              styles.textCard,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.overview, { color: palette.text }]}>
              {data.overview || "Для этого фильма пока нет описания."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading
            title="О фильме"
            subtitle="Основные детали"
            textColor={palette.text}
            mutedTextColor={palette.textMuted}
          />
          <View style={styles.factsGrid}>
            <FactItem
              icon="calendar-outline"
              label="Дата выхода"
              value={formatDate(data.releaseDate)}
              palette={palette}
            />
            <FactItem
              icon="time-outline"
              label="Хронометраж"
              value={formatRuntime(data.runtime)}
              palette={palette}
            />
            <FactItem
              icon="globe-outline"
              label="Страны"
              value={data.countries.slice(0, 2).join(", ") || "Неизвестно"}
              palette={palette}
            />
            <FactItem
              icon="chatbubble-ellipses-outline"
              label="Языки"
              value={data.languages.slice(0, 2).join(", ") || "Неизвестно"}
              palette={palette}
            />
            <FactItem
              icon="videocam-outline"
              label="Статус"
              value={data.status || "Неизвестно"}
              palette={palette}
            />
            <FactItem
              icon="business-outline"
              label="Студии"
              value={data.companies.slice(0, 2).join(", ") || "Неизвестно"}
              palette={palette}
            />
          </View>
        </View>

        {data.cast.length ? (
          <View style={styles.castSection}>
            <SectionHeading
              title="Актеры"
              subtitle="Основной состав"
              textColor={palette.text}
              mutedTextColor={palette.textMuted}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castRow}
            >
              {data.cast.map((member) => (
                <View key={member.id} style={styles.castCard}>
                  {member.photo ? (
                    <Image source={{ uri: member.photo }} style={styles.castPhoto} />
                  ) : (
                    <View
                      style={[
                        styles.castPhoto,
                        styles.castFallback,
                        { backgroundColor: palette.surfaceAlt },
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={28}
                        color={palette.textMuted}
                      />
                    </View>
                  )}
                  <Text
                    numberOfLines={2}
                    style={[styles.castName, { color: palette.text }]}
                  >
                    {member.name}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.castRole, { color: palette.textMuted }]}
                  >
                    {member.character || "Роль не указана"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.bottomBackButton, { backgroundColor: palette.accent }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={18} color={palette.accentText} />
          <Text
            style={[styles.bottomBackButtonText, { color: palette.accentText }]}
          >
            Вернуться к трейлерам
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  errorScreen: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  errorTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 28,
  },
  errorSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  hero: {
    height: 280,
    justifyContent: "flex-start",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSafeArea: {
    paddingHorizontal: 20,
  },
  heroTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonStatic: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryWrap: {
    marginTop: -92,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  posterWrap: {
    width: 160,
    zIndex: 2,
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: "#152434",
  },
  posterFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    width: "100%",
    marginTop: 18,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    textAlign: "center",
  },
  originalTitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  infoChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
  },
  scoreRingWrap: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreRingSvg: {
    position: "absolute",
  },
  scoreRingInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreRingValue: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },
  scoreRingLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  scoreTextBlock: {
    flex: 1,
  },
  scoreHeading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  scoreCaption: {
    fontSize: 13,
    lineHeight: 19,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  genreChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  creditLine: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  castSection: {
    paddingTop: 28,
  },
  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  playerWrap: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  textCard: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  overview: {
    fontSize: 16,
    lineHeight: 25,
  },
  factsGrid: {
    gap: 14,
  },
  factItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  factIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  factTextWrap: {
    flex: 1,
  },
  factLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  factValue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  castRow: {
    paddingHorizontal: 20,
    gap: 14,
  },
  castCard: {
    width: 132,
  },
  castPhoto: {
    width: 132,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#152434",
  },
  castFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  castName: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
    lineHeight: 20,
  },
  castRole: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  bottomBackButton: {
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  bottomBackButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
});
