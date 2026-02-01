export default function Header() {
  return (
    <header className="header">
      <h1 className="logo">Letterboxd Lite</h1>
      <input
        className="searchInput"
        placeholder="Search movies..."
      />
    </header>
  );
}