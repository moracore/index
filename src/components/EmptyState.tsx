import { BookOpen, Plus } from 'lucide-react'

interface Props {
  onAdd: () => void
}

export default function EmptyState({ onAdd }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <BookOpen />
      </div>
      <div>
        <p className="empty-state-title">Nothing tracked yet</p>
        <p className="empty-state-sub">Add a show, manga, or book series to start tracking your progress.</p>
      </div>
      <button className="btn btn-primary" style={{ maxWidth: 200 }} onClick={onAdd}>
        <Plus size={16} />
        Add entry
      </button>
    </div>
  )
}
