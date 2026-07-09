import { useState } from 'react'

const CATEGORIES = ['coffee-basic', 'coffee-signature', 'milkshake', 'tea', 'food']

export default function MenuList({ items, loading, selectedId, onSelect, onAddNew, onToggleActive }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || item.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="panel">
      <div className="menu-list-filters">
        <input placeholder="Cari item..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Semua kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading && <p className="status-message">Loading...</p>}

      {filtered.map((item) => (
        <div
          key={item.id}
          className={`menu-list-item ${item.id === selectedId ? 'selected' : ''} ${!item.active ? 'inactive' : ''}`}
        >
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