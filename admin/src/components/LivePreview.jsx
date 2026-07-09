export default function LivePreview({ item }) {
  return (
    <div className="panel">
      <p className="live-preview-label">Live Preview</p>
      <div className="preview-card">
        <div
          className="preview-card-image"
          style={item.image_url ? { backgroundImage: `url(${item.image_url})` } : {}}
        />
        <div className="preview-card-body">
          <p className="preview-card-name">{item.name || 'Nama item'}</p>
          <p className="preview-card-desc">{item.description}</p>
          <p className="preview-card-price">Rp {Number(item.price || 0).toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  )
}