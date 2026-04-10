import { useState } from 'react'
import { X, Plus, Trash2, Pipette } from 'lucide-react'
import type { MediaEntry, MediaType, Segment } from '../types.ts'
import { MEDIA_TYPE_META } from '../types.ts'

const ACCENT_PRESETS = [
  '#7c5cf6', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
]

interface Props {
  defaultAccent: string
  onAdd: (entry: MediaEntry) => void
  onClose: () => void
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function makeSegment(name: string, unitCount: number): Segment {
  return { id: makeId(), name, unitCount }
}

export default function AddMediaModal({ defaultAccent, onAdd, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<MediaType>('tv')
  const [segmentLabel, setSegmentLabel] = useState(MEDIA_TYPE_META.tv.segmentLabel)
  const [unitLabel, setUnitLabel] = useState(MEDIA_TYPE_META.tv.unitLabel)
  const [segments, setSegments] = useState<Segment[]>([makeSegment('Season 1', 12)])
  const [ongoing, setOngoing] = useState(false)
  const [accent, setAccent] = useState(defaultAccent)

  const meta = MEDIA_TYPE_META[type]

  function handleTypeChange(t: MediaType) {
    const m = MEDIA_TYPE_META[t]
    setType(t)
    setSegmentLabel(m.segmentLabel)
    setUnitLabel(m.unitLabel)
    if (m.isAtomic) {
      setSegments([makeSegment('', 1)])
    } else if (segments.length === 0) {
      setSegments([makeSegment(`${m.segmentLabel} 1`, 12)])
    }
  }

  function addSegment() {
    const n = segments.length + 1
    setSegments(prev => [...prev, makeSegment(`${segmentLabel} ${n}`, 12)])
  }

  function removeSegment(id: string) {
    setSegments(prev => prev.filter(s => s.id !== id))
  }

  function updateSegmentCount(id: string, count: number) {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, unitCount: Math.max(1, count) } : s))
  }

  function updateSegmentName(id: string, name: string) {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, name } : s))
  }

  function handleSubmit() {
    if (!title.trim() || segments.length === 0) return
    const entry: MediaEntry = {
      id: makeId(),
      title: title.trim(),
      type,
      segmentLabel,
      unitLabel,
      segments,
      currentSegmentIndex: 0,
      currentUnitIndex: 0,
      ongoing,
      accentColor: accent,
      createdAt: Date.now(),
    }
    onAdd(entry)
    onClose()
  }

  return (
    <div className="modal-fullscreen">
      <div className="modal-fullscreen-header">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <span className="modal-title">Add Entry</span>
        <button
          className="modal-fullscreen-save"
          onClick={handleSubmit}
          disabled={!title.trim()}
        >
          Add
        </button>
      </div>

        <div className="modal-fullscreen-body">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              placeholder="e.g. Attack on Titan"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-selector">
              {(Object.keys(MEDIA_TYPE_META) as MediaType[]).map(t => (
                <button
                  key={t}
                  className={`type-option${type === t ? ' selected' : ''}`}
                  onClick={() => handleTypeChange(t)}
                >
                  {MEDIA_TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom labels (custom type only) */}
          {type === 'custom' && (
            <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Segment label</label>
                <input className="form-input" value={segmentLabel} onChange={e => setSegmentLabel(e.target.value)} placeholder="Season" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Unit label</label>
                <input className="form-input" value={unitLabel} onChange={e => setUnitLabel(e.target.value)} placeholder="Episode" />
              </div>
            </div>
          )}

          {/* Segments */}
          {!meta.isAtomic && (
            <div className="form-group">
              <label className="form-label">
                {segmentLabel ? `${segmentLabel}s` : 'Segments'}
              </label>
              <div className="segments-list">
                {segments.map((seg, i) => (
                  <div key={seg.id} className="segment-row" style={{ animationDelay: `${i * 30}ms` }}>
                    <input
                      className="form-input"
                      style={{ flex: 1, padding: '6px 10px', fontSize: 'var(--fs-sm)' }}
                      value={seg.name}
                      onChange={e => updateSegmentName(seg.id, e.target.value)}
                      placeholder={`${segmentLabel} ${i + 1}`}
                    />
                    <input
                      className="form-input small segment-row-count"
                      type="number"
                      min={1}
                      value={seg.unitCount}
                      onChange={e => updateSegmentCount(seg.id, parseInt(e.target.value) || 1)}
                    />
                    <button
                      className="segment-row-del"
                      onClick={() => removeSegment(seg.id)}
                      disabled={segments.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button className="add-segment-btn" onClick={addSegment}>
                  <Plus size={14} />
                  Add {segmentLabel || 'segment'}
                </button>
              </div>
            </div>
          )}

          {/* Ongoing toggle */}
          {!meta.isAtomic && (
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Ongoing</p>
                <p className="toggle-sub">New segments can be appended later</p>
              </div>
              <button className={`toggle${ongoing ? ' on' : ''}`} onClick={() => setOngoing(o => !o)}>
                <div className="toggle-thumb" />
              </button>
            </div>
          )}

          {/* Accent color */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-swatches">
              {ACCENT_PRESETS.map(c => (
                <button
                  key={c}
                  className={`color-swatch${accent === c ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setAccent(c)}
                  aria-label={c}
                />
              ))}
              <div className="color-custom-wrap">
                <input
                  type="color"
                  className="color-custom-input"
                  value={accent}
                  onChange={e => setAccent(e.target.value)}
                  title="Custom color"
                />
                <Pipette size={10} className="color-custom-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
