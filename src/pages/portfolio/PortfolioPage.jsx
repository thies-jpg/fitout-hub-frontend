import { useState } from 'react'
import { usePortfolioData } from '../../hooks/usePortfolioData'
import PortfolioCreateDrawer from '../../components/portfolio/PortfolioCreateDrawer'
import PortfolioTree from '../../components/portfolio/PortfolioTree'
import PortfolioDetails from '../../components/portfolio/PortfolioDetails'

export default function PortfolioPage() {
  const {
    data,
    loading,
    error,
    selectedNode,
    setSelectedNode,
    selectedContext,
    reload,
  } = usePortfolioData()
  const [createMode, setCreateMode] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function openCreate(mode) {
    setCreateMode(mode)
    setDrawerOpen(true)
  }

  function closeCreate() {
    setDrawerOpen(false)
    setCreateMode(null)
  }

  async function handleCreated(payload) {
    console.log('Created portfolio item:', payload)
    await reload()
  }

  if (loading) {
    return <div className="panel pad">Loading portfolio…</div>
  }

  if (error) {
    return <div className="panel pad">Error: {error}</div>
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <div className="eyebrow">Portfolio</div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">
            Browse assets, floors and lease areas. Start new cases directly from
            portfolio context.
          </p>
        </div>

        <div className="hero-actions">
          <button className="btn primary" onClick={() => openCreate('asset')}>
            New Asset
          </button>
        </div>
      </section>

      <div className="portfolio-layout">
        <PortfolioTree
          items={data}
          selectedNode={selectedNode}
          onSelect={setSelectedNode}
        />

        <PortfolioDetails
          selectedContext={selectedContext}
          onCreate={openCreate}
        />
      </div>

      <PortfolioCreateDrawer
        mode={createMode}
        context={selectedContext}
        open={drawerOpen}
        onClose={closeCreate}
        onSaved={handleCreated}
      />
    </div>
  )
}