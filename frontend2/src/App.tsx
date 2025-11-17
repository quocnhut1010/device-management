import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppRouter from '@/routes/AppRouter'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <TooltipProvider delayDuration={0}>
                <AppRouter />
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </SettingsProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
