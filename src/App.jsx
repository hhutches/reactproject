import { useEffect, useMemo, useState } from "react";
import Header from "./components/header.jsx";
import Nav from "./components/nav.jsx";
import Home from "./pages/Home.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FilmsPage from "./pages/FilmsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { getPopularMovies, searchMovies, getMovieDetails } from "./api/tmdb.js";
import "./styles/App.css";

const STORAGE_PREFIX = "lb-lite:user:";

function storageKey(username) {
  return `${STORAGE_PREFIX}${String(username || "").toLowerCase()}`;
}

function loadUser(username) {
  try {
    const raw = localStorage.getItem(storageKey(username));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(username, data) {
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(data));
  } catch {
    // ignore quota errors for demo
  }
}

export default function App() {
  // ===== Auth / account =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null); // { name, username, bio, photo }

  // pages: login | home | films | watchlist | profile | detail
  const [page, setPage] = useState("login");
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // TMDB list/search results
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Watchlist stores movie objects AND addedAt
  // watchlistById[movieId] = { ...tmdbMovie, addedAt: ISO }
  const [watchlistById, setWatchlistById] = useState(() => ({}));

  // Logged films
  // logsById[movieId] = { rating: 0..5, review: string, createdAt: ISO, movie: tmdbMovie }
  const [logsById, setLogsById] = useState(() => ({}));

  // Reviews
  const [reviewsByMovie, setReviewsByMovie] = useState(() => ({}));

  // ✅ Lock scroll ONLY on login page (no CSS required)
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (page === "login") document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [page]);

  // ===== Login handler (per-username local cache) =====
  function handleLogin(nextProfile) {
    const username = (nextProfile?.username || "").trim();
    if (!username) return;

    const existing = loadUser(username);

    const mergedProfile = {
      ...(existing?.profile || {}),
      ...nextProfile,
      username,
    };

    const nextData = {
      profile: mergedProfile,
      watchlistById: existing?.watchlistById || {},
      logsById: existing?.logsById || {},
      reviewsByMovie: existing?.reviewsByMovie || {},
    };

    setProfile(mergedProfile);
    setWatchlistById(nextData.watchlistById);
    setLogsById(nextData.logsById);
    setReviewsByMovie(nextData.reviewsByMovie);

    setIsLoggedIn(true);
    setPage("home");
    setSelectedMovieId(null);

    saveUser(username, nextData);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setProfile(null);
    setWatchlistById({});
    setLogsById({});
    setReviewsByMovie({});
    setQuery("");
    setMovies([]);
    setSelectedMovieId(null);
    setPage("login");
  }

  function updateProfile(next) {
    if (!next?.username) return;
    setProfile(next);
  }

  // Persist whenever data changes (for the current username)
  useEffect(() => {
    if (!profile?.username) return;

    const payload = {
      profile,
      watchlistById,
      logsById,
      reviewsByMovie,
    };

    const t = setTimeout(() => {
      saveUser(profile.username, payload);
    }, 150);

    return () => clearTimeout(t);
  }, [profile, watchlistById, logsById, reviewsByMovie]);

  // ===== App actions =====
  function openMovie(movieId) {
    if (!movieId) return;
    setSelectedMovieId(movieId);
    setPage("detail");
  }

  async function toggleWatchlist(movieOrId) {
    const id = typeof movieOrId === "object" ? movieOrId.id : movieOrId;
    if (!id) return;

    const adding = !watchlistById?.[id];

    setWatchlistById((prev) => {
      const next = { ...prev };

      if (next[id]) {
        delete next[id];
      } else {
        const base = typeof movieOrId === "object" ? movieOrId : { id, title: "Loading…" };
        next[id] = {
          ...base,
          addedAt: new Date().toISOString(),
        };
      }
      return next;
    });

    if (adding && typeof movieOrId !== "object") {
      try {
        const details = await getMovieDetails(id);
        setWatchlistById((prev) => {
          const existing = prev[id];
          const addedAt = existing?.addedAt || new Date().toISOString();
          return { ...prev, [id]: { ...details, addedAt } };
        });
      } catch {
        // ignore
      }
    }
  }

  function logFilm(movieObj, { rating, review }) {
    if (!movieObj?.id) return;
    const id = movieObj.id;
    const safeRating = Math.max(0, Math.min(5, Number(rating)));

    setLogsById((prev) => ({
      ...prev,
      [id]: {
        rating: safeRating,
        review: review || "",
        createdAt: new Date().toISOString(),
        movie: movieObj,
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

  const avgRatingByMovie = useMemo(() => {
    const out = {};
    for (const [movieId, entry] of Object.entries(logsById)) out[movieId] = entry.rating;
    return out;
  }, [logsById]);

  // Load popular/fresh on mount + on query
  useEffect(() => {
    if (!isLoggedIn) return;

    let ignore = false;

    const t = setTimeout(async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = query.trim()
          ? await searchMovies(query.trim())
          : await getPopularMovies({ monthsBack: 18, minVotes: 200 });
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
  }, [query, isLoggedIn]);

  // initial fetch when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    let ignore = false;
    async function run() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await getPopularMovies({ monthsBack: 18, minVotes: 200 });
        if (!ignore) setMovies(data);
      } catch (e) {
        if (!ignore) setErrorMsg(e?.message || "Failed to load movies");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  const watchlistMovies = useMemo(() => Object.values(watchlistById), [watchlistById]);
  const loggedFilms = useMemo(() => Object.values(logsById), [logsById]);

  // ===== Page rendering =====
  let mainContent = null;

  if (!isLoggedIn || page === "login") {
    mainContent = <LoginPage defaultProfile={profile} onLogin={handleLogin} />;
  } else if (page === "home") {
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
    mainContent = <FilmsPage logs={loggedFilms} onOpenMovie={openMovie} onRemoveLog={removeLog} />;
  } else if (page === "watchlist") {
    mainContent = (
      <WatchlistPage movies={watchlistMovies} onOpenMovie={openMovie} onRemove={(id) => toggleWatchlist(id)} />
    );
  } else if (page === "profile") {
    mainContent = (
      <ProfilePage
        profile={profile}
        onUpdateProfile={updateProfile}
        onGoHome={() => setPage("home")}
        onLogout={handleLogout}
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
          existingLog={existingLog}
          onLogFilm={(movieObj, payload) => logFilm(movieObj, payload)}
          reviews={reviewsByMovie[selectedMovieId] || []}
          onAddReview={(payload) => addReview(selectedMovieId, payload)}
        />
      );
    }
  } else {
    mainContent = <div className="page" />;
  }

  // ✅ IMPORTANT: for login page we render ONLY the login screen (no header/nav)
  if (page === "login") {
    return <div className="appShell">{mainContent}</div>;
  }

  return (
    <div className="appShell">
      <Header
        query={query}
        onQueryChange={setQuery}
        watchlistCount={watchlistMovies.length}
        onBrandClick={() => setPage("login")}
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
            <p className="muted">Logged films: {loggedFilms.length}</p>
            <p className="muted">Watchlist: {watchlistMovies.length}</p>
            <p className="muted">
              User: <b style={{ color: "rgba(255,255,255,0.85)" }}>@{profile?.username}</b>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}