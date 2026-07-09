import { useState } from 'react'

const CATEGORIES = ['coffee-basic', 'coffee-signature', 'milkshake', 'tea', 'food']

export default function MenuList({ items, loading, selectedId, onSelect, onAddNew, onToggleActive, onReorder }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const canReorder = category !== 'all' && search === ''

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || item.category === category
    return matchSearch && matchCategory
  })

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const reordered = [...filtered]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    onReorder(reordered)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="panel">
      <div className="menu-list-filters">
        <input placeholder="Cari item..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Semua kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {canReorder && filtered.length > 1 && (
        <p className="drag-hint">Geser untuk mengubah urutan tampil</p>
      )}
      {loading && <p className="status-message">Loading...</p>}

      {filtered.map((item, index) => (
        <div
          key={item.id}
          draggable={canReorder}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
          onDrop={() => handleDrop(index)}
          onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
          className={`menu-list-item ${item.id === selectedId ? 'selected' : ''} ${!item.active ? 'inactive' : ''} ${dragIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
        >
          {canReorder && (
            <span className="drag-handle"><i className="ti ti-grip-vertical" style={{ fontSize: 14 }}></i></span>
          )}
          <div className="menu-list-item-info" onClick={() => onSelect(item)}>
            <p className="menu-list-item-name">{item.name}</p>
            <p className="menu-list-item-price">Rp {item.price?.toLocaleString('id-ID')}</p>
          </div>
          <input type="checkbox" checked={item.active} onChange={() => onToggleActive(item)} title="Aktif/nonaktif" />
        </div>
      ))}

      <button onClick={onAddNew} className="btn-ghost" style={{ marginTop: 16, width: '100%' }}>+ Tambah item</button>
    </div>
  )
}