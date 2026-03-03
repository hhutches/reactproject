export default function StarRating({
  value = 0,            // 0 to 5 in 0.5 increments
  onChange = () => {},
  size = 22,
  label = "Rating",
}) {
  const stars = [1, 2, 3, 4, 5];

  function handleClick(n) {
    // Behavior:
    // - Click a star to set FULL star value (n)
    // - Click the SAME star again to toggle HALF (n - 0.5)
    // - If already half, clicking again goes back to full
    // - If half would go below 0, clamp to 0
    if (value === n) {
      const half = Math.max(0, n - 0.5);
      onChange(half);
      return;
    }
    if (value === n - 0.5) {
      onChange(n);
      return;
    }
    onChange(n);
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>

      <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        {stars.map((n) => {
          const fill =
            value >= n ? "full" : value === n - 0.5 ? "half" : "empty";

          return (
            <button
              key={n}
              type="button"
              onClick={() => handleClick(n)}
              aria-label={`Set rating ${n} stars`}
              title={`Click for ${n}★, click again for ${n - 0.5}★`}
              style={{
                cursor: "pointer",
                padding: 0,
                border: "none",
                background: "transparent",
                lineHeight: 0,
              }}
            >
              <StarIcon fillState={fill} size={size} />
            </button>
          );
        })}

        <span className="muted" style={{ marginLeft: 10, fontSize: 14 }}>
          {value.toFixed(1)}★
        </span>

        <button
          type="button"
          className="button small ghost"
          onClick={() => onChange(0)}
          style={{ marginLeft: 10 }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function StarIcon({ fillState, size }) {
  // Uses currentColor for stroke and controlled fills
  // “full” = filled star
  // “half” = left half filled
  // “empty” = outline only
  const stroke = "rgba(255,255,255,0.75)";
  const fillFull = "rgba(255,255,255,0.92)";
  const fillEmpty = "transparent";

  if (fillState === "full") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={fillFull}
          stroke={stroke}
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (fillState === "half") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <clipPath id="half">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>

        {/* outline */}
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={fillEmpty}
          stroke={stroke}
          strokeWidth="1"
        />

        {/* left half fill */}
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={fillFull}
          clipPath="url(#half)"
        />
      </svg>
    );
  }

  // empty
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={fillEmpty}
        stroke={stroke}
        strokeWidth="1"
      />
    </svg>
  );
}