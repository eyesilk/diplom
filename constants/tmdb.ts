import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w780";

type TmdbUpcomingResponse = {
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
  genres: Array<{
    id: number;
    name: string;
  }>;
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
  genres: Array<{
    id: number;
    name: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages: Array<{
    english_name: string;
    name: string;
  }>;
  production_companies: Array<{
    id: number;
    name: string;
  }>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
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
};

type TrailerPageResponse = {
  page: number;
  totalPages: number;
  totalResults: number;
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
  cast: Array<{
    id: string;
    name: string;
    character: string;
    photo: string | null;
  }>;
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

export const fetchTmdbTrailersPage = async (
  page: number,
  limit = 10,
): Promise<TrailerPageResponse> => {
  const apiKey = getApiKey();

  const [moviesResponse, genresResponse] = await Promise.all([
    axios.get<TmdbUpcomingResponse>(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: {
        api_key: apiKey,
        language: "ru-RU",
        page,
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

  const candidateMovies = moviesResponse.data.results.slice(
    0,
    Math.max(limit * 2, 12),
  );

  const trailers = await Promise.all(
    candidateMovies.map(async (movie) => {
      const { data: videosResponse } = await axios.get<TmdbVideosResponse>(
        `${TMDB_BASE_URL}/movie/${movie.id}/videos`,
        {
          params: {
            api_key: apiKey,
            language: "ru-RU",
          },
        },
      );

      const trailerVideo = pickTrailerVideo(videosResponse.results);

      if (!trailerVideo) {
        return null;
      }

      const imagePath = formatBackdrop(movie.backdrop_path) ?? formatPoster(movie.poster_path);

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
      };
    }),
  );

  return {
    page: moviesResponse.data.page,
    totalPages: moviesResponse.data.total_pages,
    totalResults: moviesResponse.data.total_results,
    results: trailers
      .filter((trailer): trailer is TrailerItem => Boolean(trailer))
      .slice(0, limit),
  };
};

export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
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
