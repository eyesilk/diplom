import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w780";

type TmdbListResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbMovie[];
};

type TmdbMovie = {
  id: number;
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  genre_ids: number[];
  release_date: string;
  vote_average: number;
};

type TmdbGenresResponse = {
  genres: {
    id: number;
    name: string;
  }[];
};

type TmdbVideosResponse = {
  results: TmdbVideo[];
};

type TmdbVideo = {
  id: string;
  key: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
};

type TmdbMovieDetailsResponse = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  status: string;
  backdrop_path: string | null;
  poster_path: string | null;
  genres: {
    id: number;
    name: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  spoken_languages: {
    english_name: string;
    name: string;
  }[];
  production_companies: {
    id: number;
    name: string;
  }[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
  videos: TmdbVideosResponse;
};

export type TrailerItem = {
  id: string;
  title: string;
  thumbnail: string;
  yt_id: string;
  rating: number;
  published: string;
  genres: string[];
  releaseDate: string;
};

export type TrailerCollectionKey =
  | "popular"
  | "topRated"
  | "family"
  | "action"
  | "animation"
  | "horror"
  | "sciFi"
  | "comedy"
  | "drama"
  | "thriller"
  | "fantasy";

export type TrailerCollectionDefinition = {
  key: TrailerCollectionKey;
  title: string;
};

export const TRAILER_COLLECTIONS: TrailerCollectionDefinition[] = [
  { key: "popular", title: "Популярное" },
  { key: "topRated", title: "Топ рейтинг" },
  { key: "action", title: "Боевики" },
  { key: "family", title: "Семейные" },
  { key: "animation", title: "Анимация" },
  { key: "sciFi", title: "Фантастика" },
  { key: "horror", title: "Ужасы" },
  { key: "thriller", title: "Триллеры" },
  { key: "comedy", title: "Комедии" },
  { key: "drama", title: "Драмы" },
  { key: "fantasy", title: "Фэнтези" },
];

export type TrailerCollectionResponse = {
  collection: TrailerCollectionKey;
  title: string;
  page: number;
  totalPages: number;
  results: TrailerItem[];
};

export type MovieDetails = {
  id: string;
  title: string;
  originalTitle: string;
  overview: string;
  tagline: string | null;
  releaseDate: string;
  runtime: number | null;
  rating: number;
  voteCount: number;
  status: string;
  backdrop: string | null;
  poster: string | null;
  genres: string[];
  trailerKey: string | null;
  countries: string[];
  languages: string[];
  companies: string[];
  director: string | null;
  writers: string[];
  cast: {
    id: string;
    name: string;
    character: string;
    photo: string | null;
  }[];
};

const createDiscoverConfig = (
  title: string,
  extraParams: Record<string, string | number | boolean>,
) => ({
  title,
  path: "/discover/movie",
  extraParams: {
    include_adult: false,
    ...extraParams,
  },
});

const COLLECTION_CONFIG: Record<
  TrailerCollectionKey,
  {
    title: string;
    path: string;
    extraParams?: Record<string, string | number | boolean>;
  }
> = {
  popular: {
    title: "Популярное",
    path: "/movie/popular",
  },
  topRated: {
    title: "Топ рейтинг",
    path: "/movie/top_rated",
  },
  action: createDiscoverConfig("Боевики", {
    with_genres: 28,
    sort_by: "popularity.desc",
  }),
  family: createDiscoverConfig("Семейные", {
    with_genres: 10751,
    sort_by: "popularity.desc",
  }),
  animation: createDiscoverConfig("Анимация", {
    with_genres: 16,
    sort_by: "popularity.desc",
  }),
  horror: createDiscoverConfig("Ужасы", {
    with_genres: 27,
    sort_by: "popularity.desc",
  }),
  sciFi: createDiscoverConfig("Фантастика", {
    with_genres: 878,
    sort_by: "popularity.desc",
  }),
  comedy: createDiscoverConfig("Комедии", {
    with_genres: 35,
    sort_by: "popularity.desc",
  }),
  drama: createDiscoverConfig("Драмы", {
    with_genres: 18,
    sort_by: "popularity.desc",
  }),
  thriller: createDiscoverConfig("Триллеры", {
    with_genres: 53,
    sort_by: "popularity.desc",
  }),
  fantasy: createDiscoverConfig("Фэнтези", {
    with_genres: 14,
    sort_by: "popularity.desc",
  }),
};

const getApiKey = () => {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TMDB API key is missing. Add EXPO_PUBLIC_TMDB_API_KEY to your .env file.",
    );
  }

  return apiKey;
};

const pickTrailerVideo = (videos: TmdbVideo[]) => {
  return (
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official,
    ) ??
    videos.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    ) ??
    videos.find((video) => video.site === "YouTube" && video.type === "Teaser")
  );
};

const formatBackdrop = (path: string | null) =>
  path ? `${TMDB_BACKDROP_BASE_URL}${path}` : null;

const formatPoster = (path: string | null) =>
  path ? `${TMDB_POSTER_BASE_URL}${path}` : null;

const fetchMovieVideos = async (movieId: number, apiKey: string) => {
  const localized = await axios.get<TmdbVideosResponse>(
    `${TMDB_BASE_URL}/movie/${movieId}/videos`,
    {
      params: {
        api_key: apiKey,
        language: "ru-RU",
      },
    },
  );

  if (localized.data.results.length > 0) {
    return localized.data.results;
  }

  const fallback = await axios.get<TmdbVideosResponse>(
    `${TMDB_BASE_URL}/movie/${movieId}/videos`,
    {
      params: {
        api_key: apiKey,
      },
    },
  );

  return fallback.data.results;
};

const mapMoviesToTrailers = async (
  movies: TmdbMovie[],
  genreMap: Map<number, string>,
  apiKey: string,
) => {
  const trailers = await Promise.all(
    movies.map(async (movie) => {
      const videos = await fetchMovieVideos(movie.id, apiKey);
      const trailerVideo = pickTrailerVideo(videos);

      if (!trailerVideo) {
        return null;
      }

      const imagePath =
        formatBackdrop(movie.backdrop_path) ?? formatPoster(movie.poster_path);

      return {
        id: movie.id.toString(),
        title: movie.title,
        thumbnail:
          imagePath ?? `https://i.ytimg.com/vi/${trailerVideo.key}/hqdefault.jpg`,
        yt_id: trailerVideo.key,
        rating: movie.vote_average,
        published: trailerVideo.published_at || movie.release_date,
        genres: movie.genre_ids
          .map((genreId) => genreMap.get(genreId))
          .filter((genreName): genreName is string => Boolean(genreName)),
        releaseDate: movie.release_date,
      };
    }),
  );

  return trailers.filter((trailer): trailer is TrailerItem => Boolean(trailer));
};

export const fetchMovieTrailersCollection = async (
  collection: TrailerCollectionKey,
  page: number,
  minResults = 12,
): Promise<TrailerCollectionResponse> => {
  const apiKey = getApiKey();
  const config = COLLECTION_CONFIG[collection];

  const [firstResponse, genresResponse] = await Promise.all([
    axios.get<TmdbListResponse>(`${TMDB_BASE_URL}${config.path}`, {
      params: {
        api_key: apiKey,
        language: "ru-RU",
        page,
        ...config.extraParams,
      },
    }),
    axios.get<TmdbGenresResponse>(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: apiKey,
        language: "ru-RU",
      },
    }),
  ]);

  const genreMap = new Map(
    genresResponse.data.genres.map((genre) => [genre.id, genre.name]),
  );

  const rawMovies = [...firstResponse.data.results];
  let currentPage = page + 1;

  while (
    rawMovies.length < minResults * 2 &&
    currentPage <= firstResponse.data.total_pages
  ) {
    const response = await axios.get<TmdbListResponse>(
      `${TMDB_BASE_URL}${config.path}`,
      {
        params: {
          api_key: apiKey,
          language: "ru-RU",
          page: currentPage,
          ...config.extraParams,
        },
      },
    );

    rawMovies.push(...response.data.results);
    currentPage += 1;
  }

  const uniqueMovies = Array.from(
    new Map(rawMovies.map((movie) => [movie.id, movie])).values(),
  );

  const trailers = await mapMoviesToTrailers(uniqueMovies, genreMap, apiKey);

  return {
    collection,
    title: config.title,
    page,
    totalPages: firstResponse.data.total_pages,
    results: trailers.slice(0, Math.max(minResults, 10)),
  };
};

export const fetchMovieSearchIndex = async (): Promise<TrailerItem[]> => {
  const collections = await Promise.all(
    TRAILER_COLLECTIONS.map(({ key }) =>
      fetchMovieTrailersCollection(key, 1, 12).then(
        (response) => response.results,
      ),
    ),
  );

  return Array.from(
    new Map(collections.flat().map((trailer) => [trailer.id, trailer])).values(),
  );
};

export const fetchMovieDetails = async (
  movieId: string,
): Promise<MovieDetails> => {
  const apiKey = getApiKey();

  const { data } = await axios.get<TmdbMovieDetailsResponse>(
    `${TMDB_BASE_URL}/movie/${movieId}`,
    {
      params: {
        api_key: apiKey,
        language: "ru-RU",
        append_to_response: "credits,videos",
      },
    },
  );

  const trailerVideo = pickTrailerVideo(data.videos.results);
  const director =
    data.credits.crew.find((member) => member.job === "Director")?.name ?? null;

  const writers = Array.from(
    new Set(
      data.credits.crew
        .filter(
          (member) =>
            member.job === "Writer" ||
            member.job === "Screenplay" ||
            member.job === "Story",
        )
        .map((member) => member.name),
    ),
  );

  return {
    id: data.id.toString(),
    title: data.title,
    originalTitle: data.original_title,
    overview: data.overview,
    tagline: data.tagline,
    releaseDate: data.release_date,
    runtime: data.runtime,
    rating: data.vote_average,
    voteCount: data.vote_count,
    status: data.status,
    backdrop: formatBackdrop(data.backdrop_path),
    poster: formatPoster(data.poster_path),
    genres: data.genres.map((genre) => genre.name),
    trailerKey: trailerVideo?.key ?? null,
    countries: data.production_countries.map((country) => country.name),
    languages: data.spoken_languages.map(
      (language) => language.name || language.english_name,
    ),
    companies: data.production_companies.map((company) => company.name),
    director,
    writers,
    cast: data.credits.cast.slice(0, 10).map((member) => ({
      id: member.id.toString(),
      name: member.name,
      character: member.character,
      photo: formatPoster(member.profile_path),
    })),
  };
};
