import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['coffee-basic', 'coffee-signature', 'milkshake', 'tea', 'food']

export default function MenuItemForm({ item, onChange, onSave, onDelete }) {
  const [uploading, setUploading] = useState(false)

  const update = (field, value) => onChange({ ...item, [field]: value })

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('menu-images').upload(fileName, file)
    if (error) {
      alert('Gagal upload: ' + error.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName)
    update('image_url', data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="panel form-group">
      <label>Nama
        <input value={item.name} onChange={(e) => update('name', e.target.value)} />
      </label>

      <div className="form-row">
        <label style={{ flex: 1 }}>Harga
          <input type="number" value={item.price} onChange={(e) => update('price', Number(e.target.value))} />
        </label>
        <label style={{ flex: 1 }}>Kategori
          <select value={item.category} onChange={(e) => update('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <label>Deskripsi
        <textarea value={item.description} onChange={(e) => update('description', e.target.value)} rows={3} />
      </label>

      <label>Gambar
        <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
      </label>
      {uploading && <p className="status-message">Mengupload...</p>}
      {item.image_url && (
        <img src={item.image_url} alt="preview" className="image-preview"
          onError={(e) => { e.target.style.display = 'none' }} />
      )}
      <label>Atau URL gambar manual
        <input value={item.image_url} onChange={(e) => update('image_url', e.target.value)} />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
        <input type="checkbox" checked={item.active} onChange={(e) => update('active', e.target.checked)} style={{ width: 'auto' }} />
        Aktif
      </label>

      <div className="form-actions">
        <button onClick={() => onSave(item)}>Simpan</button>
        {item.id && <button onClick={() => onDelete(item.id)} className="btn-danger">Hapus</button>}
      </div>
    </div>
  )
}