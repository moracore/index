export type MediaType = 'tv' | 'anime' | 'manga' | 'book_series' | 'movie' | 'standalone' | 'custom'

export interface Segment {
  id: string
  name: string
  unitCount: number
}

export interface MediaEntry {
  id: string
  title: string
  type: MediaType
  segmentLabel: string  // "Season", "Volume", "Book", ""
  unitLabel: string     // "Episode", "Chapter", ""
  segments: Segment[]
  /** 0-based index of the current segment */
  currentSegmentIndex: number
  /** How many units completed in the current segment (0 = none started) */
  currentUnitIndex: number
  ongoing: boolean
  accentColor: string
  createdAt: number
}

export interface AppSettings {
  theme: 'dark' | 'light'
  accentColor: string
  sortOrder: 'added' | 'alpha' | 'progress'
}

export const MEDIA_TYPE_META: Record<MediaType, { label: string; segmentLabel: string; unitLabel: string; isAtomic: boolean }> = {
  tv:          { label: 'TV Show',      segmentLabel: 'Season',  unitLabel: 'Episode', isAtomic: false },
  anime:       { label: 'Anime',        segmentLabel: 'Season',  unitLabel: 'Episode', isAtomic: false },
  manga:       { label: 'Manga',        segmentLabel: 'Volume',  unitLabel: 'Chapter', isAtomic: false },
  book_series: { label: 'Book Series',  segmentLabel: 'Book',    unitLabel: 'Chapter', isAtomic: false },
  movie:       { label: 'Movie',        segmentLabel: '',        unitLabel: '',        isAtomic: true  },
  standalone:  { label: 'Standalone',   segmentLabel: '',        unitLabel: '',        isAtomic: true  },
  custom:      { label: 'Custom',       segmentLabel: 'Part',    unitLabel: 'Unit',    isAtomic: false },
}

export function computeProgress(entry: MediaEntry): number {
  const totalUnits = entry.segments.reduce((s, seg) => s + seg.unitCount, 0)
  if (totalUnits === 0) return 0
  const completedBefore = entry.segments
    .slice(0, entry.currentSegmentIndex)
    .reduce((s, seg) => s + seg.unitCount, 0)
  return (completedBefore + entry.currentUnitIndex) / totalUnits
}

export function formatPosition(entry: MediaEntry): string {
  if (entry.segments.length === 0) return '—'
  const meta = MEDIA_TYPE_META[entry.type]
  if (meta.isAtomic) {
    const p = computeProgress(entry)
    return p >= 1 ? 'Complete' : p === 0 ? 'Not started' : `${Math.round(p * 100)}%`
  }
  const seg = entry.segments[entry.currentSegmentIndex]
  if (!seg) return '—'
  const segPrefix = entry.segmentLabel ? entry.segmentLabel[0] : 'S'
  const unitPrefix = entry.unitLabel ? entry.unitLabel[0] : 'E'
  const segNum = entry.currentSegmentIndex + 1
  const unitNum = entry.currentUnitIndex
  const total = seg.unitCount
  return `${segPrefix}${segNum} · ${unitPrefix}${unitNum}/${total}`
}
