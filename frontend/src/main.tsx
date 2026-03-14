import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <Toaster 
    richColors 
    position="bottom-right"
    toastOptions={{
      duration: 3000,
    }}
    visibleToasts={1}
  />
    <App />
  </StrictMode>,
)