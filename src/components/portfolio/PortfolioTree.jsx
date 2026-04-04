function TreeButton({ active, onClick, children, level = 0 }) {
  return (
    <button
      type="button"
      className={`portfolio-tree-item ${active ? 'is-active' : ''}`}
      data-level={level}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function PortfolioTree({
  items,
  selectedNode,
  onSelect,
}) {
  return (
    <div className="content-section">
      <div className="section-header">
        <div>
          <div className="section-title">Portfolio Structure</div>
          <div className="section-subtitle">
            Objects, floors and lease areas
          </div>
        </div>
      </div>

      <div className="portfolio-tree">
        {items.map((asset) => {
          const assetActive =
            selectedNode?.type === 'asset' && selectedNode?.id === asset.id

          return (
            <div key={asset.id} className="portfolio-tree-group">
              <TreeButton
                active={assetActive}
                level={0}
                onClick={() => onSelect({ type: 'asset', id: asset.id })}
              >
                <div className="portfolio-tree-main">
                  <span className="portfolio-tree-label">{asset.name}</span>
                  <span className="tag tag-muted">{asset.location || '—'}</span>
                </div>
              </TreeButton>

              {(asset.floors || []).map((floor) => {
                const floorActive =
                  selectedNode?.type === 'floor' && selectedNode?.id === floor.id

                return (
                  <div key={floor.id}>
                    <TreeButton
                      active={floorActive}
                      level={1}
                      onClick={() => onSelect({ type: 'floor', id: floor.id })}
                    >
                      <div className="portfolio-tree-main">
                        <span className="portfolio-tree-label">{floor.name}</span>
                        <span className="tag tag-muted">
                          Level {floor.level_index ?? '—'}
                        </span>
                      </div>
                    </TreeButton>

                    {(floor.lease_areas || []).map((leaseArea) => {
                      const leaseAreaActive =
                        selectedNode?.type === 'lease_area' &&
                        selectedNode?.id === leaseArea.id

                      return (
                        <TreeButton
                          key={leaseArea.id}
                          active={leaseAreaActive}
                          level={2}
                          onClick={() =>
                            onSelect({ type: 'lease_area', id: leaseArea.id })
                          }
                        >
                          <div className="portfolio-tree-main">
                            <span className="portfolio-tree-label">
                              {leaseArea.name}
                            </span>
                            <span className="tag tag-active">
                              {leaseArea.area_sqm} m²
                            </span>
                          </div>
                        </TreeButton>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}