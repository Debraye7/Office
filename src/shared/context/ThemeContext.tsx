"use client"

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Detectar preferencia guardada o sistema por defecto
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setTheme(saved)
    } else {
      setTheme('system')
    }
  }, [])

  // Resolver el tema actual (solo usado si theme === 'system')
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const resolve = () => setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')

    resolve()

    mediaQuery.addEventListener('change', resolve)
    return () => mediaQuery.removeEventListener('change', resolve)
  }, [])

  // Aplicar la clase al HTML según el tema activo
  useEffect(() => {
    const root = document.documentElement
    const applied = theme === 'system' ? resolvedTheme : theme

    root.classList.remove('light', 'dark')
    root.classList.add(applied)

    localStorage.setItem('theme', theme)
  }, [theme, resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}