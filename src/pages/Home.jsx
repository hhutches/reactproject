import { tmdbPoster } from "../api/tmdb.js";

/* Convert TMDB 0–10 rating to 0–5, rounded to nearest 0.5 */
function toStars5(voteAvg10) {
  if (typeof voteAvg10 !== "number") return null;
  return Math.round((voteAvg10 / 2) * 2) / 2;
}

/* 5-star display with half-fill using a percent overlay (CSS does the styling) */
function Stars({ value = 0 }) {
  const safe = Math.max(0, Math.min(5, value));
  const percent = (safe / 5) * 100;

  return (
    <span className="stars" aria-label={`${safe.toFixed(1)} out of 5`}>
      <span className="starsBack">★★★★★</span>
      <span className="starsFront" style={{ width: `${percent}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

export default function Home({
  movies = [],
  loading = false,
  errorMsg = "",
  onOpenMovie = () => {},
  watchlistById = {}, // ✅ prevents undefined
  onToggleWatchlist = () => {},
  mode = "home",
}) {
  return (
    <div className="page">
      <h2>{mode === "home" ? "Popular" : "Films"}</h2>

      <p className="muted">
        {mode === "home"
          ? "Popular movies (TMDB) — search above to find any movie."
          : "Browse/search movies (TMDB)."}
      </p>

      {errorMsg ? <p className="muted">{errorMsg}</p> : null}
      {loading ? <p className="muted">Loading…</p> : null}

      <div className="grid">
        {movies.map((m) => {
          const year = m.release_date ? m.release_date.slice(0, 4) : "—";
          const poster = tmdbPoster(m.poster_path);
          const inWatchlist = !!watchlistById?.[m.id];

          const stars5 = toStars5(m.vote_average);

          return (
            <article className="card" key={m.id}>
              {/* Title above everything */}
              <h3 className="cardTitleTop">
                {m.title} <span className="muted">({year})</span>
              </h3>

              <div className="cardContentRow">
                <button
                  className="posterButton"
                  type="button"
                  onClick={() => onOpenMovie(m.id)}
                  aria-label={`Open ${m.title}`}
                >
                  {poster ? (
                    <img
                      className="posterImg"
                      src={poster}
                      alt={`${m.title} poster`}
                    />
                  ) : (
                    <div className="posterFallback" />
                  )}
                </button>

                <div className="cardBody">
                  <p className="muted">
                    {m.overview
                      ? m.overview.slice(0, 90) + "…"
                      : "No overview available."}
                  </p>

                  {/* TMDB avg rating + stars */}
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span className="muted" style={{ fontWeight: 500 }}>
                      Avg rating:
                    </span>

                    {stars5 == null ? (
                      <span className="muted">—</span>
                    ) : (
                      <>
                        <Stars value={stars5} />
                        <span className="muted" style={{ fontWeight: 500 }}>
                          {stars5.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="cardActions">
                    <button
                      className="button small"
                      type="button"
                      onClick={() => onToggleWatchlist(m)}
                    >
                      {inWatchlist
                        ? "Remove from watchlist"
                        : "Add to watchlist"}
                    </button>

                    <button
                      className="button small ghost"
                      type="button"
                      onClick={() => onOpenMovie(m.id)}
                    >
                      Read reviews
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}