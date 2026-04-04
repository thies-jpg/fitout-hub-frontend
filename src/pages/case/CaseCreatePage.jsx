import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  createCase,
  saveCaseDemand,
  runSpaceFit,
  assignSpaceToCase,
  finalizeCase,
  generateVariants,
} from '../../api/caseCreate'

const DEFAULT_PROGRAM_ITEMS = [
  { type: 'meeting_m', qty: 2, priority: 'high', mode: 'must', note: '' },
  { type: 'focus_single', qty: 4, priority: 'high', mode: 'must', note: '' },
]

const DEFAULT_WORKPLACE = {
  headcount: 80,
  peak_occupancy_ratio: 0.7,
  desk_sharing_ratio: 0.8,
  focus_ratio: 'medium',
  collaboration_ratio: 'medium',
  visitor_ratio: 'low',
  representation_level: 'medium',
  wellbeing_priority: 'medium',
  canteen_model: 'tea_kitchen',
  team_neighborhoods: 'yes',
  privacy_requirement: 'medium',
  support_service_level: 'medium',
  executive_ratio: 0.08,
}

const ROOM_OPTIONS = [
  'open_space_workstation',
  'shared_desk',
  'office_1',
  'meeting_s',
  'meeting_m',
  'meeting_l',
  'focus_single',
  'phonebooth',
  'silent_room',
  'tea_kitchen',
  'lounge',
  'reception',
]

const STRATEGIES = [
  {
    id: 'efficiency',
    title: 'Efficiency',
    text: 'Low area per workplace, fewer optional rooms, stronger cost discipline.',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    text: 'Default mix of desks, meeting, focus and support.',
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    text: 'More teamwork, workshop and agile spaces.',
  },
]

function Stepper({ step, items }) {
  return (
    <div className="case-create-stepper">
      {items.map((item, index) => {
        const current = index + 1 === step
        const done = index + 1 < step
        return (
          <div
            key={item}
            className={`case-create-step ${current ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
          >
            <div className="case-create-step-index">{index + 1}</div>
            <div className="case-create-step-label">{item}</div>
          </div>
        )
      })}
    </div>
  )
}

function ProgramTable({ items, onChange, onAdd, onRemove }) {
  return (
    <div className="case-create-table-wrap">
      <table className="case-create-table">
        <thead>
          <tr>
            <th>Room type</th>
            <th>Qty</th>
            <th>Priority</th>
            <th>Mode</th>
            <th>Note</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.type}-${index}`}>
              <td>
                <select
                  value={item.type}
                  onChange={(e) => onChange(index, 'type', e.target.value)}
                >
                  {ROOM_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={item.qty}
                  onChange={(e) => onChange(index, 'qty', Number(e.target.value))}
                />
              </td>
              <td>
                <select
                  value={item.priority}
                  onChange={(e) => onChange(index, 'priority', e.target.value)}
                >
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
              </td>
              <td>
                <select
                  value={item.mode}
                  onChange={(e) => onChange(index, 'mode', e.target.value)}
                >
                  <option value="must">Required</option>
                  <option value="should">Preferred</option>
                  <option value="optional">Optional</option>
                </select>
              </td>
              <td>
                <input
                  value={item.note}
                  placeholder="Optional note"
                  onChange={(e) => onChange(index, 'note', e.target.value)}
                />
              </td>
              <td>
                <button className="btn secondary" onClick={() => onRemove(index)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="case-create-table-actions">
        <button className="btn secondary" onClick={onAdd}>
          Add room
        </button>
      </div>
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <label className="case-create-field">
      <span className="case-create-field-label">{label}</span>
      {children}
      {hint ? <span className="case-create-field-hint">{hint}</span> : null}
    </label>
  )
}

function StrategyCard({ strategy, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`strategy-card ${selected ? 'is-selected' : ''}`}
      onClick={() => onToggle(strategy.id)}
    >
      <div className="strategy-card-title">{strategy.title}</div>
      <div className="strategy-card-text">{strategy.text}</div>
    </button>
  )
}

export default function CaseCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const preselectedAssetId = searchParams.get('asset_id') || ''
  const preselectedFloorId = searchParams.get('floor_id') || ''
  const preselectedLeaseAreaId = searchParams.get('lease_area_id') || ''
  const backToPortfolioUrl =
    preselectedLeaseAreaId
      ? `/portfolio?lease_area_id=${preselectedLeaseAreaId}`
      : preselectedFloorId
        ? `/portfolio?floor_id=${preselectedFloorId}`
        : preselectedAssetId
          ? `/portfolio?asset_id=${preselectedAssetId}`
          : '/portfolio'
  const steps = ['Basis', 'Demand', 'Fläche', 'Match Review', 'Start']

  const [step, setStep] = useState(1)
  const [caseId, setCaseId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [basis, setBasis] = useState({
    case_name: '',
    tenant_name: '',
    location: 'Berlin',
    target_area_m2: 1500,
    notes: '',
    asset_id: preselectedAssetId,
    floor_id: preselectedFloorId,
    lease_area_id: preselectedLeaseAreaId,
  })
  const [programItems, setProgramItems] = useState(DEFAULT_PROGRAM_ITEMS)
  const [workplace, setWorkplace] = useState(DEFAULT_WORKPLACE)
  const [fitResults, setFitResults] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [selectedStrategies, setSelectedStrategies] = useState(['balanced', 'efficiency'])

  const demandSummary = useMemo(() => {
    const directRooms = programItems.reduce((sum, item) => sum + Number(item.qty || 0), 0)
    const derivedDesks = Math.round(
      Number(workplace.headcount || 0) *
        Number(workplace.peak_occupancy_ratio || 0) *
        Number(workplace.desk_sharing_ratio || 0)
    )
    return {
      directRooms,
      derivedDesks,
      focusHint:
        workplace.focus_ratio === 'high'
          ? 'More focus rooms likely'
          : workplace.focus_ratio === 'low'
            ? 'Lower focus demand'
            : 'Balanced focus demand',
    }
  }, [programItems, workplace])

  function patchBasis(field, value) {
    setBasis((prev) => ({ ...prev, [field]: value }))
  }

  function patchWorkplace(field, value) {
    setWorkplace((prev) => ({ ...prev, [field]: value }))
  }

  function updateProgramItem(index, field, value) {
    setProgramItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    )
  }

  function addProgramItem() {
    setProgramItems((prev) => [
      ...prev,
      { type: 'meeting_s', qty: 1, priority: 'medium', mode: 'optional', note: '' },
    ])
  }

  function removeProgramItem(index) {
    setProgramItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  function toggleStrategy(strategyId) {
    setSelectedStrategies((prev) => {
      if (prev.includes(strategyId)) {
        return prev.length === 1 ? prev : prev.filter((id) => id !== strategyId)
      }
      return [...prev, strategyId]
    })
  }

  async function handleCreateBaseCase() {
    setBusy(true)
    setError('')
    try {
      const result = await createCase({
        title: basis.case_name,
        tenant_name: basis.tenant_name,
        location: basis.location,
        target_area_m2: basis.target_area_m2,
        notes: basis.notes,
        asset_id: basis.asset_id || null,
        floor_id: basis.floor_id || null,
        lease_area_id: basis.lease_area_id || null,
      })
      setCaseId(result.case_id ?? result.id)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Could not create case')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveDemand() {
    if (!caseId) return
    setBusy(true)
    setError('')
    try {
      await saveCaseDemand(caseId, {
        program: programItems,
        workplace,
      })
      setStep(3)
    } catch (err) {
      setError(err.message || 'Could not save demand')
    } finally {
      setBusy(false)
    }
  }

  async function handleRunFit() {
    if (!caseId) return
    setBusy(true)
    setError('')
    try {
      const result = await runSpaceFit(caseId, {
        location: basis.location,
        target_area_m2: basis.target_area_m2,
      })
      setFitResults(result.spaces || result || [])
    } catch (err) {
      setError(err.message || 'Could not run fit check')
    } finally {
      setBusy(false)
    }
  }

  async function handleAssignSpace(space) {
    if (!caseId) return
    setBusy(true)
    setError('')
    try {
      await assignSpaceToCase(caseId, space.space_id || space.id)
      setSelectedSpace(space)
      setStep(4)
    } catch (err) {
      setError(err.message || 'Could not assign space')
    } finally {
      setBusy(false)
    }
  }

  async function handleFinalizeAndGenerate() {
    if (!caseId) return
    setBusy(true)
    setError('')
    try {
      await finalizeCase(caseId, {
        selected_space_id: selectedSpace?.space_id || selectedSpace?.id,
        strategies: selectedStrategies,
      })
      await generateVariants(caseId, selectedStrategies)
      navigate(`/cases/${caseId}/overview`)
    } catch (err) {
      setError(err.message || 'Could not generate variants')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <div className="eyebrow">Portfolio</div>
          <h1 className="page-title">Create New Case</h1>
          <p className="page-subtitle">
            Create a case from tenant demand, workplace parameters and portfolio space matching.
          </p>
        </div>

        <div className="hero-actions">
          <button className="btn secondary" onClick={() => navigate(backToPortfolioUrl)}>
            Back to Portfolio
          </button>
        </div>
      </section>

      <Stepper step={step} items={steps} />

      {error ? (
        <div className="content-section">
          <div className="section-header">
            <div className="section-title">Error</div>
          </div>
          <div className="pad">
            <div className="tag tag-warn">{error}</div>
          </div>
        </div>
      ) : null}

      {step === 1 && (
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Case Basis</div>
              <div className="section-subtitle">
                Create the case container first.
              </div>
            </div>
          </div>

          {basis.asset_id || basis.floor_id || basis.lease_area_id ? (
            <div className="case-create-context-bar">
              {basis.asset_id ? <span className="tag tag-muted">Asset: {basis.asset_id}</span> : null}
              {basis.floor_id ? <span className="tag tag-muted">Floor: {basis.floor_id}</span> : null}
              {basis.lease_area_id ? (
                <span className="tag tag-active">Lease Area: {basis.lease_area_id}</span>
              ) : null}
            </div>
          ) : null}

          <div className="case-create-stack">
            <div className="case-create-grid">
              <Field label="Case name">
                <input value={basis.case_name} onChange={(e) => patchBasis('case_name', e.target.value)} />
              </Field>

              <Field label="Tenant / prospect">
                <input value={basis.tenant_name} onChange={(e) => patchBasis('tenant_name', e.target.value)} />
              </Field>

              <Field label="Location">
                <input value={basis.location} onChange={(e) => patchBasis('location', e.target.value)} />
              </Field>

              <Field label="Target area (m²)">
                <input
                  type="number"
                  min="0"
                  value={basis.target_area_m2}
                  onChange={(e) => patchBasis('target_area_m2', Number(e.target.value))}
                />
              </Field>

              <Field label="Notes">
                <textarea
                  rows="4"
                  value={basis.notes}
                  onChange={(e) => patchBasis('notes', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="case-create-footer">
            <button className="btn primary" onClick={handleCreateBaseCase} disabled={busy || !basis.case_name}>
              {busy ? 'Creating…' : 'Continue'}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Demand Setup</div>
              <div className="section-subtitle">
                Combine direct tenant requirements with workplace strategy inputs.
              </div>
            </div>
            <div className="tag tag-muted">Case: {caseId}</div>
          </div>

          <div className="case-create-stack">
            <article className="summary-card">
              <div className="section-mini-title">How this step works</div>
              <p className="page-subtitle compact">
                Direct tenant requirements are taken into the next step as explicit inputs.
                Workplace strategy settings influence the derived program and first variants.
              </p>
            </article>

            <article className="summary-card">
              <div className="section-mini-title">Direct Tenant Requirements</div>
              <p className="page-subtitle compact">
                Rooms the tenant explicitly requested. These entries are carried directly into program review.
              </p>

              <ProgramTable
                items={programItems}
                onChange={updateProgramItem}
                onAdd={addProgramItem}
                onRemove={removeProgramItem}
              />
            </article>

            <article className="summary-card">
              <div className="section-mini-title">Workplace Strategy</div>
              <p className="page-subtitle compact">
                These parameters do not directly create rooms here. They influence the derived program in the next step.
              </p>

              <div className="case-create-subgroups">
                <div className="case-create-subgroup">
                  <div className="case-create-subgroup-title">Occupancy</div>
                  <div className="case-create-grid">
                    <Field label="Headcount" hint="Total number of users">
                      <input
                        type="number"
                        min="1"
                        value={workplace.headcount}
                        onChange={(e) => patchWorkplace('headcount', Number(e.target.value))}
                      />
                    </Field>

                    <Field
                      label="Peak occupancy"
                      hint="Share of people expected on site at the same time"
                    >
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={workplace.peak_occupancy_ratio}
                        onChange={(e) =>
                          patchWorkplace('peak_occupancy_ratio', Number(e.target.value))
                        }
                      />
                    </Field>

                    <Field
                      label="Desk sharing"
                      hint="Desks per peak user"
                    >
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={workplace.desk_sharing_ratio}
                        onChange={(e) =>
                          patchWorkplace('desk_sharing_ratio', Number(e.target.value))
                        }
                      />
                    </Field>

                    <Field
                      label="Executive ratio"
                      hint="Share of leadership roles with elevated workspace needs"
                    >
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={workplace.executive_ratio}
                        onChange={(e) =>
                          patchWorkplace('executive_ratio', Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="case-create-subgroup">
                  <div className="case-create-subgroup-title">Work Style</div>
                  <div className="case-create-grid">
                    <Field label="Need for focused work">
                      <select
                        value={workplace.focus_ratio}
                        onChange={(e) => patchWorkplace('focus_ratio', e.target.value)}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>

                    <Field label="Need for collaboration">
                      <select
                        value={workplace.collaboration_ratio}
                        onChange={(e) => patchWorkplace('collaboration_ratio', e.target.value)}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>

                    <Field label="Privacy requirement">
                      <select
                        value={workplace.privacy_requirement}
                        onChange={(e) => patchWorkplace('privacy_requirement', e.target.value)}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>

                    <Field label="Team neighborhoods">
                      <select
                        value={workplace.team_neighborhoods}
                        onChange={(e) => patchWorkplace('team_neighborhoods', e.target.value)}
                      >
                        <option value="yes">yes</option>
                        <option value="no">no</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="case-create-subgroup">
                  <div className="case-create-subgroup-title">Client & Representation</div>
                  <div className="case-create-grid">
                    <Field label="Visitor intensity">
                      <select
                        value={workplace.visitor_ratio}
                        onChange={(e) => patchWorkplace('visitor_ratio', e.target.value)}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>

                    <Field label="Representation needs">
                      <select
                        value={workplace.representation_level}
                        onChange={(e) => patchWorkplace('representation_level', e.target.value)}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="case-create-subgroup">
                  <div className="case-create-subgroup-title">Services & Wellbeing</div>
                  <div className="case-create-grid">
                    <Field label="Canteen model">
                      <select
                        value={workplace.canteen_model}
                        onChange={(e) => patchWorkplace('canteen_model', e.target.value)}
                      >
                        <option value="none">none</option>
                        <option value="pantry">pantry</option>
                        <option value="tea_kitchen">tea_kitchen</option>
                        <option value="cafeteria">cafeteria</option>
                        <option value="catering">catering</option>
                      </select>
                    </Field>

                    <Field label="Support service level">
                      <select
                        value={workplace.support_service_level}
                        onChange={(e) =>
                          patchWorkplace('support_service_level', e.target.value)
                        }
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>

                    <Field label="Wellbeing priority">
                      <select
                        value={workplace.wellbeing_priority}
                        onChange={(e) => patchWorkplace('wellbeing_priority', e.target.value)}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            </article>

            <article className="summary-card">
              <div className="section-mini-title">Demand Summary</div>

              <div className="case-create-summary-grid">
                <div className="metric-line">
                  <strong>{demandSummary.directRooms}</strong>
                  <span>Direct room items</span>
                </div>

                <div className="metric-line">
                  <strong>{demandSummary.derivedDesks}</strong>
                  <span>Derived desk target</span>
                </div>

                <div className="metric-line">
                  <strong>{demandSummary.focusHint}</strong>
                  <span>Focus outlook</span>
                </div>
              </div>
            </article>
          </div>

          <div className="case-create-footer">
            <button className="btn secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn primary" onClick={handleSaveDemand} disabled={busy}>
              {busy ? 'Saving…' : 'Continue'}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Choose Space</div>
              <div className="section-subtitle">
                Select how this case should connect to available portfolio space.
              </div>
            </div>
          </div>

          <div className="case-create-stack">
            <article className="summary-card">
              <div className="section-mini-title">How this step works</div>
              <p className="page-subtitle compact">
                You can check free spaces for fit, assign an available space directly,
                or create a new portfolio space first.
              </p>
            </article>

            <div className="case-create-cards case-create-cards--three">
              <article className="case-option-card">
                <div className="section-mini-title">Suggest fitting spaces</div>
                <p className="page-subtitle compact">
                  Compare tenant demand against free spaces in the portfolio.
                </p>
                <button className="btn primary" onClick={handleRunFit} disabled={busy}>
                  {busy ? 'Checking…' : 'Run Fit Check'}
                </button>
              </article>

              <article className="case-option-card">
                <div className="section-mini-title">Assign free space</div>
                <p className="page-subtitle compact">
                  Use one of the available free spaces directly if you already know the target.
                </p>
                <button className="btn secondary" onClick={handleRunFit} disabled={busy}>
                  Show Available Spaces
                </button>
              </article>

              <article className="case-option-card">
                <div className="section-mini-title">Create new portfolio space</div>
                <p className="page-subtitle compact">
                  Create a new free space in the portfolio if no suitable option exists yet.
                </p>
                <button className="btn secondary" onClick={() => navigate('/portfolio/new-space')}>
                  New Space
                </button>
              </article>
            </div>

            {selectedSpace ? (
              <article className="summary-card">
                <div className="section-mini-title">Current Selection</div>

                <div className="case-create-summary-grid">
                  <div className="metric-line">
                    <strong>{selectedSpace.asset || selectedSpace.asset_name || '-'}</strong>
                    <span>Asset</span>
                  </div>

                  <div className="metric-line">
                    <strong>{selectedSpace.area || selectedSpace.area_m2 || '-'}</strong>
                    <span>Area m²</span>
                  </div>

                  <div className="metric-line">
                    <strong>{selectedSpace.recognition_status || 'unknown'}</strong>
                    <span>Recognition</span>
                  </div>
                </div>
              </article>
            ) : null}

            <section className="content-section soft-section">
              <div className="section-header">
                <div>
                  <div className="section-title">Fit Results</div>
                  <div className="section-subtitle">
                    Suggested portfolio spaces based on demand and workplace settings.
                  </div>
                </div>
              </div>

              <div className="variant-grid case-fit-grid">
                {fitResults.length === 0 ? (
                  <div className="empty-state">
                    No fit results yet. Run the fit check first.
                  </div>
                ) : (
                  fitResults.map((space) => (
                    <article
                      className={`variant-card ${selectedSpace?.space_id === space.space_id ? 'is-selected' : ''}`}
                      key={space.space_id || space.id}
                    >
                      <div className="variant-head">
                        <div>
                          <div className="variant-title">
                            {space.asset || space.asset_name || 'Space'}
                          </div>
                          <div className="variant-sub">
                            {space.floor || 'Floor n/a'} · {space.area || space.area_m2 || '-'} m²
                          </div>
                        </div>
                        <span className="tag tag-active">
                          Fit {space.fit_score != null ? `${Math.round(space.fit_score * 100)}%` : '-'}
                        </span>
                      </div>

                      <div className="variant-section">
                        <div className="metric-line">
                          <strong>{space.match || 'review'}</strong>
                          <span>Fit status</span>
                        </div>
                        <div className="metric-line">
                          <strong>{space.recognition_status || 'unknown'}</strong>
                          <span>Recognition</span>
                        </div>
                        <div className="metric-line">
                          <strong>{space.constraint_count ?? '-'}</strong>
                          <span>Constraints</span>
                        </div>
                      </div>

                      <div className="variant-actions">
                        <button className="btn primary" onClick={() => handleAssignSpace(space)}>
                          Assign Space
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="case-create-footer">
            <button className="btn secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              className="btn primary"
              onClick={() => setStep(4)}
              disabled={!selectedSpace}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Match Review</div>
              <div className="section-subtitle">
                Review demand, assigned space and first fit recommendation before starting variants.
              </div>
            </div>
          </div>

          <div className="case-create-stack">
            <div className="case-create-grid case-create-grid--three">
              <article className="summary-card">
                <div className="section-mini-title">Demand Summary</div>
                <div className="metric-line">
                  <strong>{demandSummary.directRooms}</strong>
                  <span>Direct room items</span>
                </div>
                <div className="metric-line">
                  <strong>{demandSummary.derivedDesks}</strong>
                  <span>Derived desk target</span>
                </div>
                <div className="metric-line">
                  <strong>{demandSummary.focusHint}</strong>
                  <span>Focus outlook</span>
                </div>
              </article>

              <article className="summary-card">
                <div className="section-mini-title">Assigned Space</div>
                <div className="metric-line">
                  <strong>{selectedSpace?.asset || selectedSpace?.asset_name || '-'}</strong>
                  <span>Asset</span>
                </div>
                <div className="metric-line">
                  <strong>{selectedSpace?.area || selectedSpace?.area_m2 || '-'}</strong>
                  <span>Area m²</span>
                </div>
                <div className="metric-line">
                  <strong>{selectedSpace?.recognition_status || 'unknown'}</strong>
                  <span>Recognition</span>
                </div>
              </article>

              <article className="summary-card">
                <div className="section-mini-title">Fit Decision</div>
                <div className="metric-line">
                  <strong>
                    {selectedSpace?.fit_score != null
                      ? `${Math.round(selectedSpace.fit_score * 100)}%`
                      : '-'}
                  </strong>
                  <span>Fit score</span>
                </div>
                <div className="metric-line">
                  <strong>{selectedSpace?.match || 'review'}</strong>
                  <span>Recommendation</span>
                </div>
                <div className="metric-line">
                  <strong>{selectedSpace?.constraint_count ?? '-'}</strong>
                  <span>Constraint count</span>
                </div>
              </article>
            </div>

            <article className="summary-card">
              <div className="section-mini-title">Review Notes</div>
              <div className="case-review-list">
                <div className="case-review-item">
                  <span className="tag tag-muted">Direct</span>
                  <span>Tenant room requirements will be carried into variant generation.</span>
                </div>
                <div className="case-review-item">
                  <span className="tag tag-muted">Derived</span>
                  <span>Workplace parameters influence desk count, focus demand and social/support mix.</span>
                </div>
                <div className="case-review-item">
                  <span className="tag tag-muted">Portfolio</span>
                  <span>Selected space is used as the first fit basis before Testfit refinement.</span>
                </div>
              </div>
            </article>
          </div>

          <div className="case-create-footer">
            <button className="btn secondary" onClick={() => setStep(3)}>
              Back
            </button>
            <button className="btn primary" onClick={() => setStep(5)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-title">Start Variants</div>
              <div className="section-subtitle">
                Select the initial strategies that should be generated for this case.
              </div>
            </div>
          </div>

          <div className="case-create-stack">
            <article className="summary-card">
              <div className="section-mini-title">Variant Strategies</div>
              <p className="page-subtitle compact">
                Choose one or more starting strategies. These create the first comparable options before Testfit refinement.
              </p>

              <div className="case-create-cards">
                {STRATEGIES.map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    selected={selectedStrategies.includes(strategy.id)}
                    onToggle={toggleStrategy}
                  />
                ))}
              </div>
            </article>

            <article className="summary-card">
              <div className="section-mini-title">Start Preview</div>

              <div className="case-create-summary-grid">
                <div className="metric-line">
                  <strong>{selectedStrategies.length}</strong>
                  <span>Selected strategies</span>
                </div>

                <div className="metric-line">
                  <strong>{demandSummary.derivedDesks}</strong>
                  <span>Initial desk target</span>
                </div>

                <div className="metric-line">
                  <strong>{selectedSpace?.area || selectedSpace?.area_m2 || '-'}</strong>
                  <span>Assigned area</span>
                </div>
              </div>
            </article>
          </div>

          <div className="case-create-footer">
            <button className="btn secondary" onClick={() => setStep(4)}>
              Back
            </button>
            <button className="btn primary" onClick={handleFinalizeAndGenerate} disabled={busy}>
              {busy ? 'Generating…' : 'Create Case & Generate Variants'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}