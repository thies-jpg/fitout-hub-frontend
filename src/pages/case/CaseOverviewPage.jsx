import { useNavigate, useParams } from 'react-router-dom'
import { useCaseData } from '../../hooks/useCaseData'

function formatPercent(value) {
  if (typeof value !== 'number') return '-'
  return `${Math.round(value * 100)}%`
}

export default function CaseOverviewPage() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const { data, loading, error } = useCaseData(caseId)

  if (loading) return <div className="panel pad">Loading case…</div>
  if (error) return <div className="panel pad">Error: {error}</div>
  if (!data) return <div className="panel pad">No case data found.</div>

  return (
    <div className="page-stack">

      {/* HERO */}
      <section className="page-hero">
        <div>
          <div className="eyebrow">Case Overview</div>
          <h1 className="page-title">
            {data.case.id} — {data.case.title}
          </h1>

          <p className="page-subtitle">
            A calm overview of the current design options. Variants are shown as
            self-contained planning states with grouped KPIs and direct paths
            into Compare and Testfit.
          </p>

          <div className="case-meta-row">
            <div className="meta-pill">Asset: {data.case.asset_id}</div>
            <div className="meta-pill">Floor: {data.case.floor_id}</div>
            <div className="meta-pill">Lease Area: {data.case.lease_area_id}</div>
            <div className="meta-pill">Status: {data.case.status}</div>
            <div className="meta-pill">Active: {data.case.active_variant_id}</div>
          </div>
        </div>

        <div className="hero-actions">
          <button
            className="btn secondary"
            onClick={() => navigate(`/cases/${caseId}/compare`)}
          >
            Compare Variants
          </button>

          <button className="btn primary">
            Share Review
          </button>
        </div>
      </section>

      {/* VARIANTS */}
      <section className="content-section">
        <div className="section-header">
          <div>
            <div className="section-title">Variants</div>
            <div className="section-subtitle">
              Preview first, then grouped metrics for quick reading and decision preparation.
            </div>
          </div>
        </div>

        <div className="variant-grid">
          {data.variants.map((variant) => {
            const kpis = variant.kpis || {}
            const capacity = kpis.capacity || {}
            const performance = kpis.performance || {}
            const commercial = kpis.commercial || {}
            const scoring = kpis.scoring || {}
            const isActive = variant.id === data.case.active_variant_id

            return (
              <article
                key={variant.id}
                className={`variant-card ${isActive ? 'is-active' : ''}`}
              >
                <div className="variant-head">
                  <div>
                    <div className="variant-title">
                      {variant.name} {isActive ? '★' : ''}
                    </div>
                    <div className="variant-sub">
                      {variant.role} · {variant.status}
                    </div>
                  </div>

                  <span className={`tag ${isActive ? 'tag-active' : 'tag-muted'}`}>
                    {isActive ? 'Active' : 'Variant'}
                  </span>
                </div>

                <div className="preview-box">
                  Preview placeholder
                </div>

                {/* Capacity */}
                <div className="variant-section">
                  <div className="section-mini-title">Capacity</div>

                  <div className="metric-line">
                    <strong>{capacity.workstations ?? '-'}</strong>
                    <span>Workstations</span>
                  </div>

                  <div className="metric-line">
                    <strong>{capacity.meeting_rooms ?? '-'}</strong>
                    <span>Meeting Rooms</span>
                  </div>

                  <span className="tag tag-ok">
                    {scoring.capacity_fit || 'n/a'}
                  </span>
                </div>

                {/* Performance */}
                <div className="variant-section">
                  <div className="section-mini-title">Performance</div>

                  <div className="metric-line">
                    <strong>{formatPercent(performance.efficiency_ratio)}</strong>
                    <span>Efficiency</span>
                  </div>

                  <div className="metric-line">
                    <strong>{performance.conflict_count ?? '-'}</strong>
                    <span>Conflicts</span>
                  </div>

                  <span className="tag tag-warn">
                    {scoring.performance_fit || 'n/a'}
                  </span>
                </div>

                {/* Commercial */}
                <div className="variant-section">
                  <div className="section-mini-title">Commercial</div>

                  <div className="metric-line">
                    <strong>€{commercial.cost_per_sqm ?? '-'}</strong>
                    <span>Cost / m²</span>
                  </div>

                  <div className="metric-line">
                    <strong>{commercial.schedule_weeks ?? '-'}</strong>
                    <span>Weeks</span>
                  </div>

                  <span className="tag tag-muted">
                    {scoring.commercial_fit || 'n/a'}
                  </span>
                </div>

                <div className="variant-actions">
                  <button
                    className="btn primary"
                    onClick={() => navigate(`/cases/${caseId}/testfit?variant=${variant.id}`)}
                  >
                    Open in Testfit
                  </button>

                  {!isActive && (
                    <button
                      className="btn secondary"
                      onClick={() => alert(`Set baseline for ${variant.id} comes next`)}
                    >
                      Set Baseline
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* BOTTOM */}
      <section className="bottom-grid">

        {/* Recommendation */}
        <div className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Recommendation</div>
              <div className="section-subtitle">
                Current reading of the variants based on brief fit and delivery quality.
              </div>
            </div>
          </div>

          <div className="recommendation-box">
            <div className="recommendation-top">
              <div>
                <div className="recommendation-title">Recommended: Variant B</div>
                <div className="recommendation-subtitle">
                  Best overall balance between workstation target, collaboration mix, cost stability and refinement effort.
                </div>
              </div>

              <span className="tag tag-active">Recommended</span>
            </div>

            <div className="recommendation-list">
              <div className="recommendation-item">Closest overall fit to the workplace brief.</div>
              <div className="recommendation-item">Balanced meeting mix vs Variant A.</div>
              <div className="recommendation-item">Conflicts resolvable in Testfit.</div>
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Recent Updates</div>
              <div className="section-subtitle">
                Changes connected to the current decision state.
              </div>
            </div>
          </div>

          <div className="updates-list">
            <div className="updates-item">Variant B updated in Testfit.</div>
            <div className="updates-item">Cost snapshot v4 generated.</div>
            <div className="updates-item">Workshop feedback integrated.</div>
          </div>
        </div>

      </section>

    </div>
  )
}