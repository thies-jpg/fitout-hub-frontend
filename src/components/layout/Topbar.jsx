export default function Topbar() {
  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <div className="topbar-pill">Case 204</div>
        <div className="topbar-pill">Tenant X</div>
        <div className="topbar-pill">LA-05A · 420 m²</div>
      </div>

      <div className="topbar-right">
        <div className="topbar-pill">Status: In Review</div>
        <div className="topbar-user">
          <span className="topbar-avatar" />
          T. Feindt
        </div>
      </div>
    </header>
  )
}