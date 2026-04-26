import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";

import Trailer from "@/components/trailer";
import ThemeToggle from "@/components/theme-toggle";
import { useThemeMode } from "@/components/theme-mode-provider";
import {
  fetchTmdbTrailersCollection,
  TRAILER_COLLECTIONS,
  type TrailerCollectionKey,
  type TrailerItem,
} from "@/constants/tmdb";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

function pickHighlightLabel(rating: number) {
  if (rating >= 8) {
    return "Главный выбор";
  }

  if (rating >= 6.5) {
    return "В тренде";
  }

  return "Свежий трейлер";
}

export default function Home() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { themeMode } = useThemeMode();
  const isLight = themeMode === "light";

  const palette = isLight
    ? {
        background: "#f4f6f8",
        card: "#ffffff",
        cardAlt: "#eef3f7",
        border: "#dde6ee",
        text: "#0d1722",
        muted: "#61778b",
        accent: "#112639",
        accentText: "#ffffff",
        tabBg: "#ffffff",
        tabText: "#3f566b",
        pillBg: "#eef3f7",
        pillText: "#3f566b",
      }
    : {
        background: "#08111b",
        card: "#0f1b28",
        cardAlt: "#132131",
        border: "rgba(167, 199, 231, 0.1)",
        text: "#f4f7fb",
        muted: "#8ea7bd",
        accent: "#f5c451",
        accentText: "#08111b",
        tabBg: "#0f1b28",
        tabText: "#d8e5f2",
        pillBg: "#132131",
        pillText: "#d8e5f2",
      };

  const [selectedCollection, setSelectedCollection] =
    useState<TrailerCollectionKey>("popular");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["trailers", "collection", selectedCollection, page],
    queryFn: () => fetchTmdbTrailersCollection(selectedCollection, page),
  });

  const trailers: TrailerItem[] = data?.results ?? [];
  const featuredTrailer = trailers[0] ?? null;
  const listTrailers = featuredTrailer
    ? trailers.filter((trailer) => trailer.id !== featuredTrailer.id)
    : trailers;

  const averageRating = trailers.length
    ? (
        trailers.reduce((sum, trailer) => sum + trailer.rating, 0) /
        trailers.length
      ).toFixed(1)
    : "—";

  const dominantGenres = useMemo(() => {
    const counts = new Map<string, number>();

    trailers.forEach((trailer) => {
      trailer.genres.forEach((genre) => {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [trailers]);

  const handleCollectionChange = (collection: TrailerCollectionKey) => {
    if (collection === selectedCollection) {
      return;
    }

    setSelectedCollection(collection);
    setPage(1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page || nextPage < 1) {
      return;
    }

    setPage(nextPage);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const isLastPage = Boolean(data?.totalPages && page >= data.totalPages);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        ref={scrollRef}
        style={[styles.screen, { backgroundColor: palette.background }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={isLight ? "#112639" : "#f5c451"}
          />
        }
      >
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.eyebrow, { color: isLight ? "#506579" : "#f5c451" }]}>
              Movie Trailers
            </Text>
            <Text style={[styles.header, { color: palette.text }]}>Трейлеры</Text>
          </View>

          <ThemeToggle />
        </View>

        <Text style={[styles.subheader, { color: palette.muted }]}>
          Популярные подборки, большие релизы и быстрый переход к фильму.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionTabs}
        >
          {TRAILER_COLLECTIONS.map((collection) => {
            const isActive = collection.key === selectedCollection;

            return (
              <TouchableOpacity
                key={collection.key}
                onPress={() => handleCollectionChange(collection.key)}
                style={[
                  styles.collectionTab,
                  {
                    backgroundColor: isActive ? palette.accent : palette.tabBg,
                    borderColor: isActive ? palette.accent : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.collectionTabTitle,
                    {
                      color: isActive ? palette.accentText : palette.tabText,
                    },
                  ]}
                >
                  {collection.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading && (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={isLight ? "#112639" : "#f5c451"}
            />
            <Text style={[styles.stateText, { color: palette.muted }]}>
              Собираем свежую подборку
            </Text>
          </View>
        )}

        {isError && (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.errorTitle, { color: palette.text }]}>
              Не удалось загрузить подборку
            </Text>
            <Text style={[styles.errorText, { color: palette.muted }]}>
              Потяни вниз, чтобы обновить данные.
            </Text>
          </View>
        )}

        {!isLoading && !isError && data && featuredTrailer && (
          <>
            <View
              style={[
                styles.currentCollectionCard,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.currentCollectionTitle, { color: palette.text }]}>
                {data.title}
              </Text>
              <Text style={[styles.currentCollectionMeta, { color: palette.muted }]}>
                Страница {data.page} из {data.totalPages} • {trailers.length} трейлеров
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              style={[styles.heroCard, { borderColor: palette.border }]}
              onPress={() =>
                router.push(
                  {
                    pathname: "/movie/[id]",
                    params: { id: featuredTrailer.id },
                  } as unknown as Href,
                )
              }
            >
              <ImageBackground
                source={{ uri: featuredTrailer.thumbnail }}
                style={styles.heroImage}
                imageStyle={styles.heroImageStyle}
              >
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                  <View
                    style={[
                      styles.heroTag,
                      { backgroundColor: isLight ? "rgba(255,255,255,0.9)" : "rgba(245, 196, 81, 0.92)" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.heroTagText,
                        { color: isLight ? "#0d1722" : "#08111b" },
                      ]}
                    >
                      {pickHighlightLabel(featuredTrailer.rating)}
                    </Text>
                  </View>

                  <Text style={styles.heroTitle}>{featuredTrailer.title}</Text>

                  <View style={styles.heroMetaRow}>
                    <View style={styles.heroMetaPill}>
                      <Ionicons name="star" size={14} color="#f5c451" />
                      <Text style={styles.heroMetaText}>
                        {featuredTrailer.rating.toFixed(1)}
                      </Text>
                    </View>

                    <View style={styles.heroMetaPill}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#d6e2ee"
                      />
                      <Text style={styles.heroMetaText}>
                        {formatDate(featuredTrailer.published)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.heroGenreRow}>
                    {featuredTrailer.genres.slice(0, 3).map((genre) => (
                      <View key={genre} style={styles.heroGenreChip}>
                        <Text style={styles.heroGenreText}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              {[
                { value: trailers.length.toString(), label: "в ленте" },
                { value: averageRating, label: "средний рейтинг" },
                { value: dominantGenres[0]?.[0] ?? "жанры", label: "в фокусе" },
              ].map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.statCard,
                    { backgroundColor: palette.card, borderColor: palette.border },
                  ]}
                >
                  <Text style={[styles.statValue, { color: palette.text }]}>
                    {item.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: palette.muted }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Жанры в подборке
              </Text>
            </View>

            <View style={styles.genreSummaryRow}>
              {dominantGenres.map(([genre, count]) => (
                <View
                  key={genre}
                  style={[
                    styles.genreSummaryChip,
                    { backgroundColor: palette.cardAlt },
                  ]}
                >
                  <Text style={[styles.genreSummaryText, { color: palette.pillText }]}>
                    {genre} • {count}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Все трейлеры
              </Text>
            </View>

            {listTrailers.map((trailer) => (
              <Trailer
                key={trailer.id}
                id={trailer.id}
                title={trailer.title}
                thumbnail={trailer.thumbnail}
                yt_id={trailer.yt_id}
                rating={trailer.rating}
                published={trailer.published}
                genres={trailer.genres}
              />
            ))}

            <View
              style={[
                styles.paginationCard,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <View style={styles.paginationTextWrap}>
                <Text style={[styles.paginationTitle, { color: palette.text }]}>
                  Страницы подборки
                </Text>
                <Text
                  style={[styles.paginationSubtitle, { color: palette.muted }]}
                >
                  {data.title} • страница {data.page} из {data.totalPages}
                </Text>
              </View>

              <View style={styles.paginationActions}>
                <TouchableOpacity
                  onPress={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={[
                    styles.paginationButton,
                    {
                      backgroundColor: page === 1 ? palette.cardAlt : palette.cardAlt,
                    },
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={page === 1 ? "#8aa0b5" : palette.text}
                  />
                  <Text
                    style={[
                      styles.paginationButtonText,
                      { color: page === 1 ? "#8aa0b5" : palette.text },
                    ]}
                  >
                    Назад
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePageChange(page + 1)}
                  disabled={isLastPage}
                  style={[
                    styles.paginationButton,
                    {
                      backgroundColor: isLastPage ? palette.cardAlt : palette.accent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paginationButtonText,
                      {
                        color: isLastPage ? "#8aa0b5" : palette.accentText,
                      },
                    ]}
                  >
                    Дальше
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isLastPage ? "#8aa0b5" : palette.accentText}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  header: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    maxWidth: 250,
  },
  subheader: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    marginBottom: 24,
    maxWidth: 340,
  },
  collectionTabs: {
    gap: 12,
    paddingBottom: 4,
    paddingRight: 20,
  },
  collectionTab: {
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
  },
  collectionTabTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  stateCard: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  stateText: {
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  currentCollectionCard: {
    marginTop: 22,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  currentCollectionTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  currentCollectionMeta: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  heroCard: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    marginTop: 18,
  },
  heroImage: {
    minHeight: 430,
    justifyContent: "flex-end",
  },
  heroImageStyle: {
    borderRadius: 8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 14, 22, 0.42)",
  },
  heroContent: {
    padding: 20,
  },
  heroTag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  heroTagText: {
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#f6f8fb",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    maxWidth: "85%",
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  heroMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(9, 18, 28, 0.72)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroMetaText: {
    color: "#f3f7fb",
    fontSize: 13,
    fontWeight: "700",
  },
  heroGenreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  heroGenreChip: {
    backgroundColor: "rgba(19, 33, 49, 0.92)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  heroGenreText: {
    color: "#e3edf6",
    fontSize: 12,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 21,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "800",
  },
  genreSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreSummaryChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  genreSummaryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  paginationCard: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  paginationTextWrap: {
    marginBottom: 14,
  },
  paginationTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  paginationSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  paginationActions: {
    flexDirection: "row",
    gap: 10,
  },
  paginationButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
