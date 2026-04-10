import { useState, useEffect, useCallback } from 'react'
import type { MediaEntry, AppSettings } from '../types.ts'
import { computeProgress } from '../types.ts'

const KEYS = {
  entries: 'index-entries',
  settings: 'index-settings',
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#7c5cf6',
  sortOrder: 'added',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function applyTheme(settings: AppSettings) {
  document.documentElement.setAttribute('data-theme', settings.theme)
  document.documentElement.style.setProperty('--clr-base', settings.accentColor)
  // Derive light/dark/dim variants from the accent hsl
  const hex = settings.accentColor
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const l = (max + min) / 2
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1))
  const h = max === min ? 0
    : max === r / 255 ? (60 * (((g - b) / 255) / (max - min)) + 360) % 360
    : max === g / 255 ? 60 * (((b - r) / 255) / (max - min)) + 120
    : 60 * (((r - g) / 255) / (max - min)) + 240
  document.documentElement.style.setProperty('--clr-base-light', `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(Math.min(l * 100 + 12, 85))}%)`)
  document.documentElement.style.setProperty('--clr-base-dark',  `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(Math.max(l * 100 - 12, 15))}%)`)
  document.documentElement.style.setProperty('--clr-base-dim',   `hsl(${h}, ${Math.round(s * 80)}%, ${Math.round(l * 100)}%, 0.18)`)
}

export function useMedia() {
  const [entries, setEntries] = useState<MediaEntry[]>(() => load(KEYS.entries, []))
  const [settings, setSettings] = useState<AppSettings>(() => load(KEYS.settings, DEFAULT_SETTINGS))

  useEffect(() => { save(KEYS.entries, entries) }, [entries])
  useEffect(() => {
    save(KEYS.settings, settings)
    applyTheme(settings)
  }, [settings])

  // Apply theme on mount
  useEffect(() => { applyTheme(settings) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addEntry = useCallback((entry: MediaEntry) => {
    setEntries(prev => [entry, ...prev])
  }, [])

  const updateEntry = useCallback((updated: MediaEntry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  /** Advance the pointer by one unit. Returns false if already at the end. */
  const increment = useCallback((id: string): boolean => {
    let advanced = false
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      const seg = e.segments[e.currentSegmentIndex]
      if (!seg) return e
      const next = { ...e }
      if (e.currentUnitIndex < seg.unitCount) {
        next.currentUnitIndex = e.currentUnitIndex + 1
        advanced = true
      } else if (e.currentSegmentIndex < e.segments.length - 1) {
        next.currentSegmentIndex = e.currentSegmentIndex + 1
        next.currentUnitIndex = 1
        advanced = true
      }
      return next
    }))
    return advanced
  }, [])

  /** Move pointer back by one unit. Does nothing if already at the start. */
  const decrement = useCallback((id: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      if (e.currentUnitIndex > 1) {
        return { ...e, currentUnitIndex: e.currentUnitIndex - 1 }
      } else if (e.currentUnitIndex === 1) {
        return { ...e, currentUnitIndex: 0 }
      } else if (e.currentSegmentIndex > 0) {
        const prevSeg = e.segments[e.currentSegmentIndex - 1]
        return { ...e, currentSegmentIndex: e.currentSegmentIndex - 1, currentUnitIndex: prevSeg.unitCount }
      }
      return e
    }))
  }, [])

  /** Move pointer to a specific (segmentIndex, unitIndex). Returns true if backward (destructive). */
  const setPointer = useCallback((id: string, segmentIndex: number, unitIndex: number) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      return { ...e, currentSegmentIndex: segmentIndex, currentUnitIndex: unitIndex }
    }))
  }, [])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  const sortedEntries = [...entries].sort((a, b) => {
    if (settings.sortOrder === 'alpha') return a.title.localeCompare(b.title)
    if (settings.sortOrder === 'progress') return computeProgress(b) - computeProgress(a)
    return b.createdAt - a.createdAt // 'added'
  })

  return {
    entries: sortedEntries,
    settings,
    addEntry,
    updateEntry,
    deleteEntry,
    increment,
    decrement,
    setPointer,
    updateSettings,
  }
}
