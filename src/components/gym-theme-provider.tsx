'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { generateCSSVariables, ThemeColors, DEFAULT_THEME } from '@/lib/theme'

interface GymThemeContextType {
  theme: ThemeColors
  isLoading: boolean
  refreshTheme: () => Promise<void>
}

const GymThemeContext = createContext<GymThemeContextType | undefined>(undefined)

export function GymThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME)
  const [isLoading, setIsLoading] = useState(true)

  const applyTheme = (newTheme: ThemeColors) => {
    setTheme(newTheme)
    const css = generateCSSVariables(newTheme)
    const styleId = 'gym-theme'
    let style = document.getElementById(styleId) as HTMLStyleElement
    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      document.head.appendChild(style)
    }
    style.textContent = css
    document.documentElement.style.setProperty('--font-sans', newTheme.fontFamily)
  }

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/app/branding')
      if (res.ok) {
        const data = await res.json()
        if (data.branding) {
          const newTheme = {
            primary: data.branding.primaryColor,
            secondary: data.branding.secondaryColor,
            accent: data.branding.accentColor,
            background: data.branding.backgroundColor,
            surface: data.branding.surfaceColor,
            text: data.branding.textColor,
            sidebar: data.branding.sidebarColor,
            button: data.branding.buttonColor,
            fontFamily: data.branding.fontFamily,
            primaryForeground: '#FFFFFF',
            secondaryForeground: '#FFFFFF',
            accentForeground: '#000000',
            backgroundForeground: '#FFFFFF',
            surfaceForeground: '#FFFFFF',
            textMuted: '#9CA3AF',
            border: '#374151',
            ring: data.branding.accentColor,
          }
          applyTheme(newTheme)
        }
      }
    } catch (error) {
      console.error('Failed to fetch gym theme:', error)
      applyTheme(DEFAULT_THEME)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTheme()
  }, [])

  return (
    <GymThemeContext.Provider value={{ theme, isLoading, refreshTheme: fetchTheme }}>
      {children}
    </GymThemeContext.Provider>
  )
}

export function useGymTheme() {
  const context = useContext(GymThemeContext)
  if (!context) {
    throw new Error('useGymTheme must be used within a GymThemeProvider')
  }
  return context
}