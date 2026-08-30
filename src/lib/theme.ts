import { GymBranding } from '@prisma/client'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  sidebar: string
  button: string
  fontFamily: string
  primaryForeground: string
  secondaryForeground: string
  accentForeground: string
  backgroundForeground: string
  surfaceForeground: string
  textMuted: string
  border: string
  ring: string
}

export function generateThemeColors(branding: GymBranding | null): ThemeColors {
  const primary = branding?.primaryColor || '#111827'
  const secondary = branding?.secondaryColor || '#374151'
  const accent = branding?.accentColor || '#22C55E'
  const background = branding?.backgroundColor || '#0F0F0F'
  const surface = branding?.surfaceColor || '#1A1A1A'
  const text = branding?.textColor || '#FFFFFF'
  const sidebar = branding?.sidebarColor || '#111827'
  const button = branding?.buttonColor || '#22C55E'
  const fontFamily = branding?.fontFamily || 'Inter'

  return {
    primary,
    secondary,
    accent,
    background,
    surface,
    text,
    sidebar,
    button,
    fontFamily,
    primaryForeground: getContrastColor(primary),
    secondaryForeground: getContrastColor(secondary),
    accentForeground: getContrastColor(accent),
    backgroundForeground: getContrastColor(background),
    surfaceForeground: getContrastColor(surface),
    textMuted: adjustColor(text, -40),
    border: adjustColor(surface, 20),
    ring: accent,
  }
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

function adjustColor(hex: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function generateCSSVariables(theme: ThemeColors): string {
  return `
    :root {
      --primary: ${theme.primary};
      --primary-foreground: ${theme.primaryForeground};
      --secondary: ${theme.secondary};
      --secondary-foreground: ${theme.secondaryForeground};
      --accent: ${theme.accent};
      --accent-foreground: ${theme.accentForeground};
      --background: ${theme.background};
      --background-foreground: ${theme.backgroundForeground};
      --surface: ${theme.surface};
      --surface-foreground: ${theme.surfaceForeground};
      --text: ${theme.text};
      --text-muted: ${theme.textMuted};
      --sidebar: ${theme.sidebar};
      --sidebar-foreground: ${theme.text};
      --sidebar-border: ${theme.border};
      --button: ${theme.button};
      --button-foreground: ${getContrastColor(theme.button)};
      --border: ${theme.border};
      --ring: ${theme.ring};
      --font-sans: ${theme.fontFamily}, system-ui, sans-serif;
      --font-heading: ${theme.fontFamily}, system-ui, sans-serif;
      --radius: 0.5rem;
    }

    .dark {
      --primary: ${theme.primary};
      --primary-foreground: ${theme.primaryForeground};
      --secondary: ${theme.secondary};
      --secondary-foreground: ${theme.secondaryForeground};
      --accent: ${theme.accent};
      --accent-foreground: ${theme.accentForeground};
      --background: ${theme.background};
      --background-foreground: ${theme.backgroundForeground};
      --surface: ${theme.surface};
      --surface-foreground: ${theme.surfaceForeground};
      --text: ${theme.text};
      --text-muted: ${theme.textMuted};
      --sidebar: ${theme.sidebar};
      --sidebar-foreground: ${theme.text};
      --sidebar-border: ${theme.border};
      --button: ${theme.button};
      --button-foreground: ${getContrastColor(theme.button)};
      --border: ${theme.border};
      --ring: ${theme.ring};
    }
  `
}

export const DEFAULT_THEME: ThemeColors = {
  primary: '#111827',
  secondary: '#374151',
  accent: '#22C55E',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  sidebar: '#111827',
  button: '#22C55E',
  fontFamily: 'Inter',
  primaryForeground: '#FFFFFF',
  secondaryForeground: '#FFFFFF',
  accentForeground: '#000000',
  backgroundForeground: '#FFFFFF',
  surfaceForeground: '#FFFFFF',
  textMuted: '#9CA3AF',
  border: '#374151',
  ring: '#22C55E',
}

export const PRESET_THEMES: Record<string, Partial<ThemeColors>> = {
  'iron-house': {
    primary: '#111827',
    secondary: '#1F2937',
    accent: '#EF4444',
    background: '#030712',
    surface: '#111827',
    sidebar: '#030712',
    button: '#EF4444',
  },
  'purple-gold': {
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#F59E0B',
    background: '#1E1B4B',
    surface: '#312E81',
    sidebar: '#1E1B4B',
    button: '#F59E0B',
  },
  'navy-green': {
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#22C55E',
    background: '#020617',
    surface: '#0F172A',
    sidebar: '#020617',
    button: '#22C55E',
  },
  'dark-blue': {
    primary: '#1E3A8A',
    secondary: '#1E40AF',
    accent: '#06B6D4',
    background: '#0F172A',
    surface: '#1E293B',
    sidebar: '#0F172A',
    button: '#06B6D4',
  },
  'orange-dark': {
    primary: '#9A3412',
    secondary: '#C2410C',
    accent: '#FB923C',
    background: '#1C1917',
    surface: '#292524',
    sidebar: '#1C1917',
    button: '#FB923C',
  },
  'teal-dark': {
    primary: '#134E4A',
    secondary: '#0F766E',
    accent: '#14B8A6',
    background: '#042F2E',
    surface: '#134E4A',
    sidebar: '#042F2E',
    button: '#14B8A6',
  },
  'pink-dark': {
    primary: '#9D174D',
    secondary: '#BE185D',
    accent: '#F472B6',
    background: '#1C1917',
    surface: '#292524',
    sidebar: '#1C1917',
    button: '#F472B6',
  },
  'minimal-white': {
    primary: '#111827',
    secondary: '#374151',
    accent: '#3B82F6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    sidebar: '#FFFFFF',
    button: '#3B82F6',
    primaryForeground: '#FFFFFF',
    secondaryForeground: '#FFFFFF',
    accentForeground: '#FFFFFF',
    backgroundForeground: '#111827',
    surfaceForeground: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    ring: '#3B82F6',
  },
}