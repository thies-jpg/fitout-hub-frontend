import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import CaseCreatePage from '../pages/case/CaseCreatePage'
import CaseOverviewPage from '../pages/case/CaseOverviewPage'
import ComparePage from '../pages/case/ComparePage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import PortfolioPage from '../pages/portfolio/PortfolioPage'
import TestfitPage from '../pages/case/TestfitPage'

function PlaceholderPage({ title }) {
  return (
    <div className="panel pad">
      <div className="panel-title">{title}</div>
      <p className="page-subtitle">Placeholder page</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="portfolio/new-space" element={<PlaceholderPage title="New Space" />} />
          <Route path="tasks" element={<PlaceholderPage title="Tasks" />} />
          <Route path="help" element={<PlaceholderPage title="Help" />} />
          <Route path="cases/new" element={<CaseCreatePage />} />
          <Route path="cases/:caseId/overview" element={<CaseOverviewPage />} />
          <Route path="cases/:caseId/compare" element={<ComparePage />} />
          <Route path="cases/:caseId/testfit" element={<TestfitPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}