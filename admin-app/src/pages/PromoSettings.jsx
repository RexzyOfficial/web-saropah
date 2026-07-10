import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FREQ_OPTIONS = [
  { value: 'always', label: 'Setiap buka halaman' },
  { value: 'session', label: 'Sekali per sesi' },
  { value: 'once', label: 'Sekali per hari' },
]

export default function PromoSettings() {
  const [config, setConfig] = useState({ url: '', link: '', delay: 3000, freq: 'session', active: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchConfig = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('promo_config').select('*').eq('id', 1).single()
    if (!error && data) setConfig(data)
    setLoading(false)
  }

  useEffect(() => { fetchConfig() }, [])

  const update = (field, value) => setConfig({ ...config, [field]: value })

  const handleSave = async () => {
    if (!config.url) { setMessage('⚠️ Link gambar belum diisi'); return }
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('promo_config')
      .update({
        url: config.url,
        link: config.link,
        delay: config.delay,
        freq: config.freq,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
    setSaving(false)
    setMessage(error ? '⚠️ ' + error.message : '✅ Promo berhasil disimpan')
    if (!error) fetchConfig()
  }

  const handleToggleActive = async () => {
    const newActive = !config.active
    setConfig({ ...config, active: newActive })
    const { error } = await supabase.from('promo_config').update({ active: newActive }).eq('id', 1)
    if (error) setMessage('⚠️ ' + error.message)
  }

  const handleResetStats = async () => {
    if (!window.confirm('Reset statistik views & klik ke 0?')) return
    const { error } = await supabase
      .from('promo_config')
      .update({ view_count: 0, click_count: 0 })
      .eq('id', 1)
    if (error) setMessage('⚠️ ' + error.message)
    else fetchConfig()
  }

  if (loading) return <p className="status-message">Loading...</p>

  const views = config.view_count || 0
  const clicks = config.click_count || 0
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0'

  return (
    <div>
      <h1 className="page-title">Promo Settings</h1>

      <div className="stats-strip" style={{ gridTemplateColumns: 'repeat(3, minmax(110px, 150px))', maxWidth: 460 }}>
        <div className="stat-card">
          <p className="stat-value">{views}</p>
          <p className="stat-label">Dilihat</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{clicks}</p>
          <p className="stat-label">Diklik</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{ctr}%</p>
          <p className="stat-label">CTR</p>
        </div>
      </div>
      <button className="btn-ghost" onClick={handleResetStats} style={{ marginBottom: 20 }}>
        Reset Statistik
      </button>

      <div className="panel form-group" style={{ maxWidth: 400 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
          <input type="checkbox" checked={config.active || false} onChange={handleToggleActive} style={{ width: 'auto' }} />
          Promo aktif
        </label>

        <label>URL gambar
          <input value={config.url || ''} onChange={(e) => update('url', e.target.value)} />
        </label>

        {config.url && (
          <img src={config.url} alt="Preview promo" className="image-preview"
            onError={(e) => { e.target.style.display = 'none' }} />
        )}

        <label>Link tujuan (saat gambar diklik)
          <input value={config.link || ''} onChange={(e) => update('link', e.target.value)} />
        </label>

        <label>Delay muncul (ms)
          <input type="number" value={config.delay || 0} onChange={(e) => update('delay', Number(e.target.value))} />
        </label>

        <label>Frekuensi tampil
          <select value={config.freq || 'session'} onChange={(e) => update('freq', e.target.value)}>
            {FREQ_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </label>

        <button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  )
}