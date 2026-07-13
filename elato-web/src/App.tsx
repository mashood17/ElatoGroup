import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { StayPage } from './pages/StayPage'
import { CelebrePage } from './pages/CelebrePage'
import { EventsPage } from './pages/EventsPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/elato-stay" element={<StayPage />} />
        <Route path="/elato-celebre" element={<CelebrePage />} />
        <Route path="/elato-events" element={<EventsPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
