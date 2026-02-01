import Header from "./components/Header.jsx";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import "./styles/app.css";

export default function App() {
  return (
    <div className="appShell">
      <Header />

      <div className="layout">
        <aside className="sidebar">
          <Nav />
        </aside>

        <main className="main">
          <Home />
        </main>

        <aside className="rightRail">
          <div className="panel">
            <h3 className="panelTitle">Popular This Week</h3>
            <p className="muted">Placeholder content</p>
          </div>
        </aside>
      </div>
    </div>
  );
}