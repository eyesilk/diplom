import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";

import {
  MovieTrailerCard,
  TRAILER_COLLECTIONS,
  type TrailerItem,
} from "@/entities/movie";
import { useMovieCatalog } from "@/features/movie-catalog";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { useResponsiveLayout } from "@/shared/lib/use-responsive-layout";
import { useThemeFade } from "@/shared/lib/use-theme-fade";
import { useThemeMode } from "@/shared/model";

type HomePalette = {
  background: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  tabBg: string;
  tabText: string;
  pillText: string;
  inputBg: string;
  inputPlaceholder: string;
};

function getHomePalette(isLight: boolean): HomePalette {
  return isLight
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
        pillText: "#3f566b",
        inputBg: "#ffffff",
        inputPlaceholder: "#8aa0b5",
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
        pillText: "#d8e5f2",
        inputBg: "#0f1b28",
        inputPlaceholder: "#8ea7bd",
      };
}

function formatHomeDate(value: string) {
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

function StateCard({
  palette,
  title,
  description,
  loading = false,
  compact = false,
}: {
  palette: HomePalette;
  title: string;
  description: string;
  loading?: boolean;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.stateCard,
        compact && styles.stateCardCompact,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      {loading ? <ActivityIndicator size="large" color={palette.accent} /> : null}
      <Text style={[styles.errorTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.errorText, { color: palette.muted }]}>
        {description}
      </Text>
    </View>
  );
}

function PaginationCard({
  palette,
  title,
  page,
  totalPages,
  isCompact,
  isLastPage,
  onPrev,
  onNext,
}: {
  palette: HomePalette;
  title: string;
  page: number;
  totalPages: number;
  isCompact: boolean;
  isLastPage: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
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
        <Text style={[styles.paginationSubtitle, { color: palette.muted }]}>
          {title} • страница {page} из {totalPages}
        </Text>
      </View>

      <View
        style={[
          styles.paginationActions,
          isCompact && styles.paginationActionsCompact,
        ]}
      >
        <TouchableOpacity
          onPress={onPrev}
          disabled={page === 1}
          style={[
            styles.paginationButton,
            { backgroundColor: palette.cardAlt },
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
          onPress={onNext}
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
              { color: isLastPage ? "#8aa0b5" : palette.accentText },
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
  );
}

export default function HomePage() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeMode();
  const { isCompact, isTablet, isLargeScreen } = useResponsiveLayout();
  const fadeOpacity = useThemeFade(themeMode);
  const isLight = themeMode === "light";
  const palette = getHomePalette(isLight);
  const screenPadding = isLargeScreen ? 32 : isTablet ? 28 : isCompact ? 16 : 20;
  const heroHeight = isTablet ? 520 : isCompact ? 360 : 430;
  const headerSize = isLargeScreen ? 42 : isTablet ? 38 : isCompact ? 30 : 34;

  const {
    selectedCollection,
    page,
    searchQuery,
    setSearchQuery,
    hasSearchQuery,
    data,
    filteredTrailers,
    featuredTrailer,
    listTrailers,
    averageRating,
    dominantGenres,
    isLoading,
    isRefreshing,
    isError,
    isLastPage,
    showSearchEmptyState,
    showCollectionEmptyState,
    changeCollection,
    changePage,
    refresh,
  } = useMovieCatalog({
    onNavigateTop: () => scrollRef.current?.scrollTo({ y: 0, animated: true }),
  });

  const pushMovie = (trailer: TrailerItem) => {
    router.push(
      {
        pathname: "/movie/[id]",
        params: { id: trailer.id },
      } as unknown as Href,
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <Animated.View style={[styles.screen, { opacity: fadeOpacity }]}>
        <ScrollView
          ref={scrollRef}
          style={[styles.screen, { backgroundColor: palette.background }]}
          contentContainerStyle={{
            paddingHorizontal: screenPadding,
            paddingBottom: Math.max(insets.bottom + 20, 36),
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={palette.accent}
            />
          }
        >
          <View style={styles.topBar}>
            <View style={styles.topBarTextWrap}>
              <Text
                style={[
                  styles.eyebrow,
                  { color: isLight ? "#506579" : "#f5c451" },
                ]}
              >
                Movie Trailers
              </Text>
              <Text
                style={[
                  styles.header,
                  {
                    color: palette.text,
                    fontSize: headerSize,
                    lineHeight: headerSize * 1.15,
                  },
                ]}
              >
                Трейлеры
              </Text>
            </View>

            <ThemeSwitcher />
          </View>

          <Text style={[styles.subheader, { color: palette.muted }]}>
            Популярные подборки, большие релизы и быстрый переход к карточке
            фильма.
          </Text>

          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                minHeight: isCompact ? 48 : 52,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={palette.inputPlaceholder}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Поиск"
              placeholderTextColor={palette.inputPlaceholder}
              style={[styles.searchInput, { color: palette.text }]}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={palette.inputPlaceholder}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={Platform.OS === "android"}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 4,
              paddingRight: screenPadding,
            }}
          >
            {TRAILER_COLLECTIONS.map((collection) => {
              const isActive = collection.key === selectedCollection;

              return (
                <TouchableOpacity
                  key={collection.key}
                  onPress={() => changeCollection(collection.key)}
                  style={[
                    styles.collectionTab,
                    {
                      minHeight: isCompact ? 56 : 64,
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

          {isLoading ? (
            <StateCard
              palette={palette}
              title="Загрузка"
              description={
                hasSearchQuery
                  ? "Собираем глобальный индекс фильмов"
                  : "Собираем свежую подборку"
              }
              loading
            />
          ) : null}

          {isError ? (
            <StateCard
              palette={palette}
              title="Не удалось загрузить подборку"
              description="Потяни вниз, чтобы обновить данные."
            />
          ) : null}

          {!isLoading && !isError && data ? (
            <>
              <View
                style={[
                  styles.currentCollectionCard,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <Text
                  style={[styles.currentCollectionTitle, { color: palette.text }]}
                >
                  {hasSearchQuery ? "Глобальный поиск" : data.title}
                </Text>
                <Text
                  style={[styles.currentCollectionMeta, { color: palette.muted }]}
                >
                  {hasSearchQuery
                    ? `Во всех подборках найдено ${filteredTrailers.length}`
                    : `Страница ${data.page} из ${data.totalPages} • в ленте ${filteredTrailers.length}`}
                </Text>
              </View>

              {featuredTrailer ? (
                <TouchableOpacity
                  activeOpacity={0.92}
                  style={[styles.heroCard, { borderColor: palette.border }]}
                  onPress={() => pushMovie(featuredTrailer)}
                >
                  <ImageBackground
                    source={{ uri: featuredTrailer.thumbnail }}
                    style={[styles.heroImage, { minHeight: heroHeight }]}
                    imageStyle={styles.heroImageStyle}
                  >
                    <View style={styles.heroOverlay} />
                    <View style={styles.heroContent}>
                      <View
                        style={[
                          styles.heroTag,
                          {
                            backgroundColor: isLight
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(245, 196, 81, 0.92)",
                          },
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

                      <Text
                        style={[
                          styles.heroTitle,
                          {
                            fontSize: isTablet ? 36 : isCompact ? 24 : 30,
                            lineHeight: isTablet ? 42 : isCompact ? 30 : 36,
                          },
                        ]}
                      >
                        {featuredTrailer.title}
                      </Text>

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
                            {formatHomeDate(featuredTrailer.published)}
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
              ) : null}

              {filteredTrailers.length > 0 ? (
                <>
                  <View
                    style={[
                      styles.statsRow,
                      isCompact && styles.statsRowCompact,
                    ]}
                  >
                    {[
                      {
                        value: filteredTrailers.length.toString(),
                        label: hasSearchQuery ? "найдено" : "в ленте",
                      },
                      { value: averageRating, label: "средний рейтинг" },
                      {
                        value: dominantGenres[0]?.[0] ?? "жанры",
                        label: "в фокусе",
                      },
                    ].map((item) => (
                      <View
                        key={item.label}
                        style={[
                          styles.statCard,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                          },
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
                        <Text
                          style={[
                            styles.genreSummaryText,
                            { color: palette.pillText },
                          ]}
                        >
                          {genre} • {count}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>
                  {hasSearchQuery ? "Результаты поиска" : "Все трейлеры"}
                </Text>
              </View>

              {showSearchEmptyState ? (
                <View
                  style={[
                    styles.emptyStateCard,
                    { backgroundColor: palette.card, borderColor: palette.border },
                  ]}
                >
                  <View
                    style={[
                      styles.emptyStateIconWrap,
                      { backgroundColor: palette.cardAlt },
                    ]}
                  >
                    <Ionicons
                      name="search-outline"
                      size={28}
                      color={palette.accent}
                    />
                  </View>
                  <Text style={[styles.errorTitle, { color: palette.text }]}>
                    Ничего не найдено
                  </Text>
                  <Text style={[styles.errorText, { color: palette.muted }]}>
                    Попробуйте изменить запрос.
                  </Text>
                </View>
              ) : null}

              {showCollectionEmptyState ? (
                <StateCard
                  palette={palette}
                  title="Пока здесь пусто"
                  description="Перелистните страницу или откройте другую подборку."
                  compact
                />
              ) : null}

              {listTrailers.map((trailer) => (
                <MovieTrailerCard
                  key={trailer.id}
                  title={trailer.title}
                  thumbnail={trailer.thumbnail}
                  rating={trailer.rating}
                  published={trailer.published}
                  genres={trailer.genres}
                  onPress={() => pushMovie(trailer)}
                />
              ))}

              {!hasSearchQuery ? (
                <PaginationCard
                  palette={palette}
                  title={data.title}
                  page={page}
                  totalPages={data.totalPages}
                  isCompact={isCompact}
                  isLastPage={isLastPage}
                  onPrev={() => changePage(page - 1)}
                  onNext={() => changePage(page + 1)}
                />
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </Animated.View>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
  },
  topBarTextWrap: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  header: {
    fontWeight: "800",
    maxWidth: 280,
  },
  subheader: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    marginBottom: 18,
    maxWidth: 420,
  },
  searchBar: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  collectionTab: {
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
  stateCardCompact: {
    marginTop: 4,
  },
  emptyStateCard: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 4,
  },
  emptyStateIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
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
    fontWeight: "800",
    maxWidth: "88%",
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
  statsRowCompact: {
    flexDirection: "column",
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
  paginationActionsCompact: {
    flexDirection: "column",
  },
  paginationButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
