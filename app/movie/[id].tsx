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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";

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

function FactItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.factItem}>
      <View style={styles.factIconWrap}>
        <Ionicons name={icon} size={18} color="#f5c451" />
      </View>
      <View style={styles.factTextWrap}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function MovieDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const movieId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movie-details", movieId],
    queryFn: () => fetchMovieDetails(movieId ?? ""),
    enabled: Boolean(movieId),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#f5c451" />
        <Text style={styles.loadingText}>Загружаем фильм</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.errorScreen} edges={["top", "bottom"]}>
        <TouchableOpacity style={styles.backButtonStatic} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#f4f7fb" />
          <Text style={styles.backButtonText}>К трейлерам</Text>
        </TouchableOpacity>
        <Text style={styles.errorTitle}>Не удалось загрузить фильм</Text>
        <Text style={styles.errorSubtitle}>
          Попробуй вернуться к списку и открыть карточку еще раз.
        </Text>
      </SafeAreaView>
    );
  }

  const infoChips = [
    data.releaseDate ? new Date(data.releaseDate).getFullYear().toString() : null,
    data.runtime ? formatRuntime(data.runtime) : null,
    data.status || null,
  ].filter((item): item is string => Boolean(item));

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={
            data.backdrop
              ? { uri: data.backdrop }
              : require("../../assets/images/background.png")
          }
          style={[styles.hero, isWide && styles.heroWide]}
        >
          <View style={styles.heroOverlay} />
          <SafeAreaView style={styles.heroSafeArea} edges={["top"]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#f4f7fb" />
              <Text style={styles.backButtonText}>Назад</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>

        <View style={[styles.summaryBand, isWide && styles.summaryBandWide]}>
          <View style={[styles.summaryRow, isWide && styles.summaryRowWide]}>
            <View style={styles.posterWrap}>
              {data.poster ? (
                <Image source={{ uri: data.poster }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.posterFallback]}>
                  <Ionicons name="film-outline" size={40} color="#9cb3c8" />
                </View>
              )}
            </View>

            <View style={styles.summaryContent}>
              {data.tagline ? <Text style={styles.tagline}>{data.tagline}</Text> : null}
              <Text style={styles.title}>{data.title}</Text>

              {data.originalTitle !== data.title ? (
                <Text style={styles.originalTitle}>{data.originalTitle}</Text>
              ) : null}

              <View style={styles.chipRow}>
                {infoChips.map((chip) => (
                  <View key={chip} style={styles.infoChip}>
                    <Text style={styles.infoChipText}>{chip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.scoreRow}>
                <View style={styles.scoreBadge}>
                  <Ionicons name="star" size={18} color="#0c1520" />
                  <Text style={styles.scoreValue}>{data.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.scoreCaption}>
                  Оценка TMDB на основе {data.voteCount.toLocaleString("ru-RU")} голосов
                </Text>
              </View>

              <View style={styles.genreRow}>
                {data.genres.map((genre) => (
                  <View key={genre} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{genre}</Text>
                  </View>
                ))}
              </View>

              {data.director ? (
                <Text style={styles.creditLine}>Режиссер: {data.director}</Text>
              ) : null}

              {data.writers.length ? (
                <Text style={styles.creditLine}>
                  Сценарий: {data.writers.slice(0, 3).join(", ")}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {data.trailerKey ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Трейлер</Text>
              <Text style={styles.sectionSubtitle}>Смотри прямо здесь</Text>
            </View>
            <View style={styles.playerWrap}>
              <YoutubePlayer height={220} play={false} videoId={data.trailerKey} />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Обзор</Text>
            <Text style={styles.sectionSubtitle}>Коротко о фильме</Text>
          </View>
          <Text style={styles.overview}>
            {data.overview || "Для этого фильма пока нет описания."}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>О фильме</Text>
            <Text style={styles.sectionSubtitle}>Основные детали</Text>
          </View>

          <View style={styles.factsGrid}>
            <FactItem
              icon="calendar-outline"
              label="Дата выхода"
              value={formatDate(data.releaseDate)}
            />
            <FactItem
              icon="time-outline"
              label="Хронометраж"
              value={formatRuntime(data.runtime)}
            />
            <FactItem
              icon="globe-outline"
              label="Страны"
              value={data.countries.slice(0, 2).join(", ") || "Неизвестно"}
            />
            <FactItem
              icon="chatbubble-ellipses-outline"
              label="Языки"
              value={data.languages.slice(0, 2).join(", ") || "Неизвестно"}
            />
            <FactItem
              icon="videocam-outline"
              label="Статус"
              value={data.status || "Неизвестно"}
            />
            <FactItem
              icon="business-outline"
              label="Студии"
              value={data.companies.slice(0, 2).join(", ") || "Неизвестно"}
            />
          </View>
        </View>

        {data.cast.length ? (
          <View style={styles.castSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Актеры</Text>
              <Text style={styles.sectionSubtitle}>Основной состав</Text>
            </View>

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
                    <View style={[styles.castPhoto, styles.castFallback]}>
                      <Ionicons name="person-outline" size={28} color="#9cb3c8" />
                    </View>
                  )}
                  <Text numberOfLines={2} style={styles.castName}>
                    {member.name}
                  </Text>
                  <Text numberOfLines={2} style={styles.castRole}>
                    {member.character || "Роль не указана"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <TouchableOpacity style={styles.bottomBackButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#0c1520" />
          <Text style={styles.bottomBackButtonText}>Вернуться к трейлерам</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#08111b",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#08111b",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#d6e2ee",
    fontSize: 16,
  },
  errorScreen: {
    flex: 1,
    backgroundColor: "#08111b",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  errorTitle: {
    color: "#f4f7fb",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 28,
  },
  errorSubtitle: {
    color: "#9cb3c8",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  hero: {
    height: 260,
    justifyContent: "space-between",
  },
  heroWide: {
    height: 320,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 11, 18, 0.48)",
  },
  heroSafeArea: {
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(8, 17, 27, 0.72)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
  },
  backButtonStatic: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#152434",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#f4f7fb",
    fontSize: 15,
    fontWeight: "600",
  },
  summaryBand: {
    marginTop: -74,
    paddingHorizontal: 20,
  },
  summaryBandWide: {
    marginTop: -92,
    paddingHorizontal: 28,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-end",
  },
  summaryRowWide: {
    gap: 24,
  },
  posterWrap: {
    width: 132,
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
  summaryContent: {
    flex: 1,
    paddingBottom: 10,
  },
  tagline: {
    color: "#f5c451",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    color: "#f4f7fb",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  originalTitle: {
    color: "#9cb3c8",
    fontSize: 15,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  infoChip: {
    backgroundColor: "#132131",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  infoChipText: {
    color: "#d8e5f2",
    fontSize: 13,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5c451",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  scoreValue: {
    color: "#0c1520",
    fontSize: 17,
    fontWeight: "800",
  },
  scoreCaption: {
    flex: 1,
    color: "#9cb3c8",
    fontSize: 13,
    lineHeight: 18,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  genreChip: {
    backgroundColor: "#23384d",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  genreChipText: {
    color: "#f2f6fa",
    fontSize: 13,
    fontWeight: "600",
  },
  creditLine: {
    color: "#d6e2ee",
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
    color: "#f4f7fb",
    fontSize: 24,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#8ea7bd",
    fontSize: 14,
    marginTop: 4,
  },
  playerWrap: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#0f1b28",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.12)",
  },
  overview: {
    color: "#d6e2ee",
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
    backgroundColor: "#0f1b28",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.1)",
  },
  factIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#182738",
    justifyContent: "center",
    alignItems: "center",
  },
  factTextWrap: {
    flex: 1,
  },
  factLabel: {
    color: "#8ea7bd",
    fontSize: 13,
    marginBottom: 4,
  },
  factValue: {
    color: "#f4f7fb",
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
    color: "#f4f7fb",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
    lineHeight: 20,
  },
  castRole: {
    color: "#8ea7bd",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  bottomBackButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#f5c451",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  bottomBackButtonText: {
    color: "#0c1520",
    fontSize: 16,
    fontWeight: "800",
  },
});
