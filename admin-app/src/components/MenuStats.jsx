import { CATEGORIES, formatCategory } from '../lib/categories'

export default function MenuStats({ items }) {
  const total = items.length
  const active = items.filter((i) => i.active).length
  const inactive = total - active
  const byCategory = CATEGORIES.map((category) => ({
    category,
    count: items.filter((i) => i.category === category).length,
  }))

  return (
    <div className="stats-strip">
      <div className="stat-card">
        <p className="stat-value">{total}</p>
        <p className="stat-label">Total Item</p>
      </div>
      <div className="stat-card">
        <p className="stat-value">{active}</p>
        <p className="stat-label">Aktif</p>
      </div>
      <div className="stat-card">
        <p className="stat-value">{inactive}</p>
        <p className="stat-label">Nonaktif</p>
      </div>
      <div className="stat-card stat-card-categories">
        <p className="stat-label">Per Kategori</p>
        <div className="stat-category-chips">
          {byCategory.map(({ category, count }) => (
            <span key={category} className="category-chip">
              {formatCategory(category)} <b>{count}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
