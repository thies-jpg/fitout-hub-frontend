import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardData } from '../../hooks/useDashboardData'

function SummaryCard({ title, value, hint }) {
  return (
    <article className="summary-card">
      <div className="section-mini-title">{title}</div>
      <div className="metric-line">
        <strong>{value}</strong>
        <span>{hint}</span>
      </div>
    </article>
  )
}

function getNextStep(caseItem) {
  if (!caseItem.selected_space_id) {
    return {
      label: 'Assign space',
      target: `/cases/${caseItem.id}/overview`,
    }
  }

  if (!caseItem.active_variant_id) {
    return {
      label: 'Generate variants',
      target: `/cases/${caseItem.id}/overview`,
    }
  }

  if (caseItem.status === 'in_review') {
    return {
      label: 'Review variants',
      target: `/cases/${caseItem.id}/compare`,
    }
  }

  return {
    label: 'Continue in Testfit',
    target: `/cases/${caseItem.id}/testfit`,
  }
}

function canGenerateVariants(caseItem) {
  return !!caseItem.selected_space_id && !caseItem.active_variant_id
}

function needsSpaceAssignment(caseItem) {
  return !caseItem.selected_space_id
}

function getAlertTarget(alert) {
  if (alert.type === 'conflict') {
    return '/cases/204/compare'
  }

  if (alert.type === 'review') {
    return '/cases/204/compare'
  }

  return null
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [actionState, setActionState] = useState({
    mode: null,
    caseItem: null,
  })

  function openAction(mode, caseItem) {
    setActionState({ mode, caseItem })
  }

  function closeAction() {
    setActionState({ mode: null, caseItem: null })
  }

  const { data, loading, error } = useDashboardData()

  if (loading) {
    return <div className="panel pad">Loading dashboard…</div>
  }

  if (error) {
    return <div className="panel pad">Error: {error}</div>
  }

  if (!data) {
    return <div className="panel pad">No data</div>
  }

  const {
    portfolio_summary,
    active_cases,
    alerts,
    next_actions,
    recent_updates = [],
  } = data

  return (
    <div className="page-stack">
      {/* HERO */}
      <section className="page-hero">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="page-title">Workspace</h1>
          <p className="page-subtitle">
            Overview of portfolio, active cases and next actions.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="btn secondary"
            onClick={() => navigate('/portfolio')}
          >
            Open Portfolio
          </button>

          <button
            className="btn secondary"
            onClick={() => navigate('/portfolio')}
          >
            New Asset
          </button>

          <button
            className="btn primary"
            onClick={() => navigate('/cases/new')}
          >
            New Case
          </button>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="content-section">
        <div className="section-header">
          <div className="section-title">Overview</div>
        </div>

        <div className="dashboard-summary-grid">
          <SummaryCard
            title="Assets"
            value={portfolio_summary.asset_count}
            hint="Portfolio objects"
          />

          <SummaryCard
            title="Lease Areas"
            value={portfolio_summary.lease_area_count}
            hint="Available spaces"
          />

          <SummaryCard
            title="Active Cases"
            value={active_cases.length}
            hint="Ongoing planning"
          />

          <SummaryCard
            title="Alerts"
            value={alerts.length}
            hint="Open issues"
          />
        </div>
      </section>

      <div className="dashboard-main-layout">
        <section className="content-section dashboard-primary-panel">
          <div className="section-header">
            <div className="section-title">Active Cases</div>
          </div>

          <div className="dashboard-panel-body">
            {active_cases.length === 0 ? (
              <div className="empty-state">No active cases</div>
            ) : (
              <div className="dashboard-case-list">
                {active_cases.map((c) => (
                  <article key={c.id} className="dashboard-case-card">
                    <div className="dashboard-case-head">
                      <div>
                        <div className="variant-title">{c.title}</div>
                        <div className="variant-sub">
                          {c.asset_name} · {c.floor_name} · {c.lease_area_name || 'No lease area'}
                        </div>
                      </div>

                      <span className="tag tag-active">{c.status}</span>
                    </div>

                    {(() => {
                      const next = getNextStep(c)
                      const isInlineAction =
                        next.label === 'Assign space' || next.label === 'Generate variants'

                      return (
                        <>
                          <div className="dashboard-case-next">
                            <span className="tag tag-muted">Next</span>
                            <span>{next.label}</span>
                          </div>

                          <div className="dashboard-case-actions">
                            <button
                              className="btn primary"
                              onClick={() =>
                                isInlineAction
                                  ? openAction(
                                      next.label === 'Assign space' ? 'assign_space' : 'generate_variants',
                                      c
                                    )
                                  : navigate(next.target)
                              }
                            >
                              {next.label}
                            </button>

                            <button
                              className="btn secondary"
                              onClick={() => navigate(`/cases/${c.id}/overview`)}
                            >
                              Open Case
                            </button>
                          </div>
                        </>
                      )
                    })()}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="dashboard-side-stack">
          <section className="content-section">
            <div className="section-header">
              <div className="section-title">Next Actions</div>
            </div>

            <div className="dashboard-panel-body">
              {next_actions.length === 0 ? (
                <div className="empty-state">No actions</div>
              ) : (
                <div className="dashboard-list">
                  {next_actions.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      className="dashboard-action-item"
                      onClick={() => action.target && navigate(action.target)}
                    >
                      <span className="tag tag-active">{action.type}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="content-section">
            <div className="section-header">
              <div className="section-title">Alerts</div>
            </div>

            <div className="dashboard-panel-body">
              {alerts.length === 0 ? (
                <div className="empty-state">No alerts</div>
              ) : (
                <div className="dashboard-list">
                  {alerts.map((alert, i) => {
                    const target = getAlertTarget(alert)
                    const clickable = !!target

                    if (!clickable) {
                      return (
                        <div key={i} className="dashboard-list-item">
                          <span className="tag tag-warn">{alert.type}</span>
                          <span>{alert.label}</span>
                        </div>
                      )
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        className="dashboard-alert-item"
                        onClick={() => navigate(target)}
                      >
                        <span className="tag tag-warn">{alert.type}</span>
                        <span>{alert.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="content-section">
            <div className="section-header">
              <div className="section-title">Recent Updates</div>
            </div>

            <div className="dashboard-panel-body">
              {recent_updates.length ? (
                <div className="dashboard-list">
                  {recent_updates.map((item, i) => (
                    <div key={i} className="dashboard-list-item">
                      <span className="tag tag-muted">{item.type}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No recent updates</div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="dashboard-secondary-grid">
        <section className="content-section">
          <div className="section-header">
            <div className="section-title">Vacant Spaces</div>
          </div>

          <div className="dashboard-panel-body">
            <div className="dashboard-list">
              <div className="dashboard-list-item">
                <span className="tag tag-active">vacant</span>
                <span>3 vacant lease areas currently available</span>
              </div>

              <div className="dashboard-list-item">
                <span className="tag tag-muted">new</span>
                <span>1 newly added space waiting for case assignment</span>
              </div>
            </div>

            <div className="dashboard-inline-actions">
              <button
                className="btn secondary"
                onClick={() => navigate('/portfolio')}
              >
                Open Portfolio
              </button>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-header">
            <div className="section-title">Cases Needing Decision</div>
          </div>

          <div className="dashboard-panel-body">
            <div className="dashboard-list">
              <div className="dashboard-list-item">
                <span className="tag tag-warn">baseline</span>
                <span>2 cases waiting for baseline decision</span>
              </div>

              <div className="dashboard-list-item">
                <span className="tag tag-warn">space</span>
                <span>1 case still needs a space assignment</span>
              </div>
            </div>

            <div className="dashboard-inline-actions">
              <button
                className="btn secondary"
                onClick={() => navigate('/cases/204/compare')}
              >
                Review Cases
              </button>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-header">
            <div className="section-title">Portfolio Gaps</div>
          </div>

          <div className="dashboard-panel-body">
            <div className="dashboard-list">
              <div className="dashboard-list-item">
                <span className="tag tag-muted">plans</span>
                <span>2 spaces without plan upload</span>
              </div>

              <div className="dashboard-list-item">
                <span className="tag tag-muted">setup</span>
                <span>1 floor without fully defined lease areas</span>
              </div>
            </div>

            <div className="dashboard-inline-actions">
              <button
                className="btn secondary"
                onClick={() => navigate('/portfolio')}
              >
                Review Portfolio
              </button>
            </div>
          </div>
        </section>
      </div>

      {actionState.mode ? (
        <div className="drawer-overlay">
          <div className="drawer">
            <div className="drawer-header">
              <div className="drawer-title">
                {actionState.mode === 'generate_variants' && 'Generate Variants'}
                {actionState.mode === 'assign_space' && 'Assign Space'}
              </div>

                <button className="btn secondary" onClick={closeAction}>
                  Close
                </button>
              </div>

              <div className="drawer-body">
                {actionState.mode === 'generate_variants' ? (
                  <div className="case-create-stack">
                    <div className="section-mini-title">Selected Case</div>
                    <div className="metric-line">
                      <strong>{actionState.caseItem?.title}</strong>
                      <span>
                        {actionState.caseItem?.asset_name} · {actionState.caseItem?.floor_name}
                      </span>
                    </div>

                    <p className="page-subtitle compact">
                      This will generate the first planning variants for the selected case.
                    </p>

                    <div className="dashboard-inline-actions">
                      <button className="btn secondary" onClick={closeAction}>
                        Cancel
                      </button>
                      <button
                        className="btn primary"
                        onClick={() => {
                          console.log('Generate variants for', actionState.caseItem)
                          closeAction()
                        }}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                ) : null}

                {actionState.mode === 'assign_space' ? (
                  <div className="case-create-stack">
                    <div className="section-mini-title">Selected Case</div>
                    <div className="metric-line">
                      <strong>{actionState.caseItem?.title}</strong>
                      <span>Needs a portfolio space assignment</span>
                    </div>

                    <div className="section-mini-title">Suggested Spaces</div>

                    <div className="dashboard-list">
                      <button type="button" className="dashboard-action-item">
                        <span className="tag tag-active">good</span>
                        <span>ABC Tower · Floor 05 · LA-05A · 420 m²</span>
                      </button>

                      <button type="button" className="dashboard-action-item">
                        <span className="tag tag-muted">review</span>
                        <span>ABC Tower · Floor 05 · LA-05B · 360 m²</span>
                      </button>
                    </div>

                    <div className="dashboard-inline-actions">
                      <button className="btn secondary" onClick={closeAction}>
                        Cancel
                      </button>
                      <button
                        className="btn primary"
                        onClick={() => {
                          console.log('Assign space to', actionState.caseItem)
                          closeAction()
                        }}
                      >
                        Assign Selected Space
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
      ) : null}
    </div>
  )
}