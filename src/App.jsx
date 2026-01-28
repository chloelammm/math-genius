import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './Pages/home.jsx'
import Play from './Pages/Play.tsx'
import TimeChallenge from './Pages/TimeChallenge.jsx'
import MistakeNotes from './Pages/MistakeNotes.jsx'
import SkillPractice from './Pages/SkillPractice.jsx'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Play" element={<Play />} />         
          <Route path="/TimeChallenge" element={<TimeChallenge />} />
          <Route path="/MistakeNotes" element={<MistakeNotes />} />
          <Route path="/SkillPractice" element={<SkillPractice />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
