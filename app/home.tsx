import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";

import Trailer from "@/components/trailer";
import { fetchTmdbTrailersPage, type TrailerItem } from "@/constants/tmdb";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

export default function Home() {
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trailers", "tmdb", page, limit],
    queryFn: () => fetchTmdbTrailersPage(page, limit),
  });

  const trailers: TrailerItem[] = data?.results ?? [];
  const isLastPage = Boolean(data?.totalPages && page >= data.totalPages);

  return (
    <ImageBackground
      source={require("../assets/images/background.png")}
      style={styles.background}
    >
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <Text style={styles.header}>Трейлеры</Text>

        {isLoading && <ActivityIndicator size="large" color="#ccc" />}
        {isError && (
          <Text style={styles.errorText}>Ошибка при загрузке данных</Text>
        )}

        {!isLoading && !isError && (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              {trailers.map((trailer) => (
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
            </ScrollView>

            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <Text
                  style={[
                    styles.pageButton,
                    page === 1 && styles.pageButtonDisabled,
                  ]}
                >
                  Назад
                </Text>
              </TouchableOpacity>
              <Text style={styles.pageText}>
                Страница {data?.page ?? page}
                {data?.totalPages ? ` из ${data.totalPages}` : ""}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setPage((p) => {
                    const totalPages = data?.totalPages ?? p + 1;
                    return Math.min(totalPages, p + 1);
                  })
                }
                disabled={isLastPage}
              >
                <Text
                  style={[
                    styles.pageButton,
                    isLastPage && styles.pageButtonDisabled,
                  ]}
                >
                  Вперед
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  header: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: "bold",
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  errorText: {
    color: "#f88",
    fontSize: SCREEN_WIDTH * 0.04,
  },
  scroll: {
    width: "100%",
    maxWidth: 600,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 600,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.01,
  },
  pageButton: {
    color: "#4fa3ff",
    fontSize: SCREEN_WIDTH * 0.04,
  },
  pageButtonDisabled: {
    color: "#5b6d82",
  },
  pageText: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.04,
  },
});
