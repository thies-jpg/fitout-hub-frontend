import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCases } from '../../hooks/useCases'

function StatusTag({ status }) {
  const map = {
    draft: 'tag-muted',
    in_review: 'tag-active',
    active: 'tag-active',
    approved: 'tag-ok',
    archived: 'tag-muted',
  }

  return (
    <span className={`tag ${map[status] || 'tag-muted'}`}>
      {status?.replace('_', ' ') || 'unknown'}
    </span>
  )
}

export default function CasesPage() {
  const navigate = useNavigate()
  const { cases, loading, error } = useCases()

  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesStatus =
        statusFilter === 'all' ? true : c.status === statusFilter

      const haystack = [
        c.title,
        c.asset_id,
        c.floor_id,
        c.lease_area_id,
        c.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = haystack.includes(search.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [cases, statusFilter, search])

  const stats = useMemo(() => {
    return {
      total: cases.length,
      inReview: cases.filter((c) => c.status === 'in_review').length,
      draft: cases.filter((c) => c.status === 'draft').length,
      active: cases.filter((c) => c.status === 'active').length,
    }
  }, [cases])

  if (loading) return <div className="panel pad">Loading cases…</div>
  if (error) return <div className="panel pad">Error: {error}</div>

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <div className="eyebrow">Cases</div>
          <h1 className="page-title">Case Workspace</h1>
          <p className="page-subtitle">
            Review all planning cases, continue active workstreams and move
            directly into overview, compare or testfit.
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
            className="btn primary"
            onClick={() => navigate('/cases/create')}
          >
            New Case
          </button>
        </div>
      </section>

      <section className="cases-summary-row">
        <div className="summary-card">
          <div className="summary-label">All Cases</div>
          <div className="summary-value">{stats.total}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">In Review</div>
          <div className="summary-value">{stats.inReview}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Draft</div>
          <div className="summary-value">{stats.draft}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Active</div>
          <div className="summary-value">{stats.active}</div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header cases-toolbar">
          <div>
            <div className="section-title">All Planning Cases</div>
            <div className="section-subtitle">
              Filter by status or search by case, asset, floor or lease area.
            </div>
          </div>

          <div className="cases-toolbar-actions">
            <select
              className="cases-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>

            <input
              className="cases-search"
              type="text"
              placeholder="Search case, asset, floor, lease area…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="cases-grid-wrap">
          <div className="cases-grid">
            {filteredCases.map((c) => (
              <article key={c.id} className="case-card">
                <div className="case-header">
                  <div>
                    <div className="case-title">{c.title}</div>
                    <div className="case-id">{c.id}</div>
                  </div>

                  <StatusTag status={c.status} />
                </div>

                <div className="case-block">
                  <div className="section-mini-title">Location</div>

                  <div className="case-meta-list">
                    <div className="case-meta-row">
                      <span>Asset</span>
                      <strong>{c.asset_id || '-'}</strong>
                    </div>
                    <div className="case-meta-row">
                      <span>Floor</span>
                      <strong>{c.floor_id || '-'}</strong>
                    </div>
                    <div className="case-meta-row">
                      <span>Lease Area</span>
                      <strong>{c.lease_area_id || '-'}</strong>
                    </div>
                  </div>
                </div>

                <div className="case-block">
                  <div className="section-mini-title">Current State</div>

                  <div className="case-meta-list">
                    <div className="case-meta-row">
                      <span>Active Variant</span>
                      <strong>{c.active_variant_id || '-'}</strong>
                    </div>
                    <div className="case-meta-row">
                      <span>Recommended</span>
                      <strong>{c.recommended_variant_id || '-'}</strong>
                    </div>
                    <div className="case-meta-row">
                      <span>Updated</span>
                      <strong>
                        {c.updated_at
                          ? new Date(c.updated_at).toLocaleDateString()
                          : '-'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="case-actions">
                  <button
                    className="btn secondary"
                    onClick={() => navigate(`/cases/${c.id}/overview`)}
                  >
                    Overview
                  </button>

                  <button
                    className="btn secondary"
                    onClick={() => navigate(`/cases/${c.id}/compare`)}
                  >
                    Compare
                  </button>

                  <button
                    className="btn primary"
                    onClick={() =>
                      navigate(`/cases/${c.id}/testfit?variant=${c.active_variant_id}`)
                    }
                  >
                    Testfit
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="cases-empty">
              <div className="cases-empty-title">No matching cases</div>
              <div className="cases-empty-text">
                Try another filter or create a new case.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}