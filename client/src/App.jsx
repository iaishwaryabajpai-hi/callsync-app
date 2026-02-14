import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import CallPage from './pages/CallPage'
import CallEndedPage from './pages/CallEndedPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/start" element={<HomePage />} />
      <Route path="/call/:sessionId" element={<CallPage />} />
      <Route path="/call-ended" element={<CallEndedPage />} />
    </Routes>
  )
}
