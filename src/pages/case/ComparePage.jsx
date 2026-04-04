import { useNavigate, useParams } from 'react-router-dom'
import { useCaseData } from '../../hooks/useCaseData'

function formatPercent(value) {
  if (typeof value !== 'number') return '-'
  return `${Math.round(value * 100)}%`
}

function getWinnerIds(variants, extractor, direction = 'max') {
  const valid = variants
    .map((variant) => ({
      id: variant.id,
      value: extractor(variant),
    }))
    .filter((item) => typeof item.value === 'number' && !Number.isNaN(item.value))

  if (!valid.length) return []

  const bestValue =
    direction === 'min'
      ? Math.min(...valid.map((item) => item.value))
      : Math.max(...valid.map((item) => item.value))

  return valid
    .filter((item) => item.value === bestValue)
    .map((item) => item.id)
}

function WinnerTag({ isWinner }) {
  if (!isWinner) return null
  return <span className="tag tag-best">Winner</span>
}

export default function ComparePage() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const { data, loading, error, updateBaseline } = useCaseData(caseId)

  if (loading) return <div className="panel pad">Loading compare…</div>
  if (error) return <div className="panel pad">Error: {error}</div>
  if (!data) return <div className="panel pad">No data</div>

  const variants = data.variants || []

  const winners = {
    workstations: getWinnerIds(
      variants,
      (v) => v.kpis?.capacity?.workstations,
      'max'
    ),
    meetingRooms: getWinnerIds(
      variants,
      (v) => v.kpis?.capacity?.meeting_rooms,
      'max'
    ),
    efficiency: getWinnerIds(
      variants,
      (v) => v.kpis?.performance?.efficiency_ratio,
      'max'
    ),
    conflicts: getWinnerIds(
      variants,
      (v) => v.kpis?.performance?.conflict_count,
      'min'
    ),
    cost: getWinnerIds(
      variants,
      (v) => v.kpis?.commercial?.cost_per_sqm,
      'min'
    ),
    schedule: getWinnerIds(
      variants,
      (v) => v.kpis?.commercial?.schedule_weeks,
      'min'
    ),
  }

  async function handleSetBaseline(variantId) {
    try {
      await updateBaseline(variantId)
    } catch (err) {
      alert(err.message || 'Failed to set baseline')
    }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <div className="eyebrow">Compare</div>
          <h1 className="page-title">Variant Comparison</h1>
          <p className="page-subtitle">
            Evaluate planning options side by side across capacity, performance
            and commercial impact. Best values are highlighted directly in the
            comparison.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="btn secondary"
            onClick={() => navigate(`/cases/${caseId}/overview`)}
          >
            Back to Case
          </button>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <div className="section-title">Selected Variants</div>
            <div className="section-subtitle">
              Side-by-side comparison of the current planning options.
            </div>
          </div>
        </div>

        <div className="compare-grid compare-grid-wrap">
          {variants.map((variant) => {
            const k = variant.kpis || {}
            const capacity = k.capacity || {}
            const performance = k.performance || {}
            const commercial = k.commercial || {}
            const scoring = k.scoring || {}
            const isActive = variant.id === data.case.active_variant_id

            return (
              <article
                key={variant.id}
                className={`compare-card ${isActive ? 'is-active' : ''}`}
              >
                <div className="compare-head">
                  <div>
                    <div className="compare-title">
                      {variant.name} {isActive ? '★' : ''}
                    </div>
                    <div className="compare-sub">
                      {variant.role} · {variant.status}
                    </div>
                  </div>

                  <span className={`tag ${isActive ? 'tag-active' : 'tag-muted'}`}>
                    {isActive ? 'Baseline' : 'Variant'}
                  </span>
                </div>

                <div className="preview-box">Plan preview</div>

                <div className="compare-section">
                  <div className="section-mini-title">Capacity</div>

                  <div className="metric-row">
                    <div className="metric-line">
                      <strong>{capacity.workstations ?? '-'}</strong>
                      <span>Workstations</span>
                    </div>
                    <WinnerTag
                      isWinner={winners.workstations.includes(variant.id)}
                    />
                  </div>

                  <div className="metric-row">
                    <div className="metric-line">
                      <strong>{capacity.meeting_rooms ?? '-'}</strong>
                      <span>Meeting Rooms</span>
                    </div>
                    <WinnerTag
                      isWinner={winners.meetingRooms.includes(variant.id)}
                    />
                  </div>

                  <span className="tag tag-ok">
                    {scoring.capacity_fit || 'n/a'}
                  </span>
                </div>

                <div className="compare-section">
                  <div className="section-mini-title">Performance</div>

                  <div className="metric-row">
                    <div className="metric-line">
                      <strong>{formatPercent(performance.efficiency_ratio)}</strong>
                      <span>Efficiency</span>
                    </div>
                    <WinnerTag
                      isWinner={winners.efficiency.includes(variant.id)}
                    />
                  </div>

                  <div className="metric-row">
                    <div className="metric-line">
                      <strong>{performance.conflict_count ?? '-'}</strong>
                      <span>Conflicts</span>
                    </div>
                    <WinnerTag
                      isWinner={winners.conflicts.includes(variant.id)}
                    />
                  </div>

                  <span className="tag tag-warn">
                    {scoring.performance_fit || 'n/a'}
                  </span>
                </div>

                <div className="compare-section">
                  <div className="section-mini-title">Commercial</div>

                  <div className="metric-row">
                    <div className="metric-line">
                      <strong>€{commercial.cost_per_sqm ?? '-'}</strong>
                      <span>Cost / m²</span>
                    </div>
                    <WinnerTag
                      isWinner={winners.cost.includes(variant.id)}
                    />
                  </div>

                  <div className="metric-row">
                    <div className="metric-line">
                      <strong>{commercial.schedule_weeks ?? '-'}</strong>
                      <span>Weeks</span>
                    </div>
                    <WinnerTag
                      isWinner={winners.schedule.includes(variant.id)}
                    />
                  </div>

                  <span className="tag tag-muted">
                    {scoring.commercial_fit || 'n/a'}
                  </span>
                </div>

                <div className="compare-actions">
                  {!isActive ? (
                    <button
                      className="btn primary"
                      onClick={() => handleSetBaseline(variant.id)}
                    >
                      Set as Baseline
                    </button>
                  ) : (
                    <button className="btn secondary" disabled>
                      Current Baseline
                    </button>
                  )}

                  <button
                    className="btn secondary"
                    onClick={() => navigate(`/cases/${caseId}/testfit?variant=${variant.id}`)}
                  >
                    Open in Testfit
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}