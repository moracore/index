import { X, Pipette } from 'lucide-react'
import type { AppSettings } from '../types.ts'

const ACCENT_PRESETS = [
  '#7c5cf6', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
]

interface Props {
  settings: AppSettings
  onUpdate: (patch: Partial<AppSettings>) => void
  onClose: () => void
}

export default function SettingsPanel({ settings, onUpdate, onClose }: Props) {
  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <aside className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="settings-body">
          {/* Appearance */}
          <section>
            <p className="settings-section-title">Appearance</p>
            <div className="settings-row">
              <span className="settings-row-label">Theme</span>
              <button
                className={`toggle${settings.theme === 'dark' ? '' : ' on'}`}
                onClick={() => onUpdate({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                aria-label="Toggle theme"
              >
                <div className="toggle-thumb" />
              </button>
            </div>
            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-sm)' }}>
              <span className="settings-row-label">Accent color</span>
              <div className="color-swatches">
                {ACCENT_PRESETS.map(c => (
                  <button
                    key={c}
                    className={`color-swatch${settings.accentColor === c ? ' active' : ''}`}
                    style={{ background: c }}
                    onClick={() => onUpdate({ accentColor: c })}
                    aria-label={c}
                  />
                ))}
                <div className="color-custom-wrap">
                  <input
                    type="color"
                    className="color-custom-input"
                    value={settings.accentColor}
                    onChange={e => onUpdate({ accentColor: e.target.value })}
                    title="Custom color"
                  />
                  <Pipette size={10} className="color-custom-icon" />
                </div>
              </div>
            </div>
          </section>

          {/* Sort order */}
          <section>
            <p className="settings-section-title">Library sort</p>
            <div className="sort-options" style={{ flexWrap: 'wrap' }}>
              {([
                { val: 'added',    label: 'Date added' },
                { val: 'alpha',    label: 'A–Z'        },
                { val: 'progress', label: 'Progress'   },
              ] as const).map(({ val, label }) => (
                <button
                  key={val}
                  className={`sort-option${settings.sortOrder === val ? ' active' : ''}`}
                  onClick={() => onUpdate({ sortOrder: val })}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* About */}
          <section>
            <p className="settings-section-title">About</p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>
              Index — sequential media tracker.<br />
              All data stored locally on this device.
            </p>
          </section>
        </div>
      </aside>
    </>
  )
}
