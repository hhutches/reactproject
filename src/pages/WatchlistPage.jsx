export default function WatchlistPage({
  movies = [],
  onOpenMovie = () => {},
  onRemove = () => {},
}) {
  return (
    <div className="page">
      <h2>Watchlist</h2>
      <p className="muted">Movies you saved to watch later.</p>

      {movies.length === 0 ? (
        <div className="panel">
          <p className="muted">Your watchlist is empty.</p>
        </div>
      ) : (
        <div className="panel">
          <ul className="list">
            {movies.map((m) => (
              <li key={m.id} className="listItem">
                <button
                  className="linkButton"
                  type="button"
                  onClick={() => onOpenMovie(m.id)}   // ✅ always pass id
                >
                  {m.title || "Untitled"}
                </button>

                <button
                  className="button small ghost"
                  type="button"
                  onClick={() => onRemove(m.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}