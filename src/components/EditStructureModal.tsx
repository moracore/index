import { useState } from 'react'
import { X, Plus, Trash2, ChevronLeft, ChevronRight, Pipette } from 'lucide-react'
import type { MediaEntry, Segment } from '../types.ts'
import { MEDIA_TYPE_META, computeProgress } from '../types.ts'
import ConfirmModal from './ConfirmModal.tsx'

const ACCENT_PRESETS = [
  '#7c5cf6', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
]

interface Props {
  entry: MediaEntry
  onUpdate: (e: MediaEntry) => void
  onDelete: (id: string) => void
  onSetPointer: (id: string, segIdx: number, unitIdx: number) => void
  onClose: () => void
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function makeSegment(name: string, unitCount: number): Segment {
  return { id: makeId(), name, unitCount }
}

export default function EditStructureModal({ entry, onUpdate, onDelete, onSetPointer, onClose }: Props) {
  const [title, setTitle] = useState(entry.title)
  const [segments, setSegments] = useState<Segment[]>(entry.segments)
  const [ongoing, setOngoing] = useState(entry.ongoing)
  const [accent, setAccent] = useState(entry.accentColor)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPointerBack, setShowPointerBack] = useState<{ segIdx: number; unitIdx: number } | null>(null)

  const meta = MEDIA_TYPE_META[entry.type]
  const progress = computeProgress(entry)
  const isDone = progress >= 1

  function addSegment() {
    const n = segments.length + 1
    setSegments(prev => [...prev, makeSegment(`${entry.segmentLabel} ${n}`, 12)])
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

  function handleSave() {
    onUpdate({ ...entry, title: title.trim() || entry.title, segments, ongoing, accentColor: accent })
    onClose()
  }

  function handleDelete() {
    onDelete(entry.id)
    onClose()
  }

  // Pointer navigation: advance/rewind by one unit
  function requestPointerMove(segIdx: number, unitIdx: number) {
    const curFlat = entry.segments.slice(0, entry.currentSegmentIndex).reduce((s, sg) => s + sg.unitCount, 0) + entry.currentUnitIndex
    const newFlat = entry.segments.slice(0, segIdx).reduce((s, sg) => s + sg.unitCount, 0) + unitIdx
    if (newFlat < curFlat) {
      setShowPointerBack({ segIdx, unitIdx })
    } else {
      onSetPointer(entry.id, segIdx, unitIdx)
    }
  }

  const segPrefix = entry.segmentLabel ? entry.segmentLabel[0] : 'S'
  const unitPrefix = entry.unitLabel ? entry.unitLabel[0] : 'E'

  // Generate pointer increment/decrement buttons
  function prevUnit() {
    let si = entry.currentSegmentIndex
    let ui = entry.currentUnitIndex
    if (ui > 0) {
      ui--
    } else if (si > 0) {
      si--
      ui = entry.segments[si].unitCount
    }
    requestPointerMove(si, ui)
  }

  function nextUnit() {
    let si = entry.currentSegmentIndex
    let ui = entry.currentUnitIndex
    const seg = entry.segments[si]
    if (ui < (seg?.unitCount ?? 0)) {
      ui++
    } else if (si < entry.segments.length - 1) {
      si++
      ui = 1
    }
    onSetPointer(entry.id, si, ui)
  }

  const atStart = entry.currentSegmentIndex === 0 && entry.currentUnitIndex === 0

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          <div className="modal-drag-handle" />
          <div className="modal-header">
            <span className="modal-title">Edit</span>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Manual pointer adjustment */}
            {!meta.isAtomic && (
              <div className="form-group">
                <label className="form-label">Current position</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', padding: '10px var(--sp-md)', background: 'var(--clr-surface-raised)', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 'none', padding: '6px 10px' }}
                    onClick={prevUnit}
                    disabled={atStart}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 'var(--fs-sm)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {isDone
                      ? 'Complete'
                      : `${segPrefix}${entry.currentSegmentIndex + 1} · ${unitPrefix}${entry.currentUnitIndex} / ${entry.segments[entry.currentSegmentIndex]?.unitCount ?? 0}`}
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 'none', padding: '6px 10px' }}
                    onClick={nextUnit}
                    disabled={isDone}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Segments */}
            {!meta.isAtomic && (
              <div className="form-group">
                <label className="form-label">
                  {entry.segmentLabel ? `${entry.segmentLabel}s` : 'Segments'}
                </label>
                <div className="segments-list">
                  {segments.map((seg, i) => (
                    <div key={seg.id} className="segment-row" style={{ animationDelay: `${i * 20}ms` }}>
                      <input
                        className="form-input"
                        style={{ flex: 1, padding: '6px 10px', fontSize: 'var(--fs-sm)' }}
                        value={seg.name}
                        onChange={e => updateSegmentName(seg.id, e.target.value)}
                        placeholder={`${entry.segmentLabel} ${i + 1}`}
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
                    Add {entry.segmentLabel || 'segment'}
                  </button>
                </div>
              </div>
            )}

            {/* Ongoing */}
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

            {/* Delete */}
            <div className="divider" />
            <button
              className="btn btn-danger"
              style={{ width: '100%' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={15} />
              Delete entry
            </button>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete entry?"
          message={`"${entry.title}" and all its progress will be permanently removed.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showPointerBack && (
        <ConfirmModal
          title="Move back?"
          message="Moving to an earlier position will revert completed progress. This cannot be undone."
          confirmLabel="Move back"
          danger
          onConfirm={() => {
            onSetPointer(entry.id, showPointerBack.segIdx, showPointerBack.unitIdx)
            setShowPointerBack(null)
          }}
          onCancel={() => setShowPointerBack(null)}
        />
      )}
    </>
  )
}
