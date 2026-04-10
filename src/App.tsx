import { useState } from 'react'
import './App.css'
import { useMedia } from './hooks/useMedia.ts'
import AppHeader from './components/AppHeader.tsx'
import MediaCard from './components/MediaCard.tsx'
import SettingsPanel from './components/SettingsPanel.tsx'
import AddMediaModal from './components/AddMediaModal.tsx'
import EditStructureModal from './components/EditStructureModal.tsx'
import EmptyState from './components/EmptyState.tsx'
import type { MediaEntry } from './types.ts'

export default function App() {
  const { entries, settings, addEntry, updateEntry, deleteEntry, increment, decrement, setPointer, updateSettings } = useMedia()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<MediaEntry | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="app">
      <AppHeader onAdd={() => setShowAdd(true)} onSettings={() => setShowSettings(true)} />

      <main className="content">
        <div className="content-inner">
          {entries.length === 0 ? (
            <EmptyState onAdd={() => setShowAdd(true)} />
          ) : (
            entries.map((entry, i) => (
              <MediaCard
                key={entry.id}
                entry={entry}
                onIncrement={() => increment(entry.id)}
                onDecrement={() => decrement(entry.id)}
                onClick={() => setEditTarget(entry)}
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))
          )}
        </div>
      </main>

      {showSettings && (
        <SettingsPanel settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />
      )}

      {showAdd && (
        <AddMediaModal
          defaultAccent={settings.accentColor}
          onAdd={addEntry}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editTarget && (
        <EditStructureModal
          entry={editTarget}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
          onSetPointer={setPointer}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
