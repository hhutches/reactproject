import MovieCard from "../components/MovieCard.jsx";
import Section from "../components/section.jsx";

export default function Home({
  movies = [],
  query = "",
  sortMode = "popular",
  onSortChange = () => {},
  watchlistIds = new Set(),
  onToggleWatchlist = () => {},
  watchlistMovies = [],
}) {
  return (
    <div className="page">
      <Section
        title="Home"
        subtitle="Core flow: search → read reviews → add to watchlist"
      >
        <div className="controls">
          <div className="controlGroup">
            <label className="controlLabel" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              className="select"
              value={sortMode}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="popular">Popular (rating)</option>
              <option value="title">Title (A–Z)</option>
              <option value="year">Year (newest)</option>
            </select>
          </div>

          <div className="muted">
            {query.trim()
              ? `Results for “${query.trim()}”: ${movies.length}`
              : `Showing: ${movies.length}`}
          </div>
        </div>

        <div className="grid">
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              inWatchlist={watchlistIds.has(m.id)}
              onToggleWatchlist={() => onToggleWatchlist(m.id)}
            />
          ))}
        </div>
      </Section>

      <Section title="Watchlist Preview" subtitle="Updates via state + click events">
        <div className="panel">
          {watchlistMovies.length === 0 ? (
            <p className="muted">Your watchlist is empty. Add a movie above.</p>
          ) : (
            <ul className="list">
              {watchlistMovies.map((m) => (
                <li key={m.id} className="listItem">
                  <span>
                    {m.title} <span className="muted">({m.year})</span>
                  </span>
                  <button
                    className="button small ghost"
                    onClick={() => onToggleWatchlist(m.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </div>
  );
}