export default function Legend() {
  return (
    <figure className="legend" aria-label="Net worth colour legend">
      <div className="legend-bar-row">
        <span>LOW</span>
        <span className="legend-bar" aria-hidden="true" />
        <span>HIGH</span>
      </div>
      <figcaption className="legend-keys">
        <span>
          <i className="swatch band-low" /> &lt; $100K
        </span>
        <span>
          <i className="swatch band-mid" /> $100K–$200K
        </span>
        <span>
          <i className="swatch band-high" /> ≥ $200K
        </span>
      </figcaption>
    </figure>
  )
}
