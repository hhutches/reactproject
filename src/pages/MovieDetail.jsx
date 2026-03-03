import { useEffect, useMemo, useRef, useState } from "react";
import StarRating from "../components/StarRating.jsx";
import {
  getMovieCredits,
  getMovieDetails,
  getMovieTrailer,
  tmdbPoster,
  tmdbProfile,
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
  const [cast, setCast] = useState([]);
  const [err, setErr] = useState("");

  // Log form state
  const [logStars, setLogStars] = useState(existingLog?.rating ?? 0);
  const [logReview, setLogReview] = useState(existingLog?.review ?? "");
  const [savedMsg, setSavedMsg] = useState("");

  // Cast scrolling
  const castRowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollButtons() {
    const el = castRowRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    const atLeft = scrollLeft <= 1;
    const atRight = scrollLeft + clientWidth >= scrollWidth - 1;

    setCanScrollLeft(!atLeft);
    setCanScrollRight(!atRight && scrollWidth > clientWidth + 1);
  }

  function scrollCastBy(delta) {
    const el = castRowRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

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
        const [details, trailer, credits] = await Promise.all([
          getMovieDetails(movieId),
          getMovieTrailer(movieId),
          getMovieCredits(movieId),
        ]);

        if (!ignore) {
          setMovie(details);
          setTrailerKey(trailer);
          setCast((credits?.cast || []).slice(0, 20));
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

  // Update scroll arrow visibility when cast loads, resizes, or scrolls
  useEffect(() => {
    updateScrollButtons();

    const onResize = () => updateScrollButtons();
    window.addEventListener("resize", onResize);

    const el = castRowRef.current;
    if (el) el.addEventListener("scroll", updateScrollButtons, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      if (el) el.removeEventListener("scroll", updateScrollButtons);
    };
  }, [cast.length]);

  const hasCast = useMemo(() => cast && cast.length > 0, [cast]);

  if (!movieId) return <p className="muted">No movie selected.</p>;
  if (!movie) return <p className="muted">Loading…</p>;

  const poster = movie.poster_path ? tmdbPoster(movie.poster_path, "w500") : "";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  return (
    <div className="page">
      <button className="button ghost" onClick={onBack}>
        ← Back
      </button>

      {err ? <p className="muted">{err}</p> : null}

      <div className="detail">
        <div className="detailLeft">
          {poster ? (
            <img className="detailPoster" src={poster} alt={`${movie.title} poster`} />
          ) : (
            <div className="detailPosterFallback" />
          )}
        </div>

        <div className="detailRight">
          {/* ✅ keep title readable + consistent (white, bold via h2 styling / global h2 color) */}
          <h2 className="detailTitle">
            {movie.title} <span className="muted">({year})</span>
          </h2>

          <p className="muted">{movie.overview || "No overview available."}</p>

          <div className="detailActions">
            <button className="button" onClick={onToggleWatchlist}>
              {inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            </button>
          </div>

          {/* 🎬 Trailer */}
          <hr className="divider" />
          <h3 className="sectionTitle">Trailer</h3>
          {trailerKey ? (
            <div className="trailerWrap" style={{ marginTop: 10 }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Movie Trailer"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="muted">No trailer available.</p>
          )}

          {/* ⭐ Log Film */}
          <hr className="divider" />
          <h3 className="sectionTitle">Log this film</h3>
          <p className="muted">
            Click stars to rate (click the same star again for a half-star) and optionally add a review.
          </p>

          <div className="reviewForm">
            <StarRating value={logStars} onChange={setLogStars} label="Your rating" size={24} />

            <textarea
              className="textarea"
              value={logReview}
              onChange={(e) => setLogReview(e.target.value)}
              placeholder="Optional review…"
              rows={4}
            />

            <button
              className="button"
              onClick={() => {
                onLogFilm(movie, { rating: logStars, review: logReview.trim() });
                setSavedMsg("Logged!");
                setTimeout(() => setSavedMsg(""), 1200);
              }}
              disabled={logStars < 0 || logStars > 5}
            >
              {existingLog ? "Update log" : "Log film"}
            </button>

            {savedMsg ? <p className="muted">{savedMsg}</p> : null}
            {existingLog ? (
              <p className="muted">You’ve already logged this film — updating will overwrite.</p>
            ) : null}
          </div>

          {/* 📝 Reviews */}
          <hr className="divider" />
          <h3 className="sectionTitle">Reviews</h3>

          {reviews.length === 0 ? (
            <p className="muted">No reviews yet.</p>
          ) : (
            <ul className="reviewList">
              {reviews.map((r) => (
                <li key={r.id} className="reviewItem">
                  <div className="reviewMeta">
                    ★ {r.stars}{" "}
                    <span className="muted">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <div>{r.text}</div>
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: 10 }}>
            <button
              className="button small ghost"
              onClick={() => onAddReview({ text: "Sample review", stars: 4 })}
            >
              (Dev) Add sample review
            </button>
          </div>

          {/* 🎭 Cast */}
          <hr className="divider" />
          <h3 className="sectionTitle">Cast</h3>

          {hasCast ? (
            <div className="castSection">
              <div className="castRow" ref={castRowRef}>
                {cast.map((p) => {
                  const key = p.credit_id ?? p.cast_id ?? p.id;
                  const img = p.profile_path ? tmdbProfile(p.profile_path, "w185") : "";

                  return (
                    <div className="castCard" key={key}>
                      {img ? (
                        <img className="castImg" src={img} alt={p.name} />
                      ) : (
                        <div className="castImgFallback" />
                      )}
                      <div className="castName">{p.name}</div>
                      <div className="muted castRole">{p.character || "—"}</div>
                    </div>
                  );
                })}
              </div>

              {canScrollLeft ? (
                <button
                  type="button"
                  className="castScrollBtn left"
                  aria-label="Scroll cast left"
                  onClick={() => scrollCastBy(-360)}
                  title="Scroll left"
                >
                  ←
                </button>
              ) : null}

              {canScrollRight ? (
                <button
                  type="button"
                  className="castScrollBtn right"
                  aria-label="Scroll cast right"
                  onClick={() => scrollCastBy(360)}
                  title="Scroll right"
                >
                  →
                </button>
              ) : null}
            </div>
          ) : (
            <p className="muted">No cast available.</p>
          )}
        </div>
      </div>
    </div>
  );
}