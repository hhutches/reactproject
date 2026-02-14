export default function MovieCard({ movie, inWatchlist, onToggleWatchlist }) {
  return (
    <article className="card">
      <div className="poster" aria-hidden="true" />
      <div className="cardBody">
        <div className="cardTop">
          <div>
            <h3 className="cardTitle">
              {movie.title} <span className="muted">({movie.year})</span>
            </h3>
            <p className="muted">Placeholder synopsis / review preview.</p>
          </div>
          <div className="rating">★ {movie.rating.toFixed(1)}</div>
        </div>

        <div className="cardActions">
          <button className="button small" onClick={onToggleWatchlist}>
            {inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          </button>
          <button className="button small ghost" type="button">
            Read reviews
          </button>
        </div>
      </div>
    </article>
  );
}