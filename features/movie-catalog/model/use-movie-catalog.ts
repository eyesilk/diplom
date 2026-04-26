import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  fetchMovieSearchIndex,
  fetchMovieTrailersCollection,
  type TrailerCollectionKey,
  type TrailerItem,
} from "@/entities/movie";
import {
  matchesMovieSearchQuery,
  normalizeSearchValue,
} from "@/features/movie-catalog/lib/search";

type UseMovieCatalogOptions = {
  onNavigateTop?: () => void;
};

export function useMovieCatalog(options: UseMovieCatalogOptions = {}) {
  const { onNavigateTop } = options;
  const [selectedCollection, setSelectedCollection] =
    useState<TrailerCollectionKey>("popular");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearchQuery = useMemo(
    () => normalizeSearchValue(searchQuery),
    [searchQuery],
  );
  const hasSearchQuery = normalizedSearchQuery.length > 0;

  const collectionQuery = useQuery({
    queryKey: ["trailers", "collection", selectedCollection, page],
    queryFn: () => fetchMovieTrailersCollection(selectedCollection, page),
  });

  const searchIndexQuery = useQuery({
    queryKey: ["trailers", "search-index"],
    queryFn: fetchMovieSearchIndex,
    enabled: hasSearchQuery,
    staleTime: 1000 * 60 * 10,
  });

  const filteredTrailers = useMemo(() => {
    const trailers: TrailerItem[] = collectionQuery.data?.results ?? [];
    const searchSource = hasSearchQuery
      ? (searchIndexQuery.data ?? [])
      : trailers;

    if (!normalizedSearchQuery) {
      return searchSource;
    }

    return searchSource.filter((trailer) =>
      matchesMovieSearchQuery(trailer, normalizedSearchQuery),
    );
  }, [
    collectionQuery.data?.results,
    hasSearchQuery,
    normalizedSearchQuery,
    searchIndexQuery.data,
  ]);

  const featuredTrailer = hasSearchQuery ? null : filteredTrailers[0] ?? null;
  const listTrailers = featuredTrailer
    ? filteredTrailers.filter((trailer) => trailer.id !== featuredTrailer.id)
    : filteredTrailers;

  const averageRating = filteredTrailers.length
    ? (
        filteredTrailers.reduce((sum, trailer) => sum + trailer.rating, 0) /
        filteredTrailers.length
      ).toFixed(1)
    : "—";

  const dominantGenres = useMemo(() => {
    const counts = new Map<string, number>();

    filteredTrailers.forEach((trailer) => {
      trailer.genres.forEach((genre) => {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4);
  }, [filteredTrailers]);

  const changeCollection = (collection: TrailerCollectionKey) => {
    if (collection === selectedCollection) {
      return;
    }

    setSelectedCollection(collection);
    setPage(1);
    onNavigateTop?.();
  };

  const changePage = (nextPage: number) => {
    if (nextPage === page || nextPage < 1) {
      return;
    }

    setPage(nextPage);
    onNavigateTop?.();
  };

  const refresh = () => {
    collectionQuery.refetch();

    if (hasSearchQuery) {
      searchIndexQuery.refetch();
    }
  };

  return {
    selectedCollection,
    page,
    searchQuery,
    setSearchQuery,
    hasSearchQuery,
    data: collectionQuery.data,
    filteredTrailers,
    featuredTrailer,
    listTrailers,
    averageRating,
    dominantGenres,
    isLoading:
      collectionQuery.isLoading || (hasSearchQuery && searchIndexQuery.isLoading),
    isRefreshing:
      (collectionQuery.isFetching && !collectionQuery.isLoading) ||
      (hasSearchQuery &&
        searchIndexQuery.isFetching &&
        !searchIndexQuery.isLoading),
    isError: collectionQuery.isError,
    isLastPage: Boolean(
      collectionQuery.data?.totalPages && page >= collectionQuery.data.totalPages,
    ),
    showSearchEmptyState: hasSearchQuery && filteredTrailers.length === 0,
    showCollectionEmptyState:
      !hasSearchQuery && !featuredTrailer && listTrailers.length === 0,
    changeCollection,
    changePage,
    refresh,
  };
}
