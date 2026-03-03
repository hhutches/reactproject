export default function MovieCard({
  movie,
  onSelect = () => {},
  onToggleWatchlist = () => {},
  inWatchlist = false,
}) {
  if (!movie) return null;

  // TMDB gives vote_average on a 0–10 scale
  const voteAvg10 = typeof movie.vote_average === "number" ? movie.vote_average : null;

  // Convert to 0–5 stars, rounded to nearest 0.5
  const voteStars5 =
    voteAvg10 == null ? null : Math.round((voteAvg10 / 2) * 2) / 2;

  const posterUrl = movie.poster || movie.poster_path || "";
  const year =
    movie.year ||
    (movie.release_date ? movie.release_date.slice(0, 4) : "");

  const title = movie.title || movie.name || "Untitled";
  const overview = movie.synopsis || movie.overview || "";

  const Stars = ({ value }) => {
    const total = 5;
    const stars = [];

    for (let i = 1; i <= total; i++) {
      const diff = value - i;

      // full: diff >= 0, half: diff >= -0.5, else empty
      const isFull = diff >= 0;
      const isHalf = !isFull && diff >= -0.5;

      stars.push(
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 14,
            textAlign: "center",
            marginRight: 2,
            opacity: 0.95,
          }}
        >
          {isFull ? "★" : isHalf ? "⯪" : "☆"}
        </span>
      );
    }

    return <span style={{ whiteSpace: "nowrap" }}>{stars}</span>;
  };

  return (
    <div className="card">
      <button
        className="posterButton"
        type="button"
        onClick={() => onSelect(movie)}
        aria-label={`Open ${title}`}
      >
        {posterUrl ? (
          <img className="posterImg" src={posterUrl} alt={`${title} poster`} />
        ) : (
          <div className="posterFallback" />
        )}
      </button>

      <div>
        <div className="cardTop">
          <h3 className="cardTitle">
            {title} {year ? <span className="muted">({year})</span> : null}
          </h3>
        </div>

        <p className="muted" style={{ marginTop: 6 }}>
          {overview ? (overview.length > 110 ? overview.slice(0, 110) + "…" : overview) : "No description."}
        </p>

        {/* ✅ Avg rating + stars (TMDB) */}
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="muted" style={{ fontWeight: 500 }}>
            Avg rating:
          </span>

          {voteStars5 == null ? (
            <span className="muted">—</span>
          ) : (
            <>
              <Stars value={voteStars5} />
              <span className="muted" style={{ fontWeight: 500 }}>
                {voteStars5.toFixed(1)}
              </span>
            </>
          )}
        </div>

        <div className="cardActions">
          <button className="button" type="button" onClick={() => onToggleWatchlist(movie)}>
            {inWatchlist ? "Remove" : "Add to watchlist"}
          </button>

          <button className="button" type="button" onClick={() => onSelect(movie)}>
            Read reviews
          </button>
        </div>
      </div>
    </div>
  );
}