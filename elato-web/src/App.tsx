import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ErrorBoundary } from './components/ErrorBoundary'

// Route-based code splitting (PRD Ch. 46.2) — each page ships as its own chunk.
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const StayPage = lazy(() => import('./pages/StayPage').then((m) => ({ default: m.StayPage })))
const CelebrePage = lazy(() => import('./pages/CelebrePage').then((m) => ({ default: m.CelebrePage })))
const EventsPage = lazy(() => import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function RouteFallback() {
  return <div className="min-h-screen bg-surface-base" aria-hidden="true" />
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/elato-stay" element={<StayPage />} />
            <Route path="/elato-celebre" element={<CelebrePage />} />
            <Route path="/elato-events" element={<EventsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
