import { tmdbPoster } from "../api/tmdb.js";

function formatShortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" });
}

export default function WatchlistPage({
  movies = [],
  onOpenMovie = () => {},
  onRemove = () => {},
}) {
  return (
    <div className="page">
      <h2 className="pageTitle">Watchlist</h2>
      <p className="muted">Movies you saved to watch later.</p>

      {movies.length === 0 ? (
        <p className="muted">Your watchlist is empty.</p>
      ) : (
        <div className="grid">
          {movies.map((m) => {
            const year = m.release_date ? m.release_date.slice(0, 4) : "—";
            const poster = tmdbPoster(m.poster_path);
            const addedAt = formatShortDate(m.addedAt);

            return (
              <article className="card card--tight" key={m.id}>
                <div className="cardMetaTopRight muted">
                  {addedAt ? `Added ${addedAt}` : ""}
                </div>

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
                  <h3 className="cardTitle">
                    {m.title} <span className="muted">({year})</span>
                  </h3>

                  <p className="muted thinText">
                    {m.overview ? m.overview.slice(0, 90) + "…" : "No overview available."}
                  </p>

                  <div className="cardActions">
                    <button className="button small ghost" onClick={() => onOpenMovie(m.id)}>
                      View
                    </button>
                    <button className="button small" onClick={() => onRemove(m.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}