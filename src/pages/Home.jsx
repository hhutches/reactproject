import { tmdbPoster } from "../api/tmdb.js";

export default function Home({
  movies = [],
  loading = false,
  errorMsg = "",
  onOpenMovie = () => {},
  watchlistById = {},          // ✅ THIS fixes the undefined reference
  onToggleWatchlist = () => {},
  avgRatingByMovie = {},
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
          const avg = avgRatingByMovie?.[m.id];
          const inWatchlist = !!watchlistById?.[m.id];

          return (
            <article className="card" key={m.id}>
              <button
                className="posterButton"
                type="button"
                onClick={() => onOpenMovie(m.id)}
                aria-label={`Open ${m.title}`}
              >
                {poster ? (
                  <img className="posterImg" src={poster} alt={`${m.title} poster`} />
                ) : (
                  <div className="posterFallback" />
                )}
              </button>

              <div className="cardBody">
                <div className="cardTop">
                  <div>
                    <h3 className="cardTitle">
                      {m.title} <span className="muted">({year})</span>
                    </h3>
                    <p className="muted">
                      {m.overview ? m.overview.slice(0, 90) + "…" : "No overview available."}
                    </p>
                    <p className="muted">
                      Your avg rating: {avg ? avg.toFixed(1) : "—"}
                    </p>
                  </div>
                </div>

                <div className="cardActions">
                  <button className="button small" onClick={() => onToggleWatchlist(m)}>
                    {inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  </button>
                  <button className="button small ghost" onClick={() => onOpenMovie(m.id)}>
                    Read reviews
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}