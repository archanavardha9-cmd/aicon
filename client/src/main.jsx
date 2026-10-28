import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

// Set html lang attribute based on stored language preference
try {
  const saved = localStorage.getItem('aicon_preferred_language')
  if (saved === 'hi' || saved === 'en') {
    document.documentElement.lang = saved
  }
} catch {
  document.documentElement.lang = 'en'
}
