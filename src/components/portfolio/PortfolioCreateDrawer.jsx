import { useEffect, useState } from 'react'
import { createAsset, createFloor, createLeaseArea } from '../../api/portfolio'

export default function PortfolioCreateDrawer({
  mode,
  context,
  open,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (!open) return

    if (mode === 'asset') {
      setForm({
        name: '',
        location: '',
        status: 'active',
      })
    }

    if (mode === 'floor') {
      setForm({
        name: '',
        level_index: '',
      })
    }

    if (mode === 'lease_area') {
      setForm({
        name: '',
        area_sqm: '',
        status: 'vacant',
      })
    }
  }, [mode, open])

  function patch(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    try {
      if (mode === 'asset') {
        const result = await createAsset({
          name: form.name,
          location: form.location || null,
          status: form.status || 'active',
        })

        if (onSaved) {
          await onSaved({ mode, form, result })
        }
      }

      if (mode === 'floor') {
        const result = await createFloor({
          asset_id: context?.asset?.id,
          name: form.name,
          level_index:
            form.level_index === '' || form.level_index == null
              ? null
              : Number(form.level_index),
        })

        if (onSaved) {
          await onSaved({ mode, form, result })
        }
      }

      if (mode === 'lease_area') {
        const result = await createLeaseArea({
          asset_id: context?.asset?.id,
          floor_id: context?.floor?.id,
          name: form.name,
          area_sqm:
            form.area_sqm === '' || form.area_sqm == null
              ? null
              : Number(form.area_sqm),
          status: form.status || 'vacant',
        })

        if (onSaved) {
          await onSaved({ mode, form, result })
        }
      }

      onClose()
    } catch (error) {
      console.error('Failed to create portfolio item:', error)
      alert(error.message || 'Failed to save')
    }
  }

  if (!open) return null

  return (
    <div className="drawer-overlay">
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">
            {mode === 'asset' && 'Create Asset'}
            {mode === 'floor' && 'Create Floor'}
            {mode === 'lease_area' && 'Create Lease Area'}
          </div>

          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="drawer-body">
          {mode === 'asset' && (
            <div className="case-create-stack">
              <label className="case-create-field">
                <span className="case-create-field-label">Asset Name</span>
                <input
                  value={form.name || ''}
                  onChange={(e) => patch('name', e.target.value)}
                />
              </label>

              <label className="case-create-field">
                <span className="case-create-field-label">Location</span>
                <input
                  value={form.location || ''}
                  onChange={(e) => patch('location', e.target.value)}
                />
              </label>
            </div>
          )}

          {mode === 'floor' && (
            <div className="case-create-stack">
              <div className="tag tag-muted">
                Asset: {context?.asset?.name}
              </div>

              <label className="case-create-field">
                <span className="case-create-field-label">Floor Name</span>
                <input
                  value={form.name || ''}
                  onChange={(e) => patch('name', e.target.value)}
                />
              </label>

              <label className="case-create-field">
                <span className="case-create-field-label">Level Index</span>
                <input
                  type="number"
                  value={form.level_index || ''}
                  onChange={(e) => patch('level_index', Number(e.target.value))}
                />
              </label>
            </div>
          )}

          {mode === 'lease_area' && (
            <div className="case-create-stack">
              <div className="tag tag-muted">
                {context?.asset?.name} · {context?.floor?.name}
              </div>

              <label className="case-create-field">
                <span className="case-create-field-label">Lease Area Name</span>
                <input
                  value={form.name || ''}
                  onChange={(e) => patch('name', e.target.value)}
                />
              </label>

              <label className="case-create-field">
                <span className="case-create-field-label">Area (m²)</span>
                <input
                  type="number"
                  value={form.area_sqm || ''}
                  onChange={(e) => patch('area_sqm', Number(e.target.value))}
                />
              </label>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>

          <button className="btn primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}