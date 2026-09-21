import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import { DemoProvider } from '@/store/DemoStore'
import { ToastProvider } from '@/store/toast'
import { TooltipProvider } from '@/components/ui/misc'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemoProvider>
        <ToastProvider>
          <TooltipProvider delayDuration={200}>
            <App />
          </TooltipProvider>
        </ToastProvider>
      </DemoProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
