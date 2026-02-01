export default function Section({ title, subtitle, children }) {
  return (
    <section className="section">
      <div className="sectionHead">
        <div>
          <h2 className="sectionTitle">{title}</h2>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}