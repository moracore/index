import { Plus, SlidersHorizontal } from 'lucide-react'

interface Props {
  onAdd: () => void
  onSettings: () => void
}

export default function AppHeader({ onAdd, onSettings }: Props) {
  return (
    <header className="app-header">
      <h1 className="app-header-title">
        In<span>dex</span>
      </h1>
      <div className="app-header-actions">
        <button className="header-btn" onClick={onSettings} aria-label="Settings">
          <SlidersHorizontal size={18} />
        </button>
        <button className="header-btn primary" onClick={onAdd} aria-label="Add media">
          <Plus size={18} />
        </button>
      </div>
    </header>
  )
}
