export default function MovieCard({ title, year, rating }) {
  return (
    <article className="card">
      <div className="poster" aria-hidden="true" />
      <div className="cardBody">
        <div className="cardTop">
          <div>
            <h3 className="cardTitle">
              {title} <span className="muted">({year})</span>
            </h3>
            <p className="muted">Placeholder description + review preview.</p>
          </div>
          <div className="rating">★ {rating}</div>
        </div>

        <div className="cardActions">
          <button className="button small">Add to watchlist</button>
          <button className="button small ghost">Read reviews</button>
        </div>
      </div>
    </article>
  );
}