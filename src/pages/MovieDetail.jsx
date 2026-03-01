import { useEffect, useState } from "react";
import {
  getMovieDetails,
  getMovieTrailer,
  tmdbPoster,
} from "../api/tmdb.js";

export default function MovieDetail({
  movieId,
  inWatchlist,
  onToggleWatchlist,
  onBack,

  existingLog = null,
  onLogFilm = () => {},

  reviews = [],
  onAddReview = () => {},
}) {
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [err, setErr] = useState("");

  // Log form state
  const [logStars, setLogStars] = useState(existingLog?.rating ?? 0);
  const [logReview, setLogReview] = useState(existingLog?.review ?? "");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    setLogStars(existingLog?.rating ?? 0);
    setLogReview(existingLog?.review ?? "");
  }, [existingLog]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!movieId) return;

      setErr("");
      try {
        const [details, trailer] = await Promise.all([
          getMovieDetails(movieId),
          getMovieTrailer(movieId),
        ]);

        if (!ignore) {
          setMovie(details);
          setTrailerKey(trailer);
        }
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load movie");
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [movieId]);

  if (!movieId) {
    return <p className="muted">No movie selected.</p>;
  }

  if (!movie) {
    return <p className="muted">Loading…</p>;
  }

  const poster = movie.poster_path
    ? tmdbPoster(movie.poster_path, "w500")
    : "";

  const year = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "—";

  return (
    <div className="page">
      <button className="button ghost" onClick={onBack}>
        ← Back
      </button>

      {err ? <p className="muted">{err}</p> : null}

      <div className="detail">
        <div className="detailLeft">
          {poster ? (
            <img
              className="detailPoster"
              src={poster}
              alt={`${movie.title} poster`}
            />
          ) : (
            <div className="detailPosterFallback" />
          )}
        </div>

        <div className="detailRight">
          <h2>
            {movie.title}{" "}
            <span className="muted">({year})</span>
          </h2>

          <p className="muted">
            {movie.overview || "No overview available."}
          </p>

          <div className="detailActions">
            <button className="button" onClick={onToggleWatchlist}>
              {inWatchlist
                ? "Remove from watchlist"
                : "Add to watchlist"}
            </button>
          </div>

          {/* 🎬 Trailer Section */}
          <hr className="divider" />
          <h3>Trailer</h3>

          {trailerKey ? (
            <div style={{ marginTop: 10 }}>
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Movie Trailer"
                frameBorder="0"
                allowFullScreen
                style={{ borderRadius: 12 }}
              />
            </div>
          ) : (
            <p className="muted">No trailer available.</p>
          )}

          {/* ⭐ Log Film Section */}
          <hr className="divider" />
          <h3>Log this film</h3>
          <p className="muted">
            This creates an entry in your Films tab.
          </p>

          <div className="reviewForm">
            <label className="muted">
              Rating (0–5):
              <select
                className="select"
                value={logStars}
                onChange={(e) =>
                  setLogStars(Number(e.target.value))
                }
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <textarea
              className="textarea"
              value={logReview}
              onChange={(e) =>
                setLogReview(e.target.value)
              }
              placeholder="Optional review…"
              rows={4}
            />

            <button
              className="button"
              onClick={() => {
                onLogFilm(movie, {
                  rating: logStars,
                  review: logReview.trim(),
                });
                setSavedMsg("Logged!");
                setTimeout(() => setSavedMsg(""), 1200);
              }}
            >
              {existingLog ? "Update log" : "Log film"}
            </button>

            {savedMsg ? (
              <p className="muted">{savedMsg}</p>
            ) : null}
          </div>

          {/* 📝 Optional Separate Reviews */}
          <hr className="divider" />
          <h3>Reviews</h3>

          {reviews.length === 0 ? (
            <p className="muted">No reviews yet.</p>
          ) : (
            <ul className="reviewList">
              {reviews.map((r) => (
                <li key={r.id} className="reviewItem">
                  <div className="reviewMeta">
                    ★ {r.stars}{" "}
                    <span className="muted">
                      {new Date(
                        r.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div>{r.text}</div>
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: 10 }}>
            <button
              className="button small ghost"
              onClick={() =>
                onAddReview({
                  text: "Sample review",
                  stars: 4,
                })
              }
            >
              (Dev) Add sample review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}