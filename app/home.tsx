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
    return "Неплохой старт";
  }

  return "Свежий трейлер";
}

export default function Home() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor="#f5c451"
          />
        }
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>Movie Trailers</Text>
            <Text style={styles.header}>Трейлеры</Text>
          </View>

          <View style={styles.pageBadge}>
            <Ionicons name="albums-outline" size={16} color="#f5c451" />
            <Text style={styles.pageBadgeText}>
              {data?.page ?? page}/{data?.totalPages ?? "—"}
            </Text>
          </View>
        </View>

        <Text style={styles.subheader}>
          Популярные подборки, большие премьеры и быстрый переход к трейлерам.
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
                  isActive && styles.collectionTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.collectionTabTitle,
                    isActive && styles.collectionTabTitleActive,
                  ]}
                >
                  {collection.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading && (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#f5c451" />
            <Text style={styles.stateText}>Собираем свежую подборку</Text>
          </View>
        )}

        {isError && (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Не удалось загрузить подборку</Text>
            <Text style={styles.errorText}>
              Потяни вниз, чтобы обновить данные.
            </Text>
          </View>
        )}

        {!isLoading && !isError && data && featuredTrailer && (
          <>
            <View style={styles.currentCollectionCard}>
              <Text style={styles.currentCollectionTitle}>{data.title}</Text>
              <Text style={styles.currentCollectionMeta}>
                Страница {data.page} из {data.totalPages} • {trailers.length}{" "}
                трейлеров
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.heroCard}
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
                  <View style={styles.heroTag}>
                    <Text style={styles.heroTagText}>
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
                        color="#c7d7e6"
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

                  <View style={styles.heroActions}>
                    <View style={styles.primaryAction}>
                      <Ionicons name="play" size={16} color="#08111b" />
                      <Text style={styles.primaryActionText}>Открыть фильм</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{trailers.length}</Text>
                <Text style={styles.statLabel}>трейлеров в ленте</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{averageRating}</Text>
                <Text style={styles.statLabel}>средний рейтинг</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.page}</Text>
                <Text style={styles.statLabel}>текущая страница</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Жанры в подборке</Text>
                <Text style={styles.sectionSubtitle}>
                  То, что чаще всего встречается в текущей ленте
                </Text>
              </View>
            </View>

            <View style={styles.genreSummaryRow}>
              {dominantGenres.map(([genre, count]) => (
                <View key={genre} style={styles.genreSummaryChip}>
                  <Text style={styles.genreSummaryText}>
                    {genre} • {count}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Все трейлеры</Text>
                <Text style={styles.sectionSubtitle}>Лента текущей подборки</Text>
              </View>
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

            <View style={styles.paginationCard}>
              <View style={styles.paginationTextWrap}>
                <Text style={styles.paginationTitle}>Страницы подборки</Text>
                <Text style={styles.paginationSubtitle}>
                  {data.title} • страница {data.page} из {data.totalPages}
                </Text>
              </View>

              <View style={styles.paginationActions}>
                <TouchableOpacity
                  onPress={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={[
                    styles.paginationButton,
                    page === 1 && styles.paginationButtonDisabled,
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={page === 1 ? "#5f7388" : "#f4f7fb"}
                  />
                  <Text
                    style={[
                      styles.paginationButtonText,
                      page === 1 && styles.paginationButtonTextDisabled,
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
                    styles.paginationButtonAccent,
                    isLastPage && styles.paginationButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.paginationButtonText,
                      styles.paginationButtonTextAccent,
                      isLastPage && styles.paginationButtonTextDisabled,
                    ]}
                  >
                    Дальше
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isLastPage ? "#5f7388" : "#08111b"}
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
    backgroundColor: "#08111b",
  },
  screen: {
    flex: 1,
    backgroundColor: "#08111b",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
  },
  eyebrow: {
    color: "#f5c451",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  header: {
    color: "#f4f7fb",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    maxWidth: 250,
  },
  subheader: {
    color: "#90a7bc",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    marginBottom: 24,
    maxWidth: 340,
  },
  pageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#132131",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 6,
  },
  pageBadgeText: {
    color: "#d8e5f2",
    fontSize: 13,
    fontWeight: "700",
  },
  collectionTabs: {
    gap: 12,
    paddingBottom: 4,
    paddingRight: 20,
  },
  collectionTab: {
    width: 190,
    minHeight: 64,
    backgroundColor: "#0f1b28",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  collectionTabActive: {
    backgroundColor: "#f5c451",
    borderColor: "#f5c451",
  },
  collectionTabTitle: {
    color: "#f4f7fb",
    fontSize: 16,
    fontWeight: "800",
  },
  collectionTabTitleActive: {
    color: "#08111b",
  },
  stateCard: {
    backgroundColor: "#0f1b28",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.1)",
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  stateText: {
    color: "#d6e2ee",
    fontSize: 15,
  },
  errorTitle: {
    color: "#f4f7fb",
    fontSize: 20,
    fontWeight: "700",
  },
  errorText: {
    color: "#90a7bc",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  currentCollectionCard: {
    marginTop: 22,
    backgroundColor: "#0f1b28",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.1)",
  },
  currentCollectionTitle: {
    color: "#f4f7fb",
    fontSize: 22,
    fontWeight: "800",
  },
  currentCollectionMeta: {
    color: "#cbd8e4",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  heroCard: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.14)",
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
    backgroundColor: "rgba(245, 196, 81, 0.92)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  heroTagText: {
    color: "#08111b",
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
  heroActions: {
    marginTop: 20,
  },
  primaryAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5c451",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryActionText: {
    color: "#08111b",
    fontSize: 14,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    minHeight: 88,
    backgroundColor: "#0f1b28",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  statValue: {
    color: "#f4f7fb",
    fontSize: 21,
    fontWeight: "800",
  },
  statLabel: {
    color: "#90a7bc",
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#f4f7fb",
    fontSize: 23,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#8ea7bd",
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  genreSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreSummaryChip: {
    backgroundColor: "#132131",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  genreSummaryText: {
    color: "#d8e5f2",
    fontSize: 13,
    fontWeight: "700",
  },
  paginationCard: {
    marginTop: 10,
    backgroundColor: "#0f1b28",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  paginationTextWrap: {
    marginBottom: 14,
  },
  paginationTitle: {
    color: "#f4f7fb",
    fontSize: 17,
    fontWeight: "700",
  },
  paginationSubtitle: {
    color: "#8ea7bd",
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
    backgroundColor: "#132131",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  paginationButtonAccent: {
    backgroundColor: "#f5c451",
  },
  paginationButtonDisabled: {
    backgroundColor: "#101a26",
  },
  paginationButtonText: {
    color: "#f4f7fb",
    fontSize: 14,
    fontWeight: "800",
  },
  paginationButtonTextAccent: {
    color: "#08111b",
  },
  paginationButtonTextDisabled: {
    color: "#5f7388",
  },
});
