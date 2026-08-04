import { ColorScheme, Theme } from './types'

/** Prefix for every CSS custom property the component emits. */
export const VAR_PREFIX = '--react-timesheet'

/** The two palettes shipped with `timesheet.js`. */
export const COLOR_SCHEMES: Record<ColorScheme, Record<string, string>> = {
  default: {
    default: 'rgba(252, 70, 74, 1)',
    lorem: 'rgba(154, 202, 39, 1)',
    ipsum: 'rgba(60, 182, 227, 1)',
    dolor: 'rgba(244, 207, 48, 1)',
    sit: 'rgba(169, 105, 202, 1)',
  },
  alternative: {
    default: 'rgba(243, 85, 46, 1)',
    lorem: 'rgba(136, 195, 58, 1)',
    ipsum: 'rgba(67, 106, 224, 1)',
    dolor: 'rgba(244, 210, 52, 1)',
    sit: 'rgba(112, 125, 134, 1)',
  },
}

export const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    background: 'rgba(51, 51, 51, 1)',
    border: 'rgba(250, 250, 250, 0.5)',
    scale: 'rgba(250, 250, 250, 0.8)',
    'scale-line': 'rgba(250, 250, 250, 0.2)',
    date: 'rgba(181, 181, 181, 1)',
    label: 'rgba(151, 151, 150, 1)',
  },
  light: {
    background: 'rgba(251, 251, 251, 1)',
    border: 'rgba(60, 60, 60, 0.3)',
    scale: 'rgba(50, 50, 50, 0.8)',
    'scale-line': 'rgba(50, 50, 50, 0.1)',
    date: 'rgba(121, 121, 121, 1)',
    label: 'rgba(51, 51, 50, 1)',
  },
}

/**
 * Make a category name safe to embed in a class name or custom property.
 * Types come from user data, so they may contain spaces or punctuation.
 */
export function slugify(type: string): string {
  return (
    String(type)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'default'
  )
}

export function colorVar(type: string): string {
  return `${VAR_PREFIX}-color-${slugify(type)}`
}

export function themeVar(name: string): string {
  return `${VAR_PREFIX}-${name}`
}

/**
 * Build the custom properties for the timesheet root: theme colors, the chosen
 * palette, and one entry per category appearing in the data so unknown
 * categories still resolve to something.
 */
export function getCssVariables({
  theme,
  colorScheme,
  colors,
  types,
}: {
  theme: Theme
  colorScheme: ColorScheme
  colors?: Record<string, string>
  types: string[]
}): Record<string, string> {
  const variables: Record<string, string> = {}

  for (const [name, value] of Object.entries(THEMES[theme])) {
    variables[themeVar(name)] = value
  }

  for (const [type, value] of Object.entries(COLOR_SCHEMES[colorScheme])) {
    variables[colorVar(type)] = value
  }

  for (const [type, value] of Object.entries(colors ?? {})) {
    variables[colorVar(type)] = value
  }

  const fallback = variables[colorVar('default')]

  for (const type of types) {
    const name = colorVar(type)

    if (!variables[name]) {
      variables[name] = fallback
    }
  }

  return variables
}
