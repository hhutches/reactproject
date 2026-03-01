import { useEffect, useMemo, useState } from "react";
import Header from "./components/header.jsx";
import Nav from "./components/nav.jsx";
import Home from "./pages/Home.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FilmsPage from "./pages/FilmsPage.jsx";
import { getPopularMovies, searchMovies, getMovieDetails } from "./api/tmdb.js";
import "./styles/App.css";

export default function App() {
  // pages: home | films | watchlist | profile | detail
  const [page, setPage] = useState("home");
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // TMDB list/search results
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Watchlist stores actual movie objects so it always renders
  const [watchlistById, setWatchlistById] = useState(() => ({}));

  // ✅ Logged films (Letterboxd “Films” / diary-lite)
  // logsById[movieId] = { rating: number (0-5), review: string, createdAt: string, movie: object }
  const [logsById, setLogsById] = useState(() => ({}));

  // Reviews (separate from logs; you can keep this or remove later)
  const [reviewsByMovie, setReviewsByMovie] = useState(() => ({}));

  function openMovie(movieId) {
    if (!movieId) return;
    setSelectedMovieId(movieId);
    setPage("detail");
  }

  async function toggleWatchlist(movieOrId) {
    const id = typeof movieOrId === "object" ? movieOrId.id : movieOrId;
    if (!id) return;

    setWatchlistById((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = typeof movieOrId === "object" ? movieOrId : { id, title: "Loading…" };
      return next;
    });

    if (typeof movieOrId !== "object") {
      try {
        const details = await getMovieDetails(id);
        setWatchlistById((prev) => ({ ...prev, [id]: details }));
      } catch {
        // ignore
      }
    }
  }

  // ✅ Log a film (rating + optional review)
  function logFilm(movieObj, { rating, review }) {
    if (!movieObj?.id) return;
    const id = movieObj.id;

    setLogsById((prev) => ({
      ...prev,
      [id]: {
        rating,
        review: review || "",
        createdAt: new Date().toISOString(),
        movie: movieObj, // store enough info to render list
      },
    }));
  }

  function removeLog(movieId) {
    setLogsById((prev) => {
      const next = { ...prev };
      delete next[movieId];
      return next;
    });
  }

  // (optional) if you want separate reviews list still
  function addReview(movieId, { text, stars }) {
    if (!movieId) return;
    setReviewsByMovie((prev) => {
      const next = { ...prev };
      const list = next[movieId] ? [...next[movieId]] : [];
      list.unshift({
        id: crypto.randomUUID(),
        text,
        stars,
        createdAt: new Date().toISOString(),
      });
      next[movieId] = list;
      return next;
    });
  }

  // Average rating based on logged films (more “Letterboxd” than reviews)
  const avgRatingByMovie = useMemo(() => {
    const out = {};
    for (const [movieId, entry] of Object.entries(logsById)) {
      out[movieId] = entry.rating;
    }
    return out;
  }, [logsById]);

  // Load popular on mount
  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await getPopularMovies();
        if (!ignore) setMovies(data);
      } catch (e) {
        if (!ignore) setErrorMsg(e?.message || "Failed to load movies");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, []);

  // Search on query change
  useEffect(() => {
    let ignore = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = query.trim()
          ? await searchMovies(query.trim())
          : await getPopularMovies();
        if (!ignore) setMovies(data);
      } catch (e) {
        if (!ignore) setErrorMsg(e?.message || "Failed to load movies");
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [query]);

  const watchlistMovies = useMemo(() => Object.values(watchlistById), [watchlistById]);
  const loggedFilms = useMemo(() => Object.values(logsById), [logsById]);

  let mainContent = null;

  if (page === "home") {
    mainContent = (
      <Home
        movies={movies}
        loading={loading}
        errorMsg={errorMsg}
        onOpenMovie={openMovie}
        watchlistById={watchlistById}
        onToggleWatchlist={toggleWatchlist}
        avgRatingByMovie={avgRatingByMovie}
        mode={page}
      />
    );
  } else if (page === "films") {
    mainContent = (
      <FilmsPage
        logs={loggedFilms}
        onOpenMovie={openMovie}
        onRemoveLog={removeLog}
      />
    );
  } else if (page === "watchlist") {
    mainContent = (
      <WatchlistPage
        movies={watchlistMovies}
        onOpenMovie={openMovie}
        onRemove={(id) => toggleWatchlist(id)}
      />
    );
  } else if (page === "detail") {
    if (!selectedMovieId) {
      mainContent = (
        <div className="page">
          <h2>Movie</h2>
          <p className="muted">No movie selected.</p>
          <button className="button" onClick={() => setPage("home")}>
            Back to Home
          </button>
        </div>
      );
    } else {
      const inWatchlist = !!watchlistById[selectedMovieId];
      const existingLog = logsById[selectedMovieId] || null;

      mainContent = (
        <MovieDetail
          movieId={selectedMovieId}
          inWatchlist={inWatchlist}
          onToggleWatchlist={() => toggleWatchlist(selectedMovieId)}
          onBack={() => setPage("home")}

          // ✅ logging feature
          existingLog={existingLog}
          onLogFilm={(movieObj, payload) => logFilm(movieObj, payload)}

          // optional reviews
          reviews={reviewsByMovie[selectedMovieId] || []}
          onAddReview={(payload) => addReview(selectedMovieId, payload)}
        />
      );
    }
  } else {
    mainContent = <ProfilePage />;
  }

  return (
    <div className="appShell">
      <Header
        query={query}
        onQueryChange={setQuery}
        watchlistCount={watchlistMovies.length}
      />

      <div className="layout">
        <aside className="sidebar">
          <Nav
            currentPage={page}
            onNavigate={(next) => {
              setPage(next);
              if (next !== "detail") setSelectedMovieId(null);
            }}
          />
        </aside>

        <main className="main">{mainContent}</main>

        <aside className="rightRail">
          <div className="panel">
            <h3 className="panelTitle">Stats</h3>
            <p className="muted">Logged films: {loggedFilms.length}</p>
            <p className="muted">Watchlist: {watchlistMovies.length}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}