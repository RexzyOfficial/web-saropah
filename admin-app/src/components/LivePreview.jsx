import { formatCategory } from '../lib/categories'

export default function LivePreview({ item }) {
  const hasImage = Boolean(item.image_url)
  const hasName = Boolean(item.name)

  return (
    <div className="panel">
      <p className="live-preview-label">Live Preview</p>

      <div className="preview-card">
        <div className="preview-card-image-wrap">
          {hasImage ? (
            <div
              className="preview-card-image"
              style={{ backgroundImage: `url(${item.image_url})` }}
            />
          ) : (
            <div className="preview-card-image preview-card-image--empty">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="8.5" cy="10" r="1.6" />
                <path d="M21 15.5 16 11l-8.5 8" />
              </svg>
              <span>Belum ada gambar</span>
            </div>
          )}

          {item.category && (
            <span className="preview-card-badge">{formatCategory(item.category)}</span>
          )}

          <span className={`preview-card-status ${item.active === false ? 'is-inactive' : 'is-active'}`}>
            <i />
            {item.active === false ? 'Nonaktif' : 'Aktif'}
          </span>
        </div>

        <div className="preview-card-body">
          <p className={`preview-card-name ${!hasName ? 'is-placeholder' : ''}`}>
            {item.name || 'Nama item'}
          </p>
          {item.description && (
            <p className="preview-card-desc">{item.description}</p>
          )}
          <p className="preview-card-price">
            Rp {Number(item.price || 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  )
}
