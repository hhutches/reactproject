export default function Nav({ currentPage = "home", onNavigate = () => {} }) {
  const items = [
    { id: "home", label: "Home" },
    { id: "films", label: "Films" },
    { id: "watchlist", label: "Watchlist" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <nav className="nav">
      <h2 className="navTitle">Menu</h2>
      <ul className="navList">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={`navButton ${currentPage === item.id ? "active" : ""}`}
              type="button"
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}