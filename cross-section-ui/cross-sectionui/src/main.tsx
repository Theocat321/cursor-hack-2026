import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import LayoutA from './LayoutA.tsx'
import LayoutB from './LayoutB.tsx'
import LayoutC from './LayoutC.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/a" element={<LayoutA />} />
        <Route path="/b" element={<LayoutB />} />
        <Route path="/c" element={<LayoutC />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
