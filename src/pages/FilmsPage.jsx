import { tmdbPoster } from "../api/tmdb.js";

function formatShortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" });
}

// 0..5 in 0.5 steps
function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <span className="stars" aria-label={`${v} out of 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className="star filled">★</span>
      ))}
      {half ? <span className="star half">★</span> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="star">★</span>
      ))}
    </span>
  );
}

export default function FilmsPage({
  logs = [],
  onOpenMovie = () => {},
  onRemoveLog = () => {},
}) {
  return (
    <div className="page">
      <h2 className="pageTitle">Films</h2>
      <p className="muted">All films you’ve logged with your rating (and optional review).</p>

      {logs.length === 0 ? (
        <p className="muted">No films logged yet.</p>
      ) : (
        <div className="grid">
          {logs.map((entry) => {
            const m = entry?.movie || {};
            const year = m.release_date ? m.release_date.slice(0, 4) : "—";
            const poster = tmdbPoster(m.poster_path);
            const loggedAt = formatShortDate(entry.createdAt);

            return (
              <article className="card card--tight" key={m.id}>
                <div className="cardMetaTopRight muted">
                  {loggedAt ? `Logged ${loggedAt}` : ""}
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
                    {entry.review?.trim()
                      ? entry.review.trim()
                      : (m.overview ? m.overview.slice(0, 90) + "…" : "No review written.")}
                  </p>

                  <div className="ratingRow">
                    <span className="muted ratingLabel">Your rating:</span>
                    <Stars value={entry.rating} />
                    <span className="muted ratingNumber">{Number(entry.rating || 0).toFixed(1)}</span>
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