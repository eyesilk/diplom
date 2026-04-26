import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";

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

      const imagePath = movie.backdrop_path ?? movie.poster_path;

      return {
        id: movie.id.toString(),
        title: movie.title,
        thumbnail: imagePath
          ? `${TMDB_IMAGE_BASE_URL}${imagePath}`
          : `https://i.ytimg.com/vi/${trailerVideo.key}/hqdefault.jpg`,
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
