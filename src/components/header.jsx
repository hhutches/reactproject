export default function Header({
  query = "",
  onQueryChange = () => {},
  watchlistCount = 0,
  onBrandClick = () => {}, // ✅ NEW
}) {
  return (
    <header className="header">
      {/* ✅ clickable brand (green dot) */}
      <button
        type="button"
        className="brandButton"
        onClick={onBrandClick}
        aria-label="Back to login"
        title="Back to login"
      >
        <div className="logoDot" aria-hidden="true" />
        <div className="brandText">
          <div className="brandName">Letterboxd Lite</div>
          <div className="muted">Click to return to login</div>
        </div>
      </button>

      <div className="search">
        <input
          className="searchInput"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search title…"
        />
      </div>

      <div className="actions">
        <div className="pill">Watchlist: {watchlistCount}</div>
      </div>
    </header>
  );
}