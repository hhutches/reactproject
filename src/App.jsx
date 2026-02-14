import { useMemo, useState } from "react";
import Header from "./components/header.jsx";
import Nav from "./components/nav.jsx";
import Home from "./pages/Home.jsx";
import "./styles/App.css";

const INITIAL_MOVIES = [
  { id: 1, title: "Parasite", year: 2019, rating: 4.5 },
  { id: 2, title: "Interstellar", year: 2014, rating: 4.3 },
  { id: 3, title: "The Social Network", year: 2010, rating: 4.1 },
  { id: 4, title: "Whiplash", year: 2014, rating: 4.4 },
  { id: 5, title: "Moonlight", year: 2016, rating: 4.2 },
];

function FilmsPage({ movies, watchlistIds, onToggleWatchlist }) {
  return (
    <div className="page">
      <h2>Films</h2>
      <p className="muted">Placeholder film browsing page (uses same movie list).</p>

      <div className="grid">
        {movies.map((m) => (
          <div key={m.id} className="card">
            <div className="poster" aria-hidden="true" />
            <div className="cardBody">
              <div className="cardTop">
                <div>
                  <h3 className="cardTitle">
                    {m.title} <span className="muted">({m.year})</span>
                  </h3>
                  <p className="muted">Placeholder details / genres later.</p>
                </div>
                <div className="rating">★ {m.rating.toFixed(1)}</div>
              </div>
              <div className="cardActions">
                <button className="button small" onClick={() => onToggleWatchlist(m.id)}>
                  {watchlistIds.has(m.id) ? "Remove from watchlist" : "Add to watchlist"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WatchlistPage({ watchlistMovies, onToggleWatchlist }) {
  return (
    <div className="page">
      <h2>Watchlist</h2>
      <p className="muted">Movies you’ve saved for later.</p>

      <div className="panel">
        {watchlistMovies.length === 0 ? (
          <p className="muted">No movies yet. Add some from Home or Films.</p>
        ) : (
          <ul className="list">
            {watchlistMovies.map((m) => (
              <li key={m.id} className="listItem">
                <span>
                  {m.title} <span className="muted">({m.year})</span>
                </span>
                <button className="button small ghost" onClick={() => onToggleWatchlist(m.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProfilePage({ watchlistCount }) {
  return (
    <div className="page">
      <h2>Profile</h2>
      <p className="muted">Placeholder profile page.</p>

      <div className="panel">
        <p className="muted">Watchlist count: {watchlistCount}</p>
        <p className="muted">Next: diary entries, ratings, reviews.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("popular");
  const [watchlistIds, setWatchlistIds] = useState(() => new Set());

  function toggleWatchlist(movieId) {
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) next.delete(movieId);
      else next.add(movieId);
      return next;
    });
  }

  const visibleMovies = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = INITIAL_MOVIES.filter((m) => {
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        String(m.year).includes(q) ||
        String(m.rating).includes(q)
      );
    });

    filtered.sort((a, b) => {
      if (sortMode === "title") return a.title.localeCompare(b.title);
      if (sortMode === "year") return b.year - a.year;
      return b.rating - a.rating;
    });

    return filtered;
  }, [query, sortMode]);

  const watchlistMovies = useMemo(
    () => INITIAL_MOVIES.filter((m) => watchlistIds.has(m.id)),
    [watchlistIds]
  );

  let mainContent = null;
  if (page === "home") {
    mainContent = (
      <Home
        movies={visibleMovies}
        query={query}
        sortMode={sortMode}
        onSortChange={setSortMode}
        watchlistIds={watchlistIds}
        onToggleWatchlist={toggleWatchlist}
        watchlistMovies={watchlistMovies}
      />
    );
  } else if (page === "films") {
    mainContent = (
      <FilmsPage
        movies={visibleMovies}
        watchlistIds={watchlistIds}
        onToggleWatchlist={toggleWatchlist}
      />
    );
  } else if (page === "watchlist") {
    mainContent = (
      <WatchlistPage
        watchlistMovies={watchlistMovies}
        onToggleWatchlist={toggleWatchlist}
      />
    );
  } else {
    mainContent = <ProfilePage watchlistCount={watchlistIds.size} />;
  }

  return (
    <div className="appShell">
      <Header
        query={query}
        onQueryChange={setQuery}
        watchlistCount={watchlistIds.size}
      />

      <div className="layout">
        <aside className="sidebar">
          <Nav currentPage={page} onNavigate={setPage} />
        </aside>

        <main className="main">{mainContent}</main>

        <aside className="rightRail">
          <div className="panel">
            <h3 className="panelTitle">Quick Stats</h3>
            <p className="muted">Movies shown: {visibleMovies.length}</p>
            <p className="muted">Watchlist: {watchlistIds.size}</p>
            <p className="muted">Current page: {page}</p>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <span className="muted">ReactProject — Interactive Checkpoint</span>
      </footer>
    </div>
  );
}