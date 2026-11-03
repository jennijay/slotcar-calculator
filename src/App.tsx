import { useState } from 'react'
import './App.css'

const exampleWeights = { fl: '0', fr: '15', rl: '18', rr: '20' }
const cornerLabels = [
  { key: 'fl', label: 'Front left', short: 'FL', position: 'front-left' },
  { key: 'fr', label: 'Front right', short: 'FR', position: 'front-right' },
  { key: 'rl', label: 'Rear left', short: 'RL', position: 'rear-left' },
  { key: 'rr', label: 'Rear right', short: 'RR', position: 'rear-right' },
] as const

type CornerKey = keyof typeof exampleWeights

function formatWeight(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function App() {
  const [weights, setWeights] = useState(exampleWeights)
  const [copied, setCopied] = useState(false)

  const values = Object.fromEntries(
    cornerLabels.map(({ key }) => [key, Number(weights[key]) || 0]),
  ) as Record<CornerKey, number>
  const total = values.fl + values.fr + values.rl + values.rr
  const front = values.fl + values.fr
  const rear = values.rl + values.rr
  const left = values.fl + values.rl
  const right = values.fr + values.rr
  const diagonalA = values.fl + values.rr
  const diagonalB = values.fr + values.rl
  const diagonalDifference = Math.abs(diagonalA - diagonalB)
  const hasZeroCorner = cornerLabels.some(({ key }) => values[key] === 0)
  const frontPercent = total > 0 ? (front / total) * 100 : 0
  const rearPercent = total > 0 ? (rear / total) * 100 : 0
  const leftPercent = total > 0 ? (left / total) * 100 : 0
  const rightPercent = total > 0 ? (right / total) * 100 : 0
  const diagonalPercent = total > 0 ? (diagonalDifference / total) * 100 : 0

  function updateWeight(key: CornerKey, value: string) {
    setWeights((current) => ({ ...current, [key]: value }))
    setCopied(false)
  }

  async function copyReport() {
    const report = [
      'Slot car corner-weight report',
      ...cornerLabels.map(({ key, short }) => `${short}: ${formatWeight(values[key])} g`),
      `Total: ${formatWeight(total)} g`,
      `Front / rear: ${formatWeight(front)} g (${formatPercent(frontPercent)}) / ${formatWeight(rear)} g (${formatPercent(rearPercent)})`,
      `Left / right: ${formatWeight(left)} g (${formatPercent(leftPercent)}) / ${formatWeight(right)} g (${formatPercent(rightPercent)})`,
      `Diagonals FL + RR / FR + RL: ${formatWeight(diagonalA)} g / ${formatWeight(diagonalB)} g`,
      `Diagonal difference: ${formatWeight(diagonalDifference)} g (${formatPercent(diagonalPercent)} of total)`,
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Slot setup home">
          <span className="brand-mark" aria-hidden="true">SC</span>
          <span>Slot setup <span className="brand-muted">/ workshop tools</span></span>
        </a>
        <span className="status"><span className="status-dot" /> LIVE / ON THE GRID</span>
      </header>

      <div className="workspace" id="top">
        <section className="page-heading">
          <div>
            <p className="eyebrow">PIT LANE · TOOL 01</p>
            <h1>Corner-weight calculator</h1>
            <p className="subtitle">Measure each wheel. See where the mass sits.</p>
          </div>
          <button className="text-button" type="button" onClick={() => {
            setWeights(exampleWeights)
            setCopied(false)
          }}>
            Reset example
          </button>
        </section>

        <div className="calculator-grid">
          <section className="panel measurements" aria-labelledby="measurements-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">01 / SCALE READINGS</p>
                <h2 id="measurements-title">Wheel weights</h2>
              </div>
              <span className="unit-tag">GRAMS</span>
            </div>

            <div className="car-map">
              <span className="axle-label front-axle" aria-hidden="true">FRONT AXLE</span>
              <span className="axle-label rear-axle" aria-hidden="true">REAR AXLE</span>
              {cornerLabels.map(({ key, label, short, position }) => (
                <label className={`wheel-input ${position}`} key={key}>
                  <span className="wheel-name"><span className="corner-code">{short}</span>{label}</span>
                  <span className="input-wrap">
                    <input
                      aria-label={`${label} weight in grams`}
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => updateWeight(key, event.target.value)}
                      step="0.1"
                      type="number"
                      value={weights[key]}
                    />
                    <span>g</span>
                  </span>
                </label>
              ))}
            </div>

            {hasZeroCorner && (
              <p className="warning" role="status">
                <span aria-hidden="true">!</span> Zero-load wheel detected. Check scale contact and guide support.
              </p>
            )}

          </section>

          <section className="panel total-panel" aria-labelledby="total-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TOTAL CAR WEIGHT</p>
                <h2 id="total-title" className="sr-only">Total car weight</h2>
              </div>
              <span className="total-icon" aria-hidden="true">Σ</span>
            </div>
            <p className="total-value">{formatWeight(total)}<span>g</span></p>
            <div className="distribution-bar" aria-label={`Front ${formatPercent(frontPercent)}, rear ${formatPercent(rearPercent)}`}>
              <span className="front-segment" style={{ width: `${frontPercent}%` }} />
              <span className="rear-segment" style={{ width: `${rearPercent}%` }} />
            </div>
            <div className="bar-legend">
              <span><i className="legend-front" /> Front <strong>{formatPercent(frontPercent)}</strong></span>
              <span><i className="legend-rear" /> Rear <strong>{formatPercent(rearPercent)}</strong></span>
            </div>
          </section>
        </div>

        <section className="results-section" aria-labelledby="results-title">
          <div className="section-heading results-heading">
            <div>
              <p className="eyebrow">02 / BALANCE REPORT</p>
              <h2 id="results-title">Weight distribution</h2>
            </div>
          </div>
          <div className="results-grid">
            <article className="result-panel">
              <h3>Axle balance</h3>
              <ResultRow label="Front" weight={front} percent={frontPercent} total={total} />
              <ResultRow label="Rear" weight={rear} percent={rearPercent} total={total} />
              <div className="mini-bar">
                <span className="front-segment" style={{ width: `${frontPercent}%` }} />
                <span className="rear-segment" style={{ width: `${rearPercent}%` }} />
              </div>
              <div className="bar-legend result-legend">
                <span><i className="legend-front" /> Front <strong>{formatPercent(frontPercent)}</strong></span>
                <span><i className="legend-rear" /> Rear <strong>{formatPercent(rearPercent)}</strong></span>
              </div>
            </article>
            <article className="result-panel">
              <h3>Side balance</h3>
              <ResultRow label="Left" weight={left} percent={leftPercent} total={total} />
              <ResultRow label="Right" weight={right} percent={rightPercent} total={total} />
              <div className="mini-bar side-bar">
                <span className="left-segment" style={{ width: `${leftPercent}%` }} />
                <span className="right-segment" style={{ width: `${rightPercent}%` }} />
              </div>
              <div className="bar-legend result-legend">
                <span><i className="legend-left" /> Left <strong>{formatPercent(leftPercent)}</strong></span>
                <span><i className="legend-right" /> Right <strong>{formatPercent(rightPercent)}</strong></span>
              </div>
            </article>
            <article className="result-panel diagonal-panel">
              <h3>Diagonal / cross-weight</h3>
              <ResultRow label="FL + RR" weight={diagonalA} percent={total > 0 ? (diagonalA / total) * 100 : 0} total={total} />
              <ResultRow label="FR + RL" weight={diagonalB} percent={total > 0 ? (diagonalB / total) * 100 : 0} total={total} />
              <div className="difference-row">
                <span>Diagonal difference</span>
                <strong>{formatWeight(diagonalDifference)} g <small>({formatPercent(diagonalPercent)})</small></strong>
              </div>
            </article>
          </div>
        </section>

        <footer className="page-footer">
          <p><span className="footer-mark" /> SLOT CAR CHASSIS SETUP · FOUR-WHEEL BALANCE</p>
          <button className="copy-button" onClick={copyReport} type="button">
            <span aria-hidden="true">{copied ? '✓' : '↗'}</span> {copied ? 'Copied' : 'Copy report'}
          </button>
        </footer>
      </div>
    </main>
  )
}

function ResultRow({ label, weight, percent, total }: { label: string; weight: number; percent: number; total: number }) {
  return (
    <div className="result-row">
      <span>{label}</span>
      <strong>{formatWeight(weight)} <small>g</small></strong>
      <span className="result-percent">{total > 0 ? formatPercent(percent) : '—'}</span>
    </div>
  )
}

export default App
