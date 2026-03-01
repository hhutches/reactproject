import { tmdbPoster } from "../api/tmdb.js";

export default function FilmsPage({ logs = [], onOpenMovie = () => {}, onRemoveLog = () => {} }) {
  return (
    <div className="page">
      <h2>Films</h2>
      <p className="muted">All films you’ve logged with your rating (and optional review).</p>

      {logs.length === 0 ? (
        <div className="panel">
          <p className="muted">No films logged yet. Open a movie and click “Log film”.</p>
        </div>
      ) : (
        <div className="grid">
          {logs
            .slice()
            .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
            .map((entry) => {
              const m = entry.movie || {};
              const year = m.release_date ? m.release_date.slice(0, 4) : "—";
              const poster = tmdbPoster(m.poster_path);

              return (
                <article className="card" key={m.id}>
                  <button
                    className="posterButton"
                    type="button"
                    onClick={() => onOpenMovie(m.id)}
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
                        <p className="muted">Your rating: ★ {entry.rating}</p>
                        {entry.review ? (
                          <p className="muted">
                            “{entry.review.length > 90 ? entry.review.slice(0, 90) + "…" : entry.review}”
                          </p>
                        ) : (
                          <p className="muted">No review written.</p>
                        )}
                      </div>
                    </div>

                    <div className="cardActions">
                      <button className="button small ghost" onClick={() => onOpenMovie(m.id)}>
                        View
                      </button>
                      <button className="button small" onClick={() => onRemoveLog(m.id)}>
                        Remove log
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