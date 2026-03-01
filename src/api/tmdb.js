// src/api/tmdb.js

const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

function assertKey() {
  if (!API_KEY) {
    throw new Error(
      "Missing VITE_TMDB_KEY. Add it to a .env file and restart Vite."
    );
  }
}

export function tmdbPoster(path, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}

/**
 * Popular + Fresh movies:
 * Uses TMDB "discover" so we can combine popularity with a release-date window
 * and a minimum vote count to avoid obscure results.
 */
export async function getPopularMovies({
  monthsBack = 18, // how fresh (last N months)
  minVotes = 200,  // filters out low-vote/obscure titles
  page = 1,
} = {}) {
  assertKey();

  const now = new Date();
  const maxDate = now.toISOString().slice(0, 10);

  const past = new Date();
  past.setMonth(past.getMonth() - monthsBack);
  const minDate = past.toISOString().slice(0, 10);

  const url =
    `${BASE}/discover/movie?api_key=${API_KEY}` +
    `&language=en-US` +
    `&sort_by=popularity.desc` +
    `&include_adult=false` +
    `&include_video=false` +
    `&page=${page}` +
    `&primary_release_date.gte=${minDate}` +
    `&primary_release_date.lte=${maxDate}` +
    `&vote_count.gte=${minVotes}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  const data = await res.json();
  return data.results ?? [];
}

/**
 * Search movies by text query
 */
export async function searchMovies(query, { page = 1 } = {}) {
  assertKey();
  const q = encodeURIComponent(query);
  const url =
    `${BASE}/search/movie?api_key=${API_KEY}` +
    `&language=en-US` +
    `&query=${q}` +
    `&page=${page}` +
    `&include_adult=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to search movies");
  const data = await res.json();
  return data.results ?? [];
}

/**
 * Get full details for a single movie
 */
export async function getMovieDetails(movieId) {
  assertKey();
  const res = await fetch(
    `${BASE}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error("Failed to fetch movie details");
  return await res.json();
}

export async function getMovieTrailer(movieId) {
  assertKey();

  const res = await fetch(
    `${BASE}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
  );

  if (!res.ok) throw new Error("Failed to fetch movie videos");

  const data = await res.json();
  const videos = data.results || [];

  // Prefer official YouTube trailers
  const trailer =
    videos.find(
      (v) =>
        v.site === "YouTube" &&
        v.type === "Trailer" &&
        v.official === true
    ) ||
    videos.find(
      (v) =>
        v.site === "YouTube" &&
        v.type === "Trailer"
    );

  return trailer ? trailer.key : null; // key = YouTube ID
}
