import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index-clean.css'
import AppClean from './AppClean.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppClean />
  </StrictMode>,
)
