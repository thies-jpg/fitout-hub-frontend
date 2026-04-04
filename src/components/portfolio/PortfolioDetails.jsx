import { useNavigate } from 'react-router-dom'

function SummaryCard({ title, children }) {
  return (
    <article className="summary-card">
      <div className="section-mini-title">{title}</div>
      {children}
    </article>
  )
}

function EmptyState() {
  return (
    <div className="content-section">
      <div className="section-header">
        <div>
          <div className="section-title">Portfolio Details</div>
          <div className="section-subtitle">
            Select an object, floor or lease area from the left.
          </div>
        </div>
      </div>

      <div className="empty-state">
        No selection yet.
      </div>
    </div>
  )
}

export default function PortfolioDetails({ selectedContext, onCreate }) {
  const navigate = useNavigate()

  if (!selectedContext) {
    return <EmptyState />
  }

  if (selectedContext.type === 'asset') {
    const { asset, floors, leaseAreas, cases } = selectedContext

    return (
      <div className="page-stack">
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">{asset.name}</div>
              <div className="section-subtitle">
                Asset overview with all related floors, lease areas and cases.
              </div>
            </div>

            <div className="hero-actions">
              <button
                className="btn primary"
                onClick={() => onCreate('floor')}
              >
                Add Floor
              </button>
            </div>
          </div>

          <div className="portfolio-details-grid">
            <SummaryCard title="Asset">
              <div className="metric-line">
                <strong>{asset.location || '-'}</strong>
                <span>Location</span>
              </div>
              <div className="metric-line">
                <strong>{asset.status || '-'}</strong>
                <span>Status</span>
              </div>
            </SummaryCard>

            <SummaryCard title="Floors">
              <div className="metric-line">
                <strong>{floors.length}</strong>
                <span>Available floors</span>
              </div>
            </SummaryCard>

            <SummaryCard title="Lease Areas">
              <div className="metric-line">
                <strong>{leaseAreas.length}</strong>
                <span>Total lease areas</span>
              </div>
            </SummaryCard>

            <SummaryCard title="Cases">
              <div className="metric-line">
                <strong>{cases.length}</strong>
                <span>Related cases</span>
              </div>
            </SummaryCard>
          </div>
        </section>

        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Related Lease Areas</div>
            </div>
          </div>

          <div className="variant-grid">
            {leaseAreas.map((leaseArea) => (
              <article className="variant-card" key={leaseArea.id}>
                <div className="variant-head">
                  <div>
                    <div className="variant-title">{leaseArea.name}</div>
                    <div className="variant-sub">
                      {leaseArea.area_sqm} m²
                    </div>
                  </div>
                  <span className="tag tag-muted">{leaseArea.status}</span>
                </div>

                <div className="variant-actions">
                  <button
                    className="btn secondary"
                    onClick={() =>
                      navigate(
                        `/cases/new?asset_id=${asset.id}&floor_id=${leaseArea.floor_id}&lease_area_id=${leaseArea.id}`
                      )
                    }
                  >
                    Create Case
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (selectedContext.type === 'floor') {
    const { asset, floor, leaseAreas, cases } = selectedContext

    return (
      <div className="page-stack">
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">{floor.name}</div>
              <div className="section-subtitle">
                {asset.name} · filtered to this floor only.
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn primary" onClick={() => onCreate('lease_area')}>
                Add Lease Area
              </button>
            </div>
          </div>

          <div className="portfolio-details-grid">
            <SummaryCard title="Floor">
              <div className="metric-line">
                <strong>{floor.level_index ?? '-'}</strong>
                <span>Level index</span>
              </div>
            </SummaryCard>

            <SummaryCard title="Lease Areas">
              <div className="metric-line">
                <strong>{leaseAreas.length}</strong>
                <span>Lease areas on this floor</span>
              </div>
            </SummaryCard>

            <SummaryCard title="Cases">
              <div className="metric-line">
                <strong>{cases.length}</strong>
                <span>Cases on this floor</span>
              </div>
            </SummaryCard>
          </div>
        </section>

        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Lease Areas on this Floor</div>
            </div>
          </div>

          <div className="variant-grid">
            {leaseAreas.map((leaseArea) => (
              <article className="variant-card" key={leaseArea.id}>
                <div className="variant-head">
                  <div>
                    <div className="variant-title">{leaseArea.name}</div>
                    <div className="variant-sub">
                      {leaseArea.area_sqm} m²
                    </div>
                  </div>
                  <span className="tag tag-muted">{leaseArea.status}</span>
                </div>

                <div className="variant-actions">
                  <button
                    className="btn primary"
                    onClick={() =>
                      navigate(
                        `/cases/new?asset_id=${asset.id}&floor_id=${floor.id}&lease_area_id=${leaseArea.id}`
                      )
                    }
                  >
                    Create Case
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (selectedContext.type === 'lease_area') {
    const { asset, floor, leaseArea, cases } = selectedContext

    return (
      <div className="page-stack">
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">{leaseArea.name}</div>
              <div className="section-subtitle">
                {asset.name} · {floor.name}
              </div>
            </div>

            <div className="hero-actions">
              <button
                className="btn primary"
                onClick={() =>
                  navigate(
                    `/cases/new?asset_id=${asset.id}&floor_id=${floor.id}&lease_area_id=${leaseArea.id}`
                  )
                }
              >
                Create Case
              </button>
            </div>
          </div>

          <div className="portfolio-details-grid">
            <SummaryCard title="Lease Area">
              <div className="metric-line">
                <strong>{leaseArea.area_sqm}</strong>
                <span>Area m²</span>
              </div>
              <div className="metric-line">
                <strong>{leaseArea.status || '-'}</strong>
                <span>Status</span>
              </div>
            </SummaryCard>

            <SummaryCard title="Context">
              <div className="metric-line">
                <strong>{asset.name}</strong>
                <span>Asset</span>
              </div>
              <div className="metric-line">
                <strong>{floor.name}</strong>
                <span>Floor</span>
              </div>
            </SummaryCard>

            <SummaryCard title="Cases">
              <div className="metric-line">
                <strong>{cases.length}</strong>
                <span>Related cases</span>
              </div>
            </SummaryCard>
          </div>
        </section>

        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Related Cases</div>
            </div>
          </div>

          {cases.length === 0 ? (
            <div className="empty-state">
              No cases yet for this lease area.
            </div>
          ) : (
            <div className="variant-grid">
              {cases.map((entry) => (
                <article className="variant-card" key={entry.id}>
                  <div className="variant-head">
                    <div>
                      <div className="variant-title">{entry.title}</div>
                      <div className="variant-sub">{entry.id}</div>
                    </div>
                    <span className="tag tag-active">{entry.status}</span>
                  </div>

                  <div className="variant-actions">
                    <button
                      className="btn secondary"
                      onClick={() => navigate(`/cases/${entry.id}/overview`)}
                    >
                      Open Case
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  return <EmptyState />
}