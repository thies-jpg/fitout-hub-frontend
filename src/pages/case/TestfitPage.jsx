import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTestfitData } from '../../hooks/useTestfitData'

function formatPercent(value) {
  if (typeof value !== 'number') return '-'
  return `${Math.round(value * 100)}%`
}

export default function TestfitPage() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const [searchParams] = useSearchParams()
  const variantId = searchParams.get('variant') || 'variant_b'

  const {
    data,
    layout,
    loading,
    saving,
    error,
    dirty,
    updateLayout,
    save,
    saveAsVariant,
  } = useTestfitData(variantId)

  const generatorInputs = useMemo(() => {
    return layout?.generator_inputs || {
      workstations_target: 32,
      meeting_rooms_target: 4,
    }
  }, [layout])

  if (loading) return <div className="panel pad">Loading testfit…</div>
  if (error) return <div className="panel pad">Error: {error}</div>
  if (!data) return <div className="panel pad">No testfit data found.</div>

  const variant = data.variant || {}
  const kpis = data.kpis || {}
  const capacity = kpis.capacity || {}
  const performance = kpis.performance || {}
  const commercial = kpis.commercial || {}

  async function handleSave() {
    try {
      await save()
    } catch (err) {
      alert(err.message || 'Save failed')
    }
  }

  async function handleSaveAs() {
    const name = window.prompt('Name for new variant', `${variant.name || 'Variant'} Copy`)
    if (!name) return

    try {
      const result = await saveAsVariant(name)
      if (result?.variant_id) {
        navigate(`/cases/${caseId}/testfit?variant=${result.variant_id}`)
      }
    } catch (err) {
      alert(err.message || 'Save as variant failed')
    }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <div className="eyebrow">Testfit</div>
          <h1 className="page-title">
            {variant.name || 'Variant'} Workspace
          </h1>
          <p className="page-subtitle">
            Interactive planning mode for the selected variant. Canvas comes first,
            tools stay compact, KPI feedback remains visible but secondary.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="btn secondary"
            onClick={() => navigate(`/cases/${caseId}/compare`)}
          >
            Back to Compare
          </button>

          <button
            className="btn secondary"
            onClick={() => navigate(`/cases/${caseId}/overview`)}
          >
            Back to Case
          </button>

          <button
            className="btn secondary"
            onClick={handleSaveAs}
          >
            Save as Variant
          </button>

          <button
            className="btn primary"
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
          </button>
        </div>
      </section>

      <section className="testfit-toolbar">
        <div className="topbar-left">
          <div className="topbar-pill">Variant: {variant.name}</div>
          <div className="topbar-pill">Version: {variant.version_no ?? '-'}</div>
          <div className="topbar-pill">Geometry: {variant.geometry_reference_id}</div>
        </div>

        <div className="topbar-right">
          <div className="topbar-pill">Dirty: {dirty ? 'Yes' : 'No'}</div>
          <div className="topbar-pill">Rules: On</div>
        </div>
      </section>

      <section className="testfit-shell">
        <aside className="testfit-toolrail">
          <button className="tool-button">↖</button>
          <button className="tool-button">✛</button>
          <button className="tool-button is-active">⬚</button>
          <button className="tool-button">◫</button>
          <button className="tool-button">⇄</button>
        </aside>

        <div className="testfit-canvas-card">
          <div className="testfit-canvas">
            <div className="testfit-grid" />
            <div className="plan-outline" />
            <div className="plan-zone">Daylight preferred zone</div>
            <div className="plan-core">Core</div>
            <div className="plan-room">Meeting</div>
            <div className="plan-support">Support</div>
            <div className="plan-ws ws-1">WS</div>
            <div className="plan-ws ws-2">WS</div>
            <div className="plan-ws ws-3">WS</div>
            <div className="plan-ws ws-4">WS</div>

            <div className="overlay-card">
              <div className="overlay-title">Workstations Tool</div>
              <div className="overlay-subtitle">
                Slider changes update the local layout state. Save writes to backend and recalculates KPIs.
              </div>

              <div className="slider-block">
                <div className="overlay-row no-border">
                  <span>Workstations target</span>
                  <strong>{generatorInputs.workstations_target ?? '-'}</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={generatorInputs.workstations_target ?? 32}
                  onChange={(e) =>
                    updateLayout((prev) => ({
                      ...prev,
                      generator_inputs: {
                        ...(prev.generator_inputs || {}),
                        workstations_target: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>

              <div className="slider-block">
                <div className="overlay-row">
                  <span>Meeting rooms target</span>
                  <strong>{generatorInputs.meeting_rooms_target ?? '-'}</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={generatorInputs.meeting_rooms_target ?? 4}
                  onChange={(e) =>
                    updateLayout((prev) => ({
                      ...prev,
                      generator_inputs: {
                        ...(prev.generator_inputs || {}),
                        meeting_rooms_target: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>

              <div className="overlay-row">
                <span>Current conflicts</span>
                <strong>{performance.conflict_count ?? '-'}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testfit-kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Workstations</div>
          <div className="kpi-value">{capacity.workstations ?? '-'}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Meeting</div>
          <div className="kpi-value">{capacity.meeting_rooms ?? '-'}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Efficiency</div>
          <div className="kpi-value">{formatPercent(performance.efficiency_ratio)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Cost / m²</div>
          <div className="kpi-value">€{commercial.cost_per_sqm ?? '-'}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Schedule</div>
          <div className="kpi-value">{commercial.schedule_weeks ?? '-'} w</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Conflicts</div>
          <div className="kpi-value">{performance.conflict_count ?? '-'}</div>
        </div>
      </section>
    </div>
  )
}