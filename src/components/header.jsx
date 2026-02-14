export default function Header({ query = "", onQueryChange = () => {}, watchlistCount = 0 }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logoDot" aria-hidden="true" />
        <div>
          <div className="brandName">Letterboxd Lite</div>
          <div className="muted">Interactive checkpoint</div>
        </div>
      </div>

      <div className="search">
        <input
          className="searchInput"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search title, year, rating…"
        />
      </div>

      <div className="actions">
        <div className="pill">Watchlist: {watchlistCount}</div>
      </div>
    </header>
  );
}