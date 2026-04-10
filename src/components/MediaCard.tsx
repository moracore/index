import { Check } from 'lucide-react'
import type { MediaEntry } from '../types.ts'
import { computeProgress, formatPosition, MEDIA_TYPE_META } from '../types.ts'

interface Props {
  entry: MediaEntry
  onIncrement: () => void
  onDecrement: () => void
  onClick: () => void
  style?: React.CSSProperties
}

type SegState = 'completed' | 'active' | 'future'

function segmentState(entry: MediaEntry, idx: number): SegState {
  if (idx < entry.currentSegmentIndex) return 'completed'
  if (idx === entry.currentSegmentIndex) return entry.currentUnitIndex > 0 ? 'active' : 'future'
  return 'future'
}

function segmentFill(entry: MediaEntry, idx: number): number {
  if (idx < entry.currentSegmentIndex) return 100
  if (idx === entry.currentSegmentIndex) {
    const seg = entry.segments[idx]
    return seg.unitCount > 0 ? (entry.currentUnitIndex / seg.unitCount) * 100 : 0
  }
  return 0
}

export default function MediaCard({ entry, onIncrement, onDecrement, onClick, style }: Props) {
  const totalUnits = entry.segments.reduce((s, seg) => s + seg.unitCount, 0)
  const pct = computeProgress(entry)
  const pctDisplay = Math.round(pct * 100)
  const isDone = pct >= 1
  const meta = MEDIA_TYPE_META[entry.type]
  const position = formatPosition(entry)

  const atStart = entry.currentSegmentIndex === 0 && entry.currentUnitIndex === 0

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDone) onIncrement()
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!atStart) onDecrement()
  }

  return (
    <div className="media-card" onClick={onClick} style={style}>
      {/* Header */}
      <div className="media-card-header">
        <div className="media-card-color-dot" style={{ background: entry.accentColor }} />
        <span className="media-card-title">{entry.title}</span>
        <div className="media-card-meta">
          <span className="type-badge">{meta.label}</span>
          {!meta.isAtomic && (
            <span className="position-label">{position}</span>
          )}
        </div>
      </div>

      {/* Progress bars */}
      {entry.segments.length > 0 && totalUnits > 0 && (
        <div className="progress-section">
          {entry.segments.length === 1 ? (
            <div className="master-bar">
              <div className="master-bar-segment" style={{ flex: 1 }}>
                <div
                  className={`master-bar-segment-fill ${segmentState(entry, 0)}`}
                  style={{ width: `${segmentFill(entry, 0)}%`, background: segmentState(entry, 0) !== 'future' ? entry.accentColor : undefined }}
                />
              </div>
            </div>
          ) : (
            <div className="segment-bars">
              {entry.segments.map((seg, i) => {
                const state = segmentState(entry, i)
                const fill = segmentFill(entry, i)
                const segPrefix = entry.segmentLabel ? entry.segmentLabel[0] : 'S'
                return (
                  <div key={seg.id} className="segment-bar-wrap" style={{ flex: seg.unitCount }}>
                    <div className="segment-bar-label">{segPrefix}{i + 1}</div>
                    <div className="segment-bar">
                      <div
                        className={`segment-bar-fill ${state}`}
                        style={{ width: `${fill}%`, background: state !== 'future' ? entry.accentColor : undefined }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="media-card-footer">
        <span className={`progress-pct${isDone ? ' complete' : ''}`}>
          {isDone ? 'Complete' : `${pctDisplay}%`}
        </span>
        <div className="card-actions">
          {!isDone && (
            <button
              className="increment-btn"
              onClick={handleDecrement}
              disabled={atStart}
              aria-label="Decrement progress"
            >
              {`-1 ${entry.unitLabel || 'unit'}`}
            </button>
          )}
          <button
            className={`increment-btn${isDone ? ' done' : ''}`}
            onClick={handleIncrement}
            aria-label={isDone ? 'Complete' : 'Increment progress'}
          >
            {isDone ? (
              <>
                <Check size={14} />
                Done
              </>
            ) : (
              meta.isAtomic ? 'Mark done' : `+1 ${entry.unitLabel || 'unit'}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
