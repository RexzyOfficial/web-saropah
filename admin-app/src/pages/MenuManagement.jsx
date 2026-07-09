import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import MenuList from '../components/MenuList'
import MenuItemForm from '../components/MenuItemForm'
import LivePreview from '../components/LivePreview'
import Toast from '../components/Toast'

const emptyItem = { name: '', price: '', description: '', image_url: '', category: 'coffee-basic', active: true }

export default function MenuManagement() {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(emptyItem)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('menu_items').select('*').order('category').order('sort_order')
    if (!error) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleSave = async (item) => {
    let error
    if (item.id) {
      ({ error } = await supabase.from('menu_items').update(item).eq('id', item.id))
    } else {
      ({ error } = await supabase.from('menu_items').insert(item))
    }
    if (error) {
      setToast({ type: 'error', message: 'Gagal menyimpan: ' + error.message })
      return
    }
    await fetchItems()
    setSelected(emptyItem)
    setToast({ type: 'success', message: 'Item tersimpan' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus item ini?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) {
      setToast({ type: 'error', message: 'Gagal menghapus: ' + error.message })
      return
    }
    await fetchItems()
    setSelected(emptyItem)
    setToast({ type: 'success', message: 'Item dihapus' })
  }

  const handleToggleActive = async (item) => {
    await supabase.from('menu_items').update({ active: !item.active }).eq('id', item.id)
    await fetchItems()
  }

  const handleReorder = async (reorderedItems) => {
    setItems((prev) => {
      const others = prev.filter((p) => !reorderedItems.find((r) => r.id === p.id))
      return [...others, ...reorderedItems].sort((a, b) => a.category.localeCompare(b.category))
    })
    await Promise.all(
      reorderedItems.map((item, index) =>
        supabase.from('menu_items').update({ sort_order: index + 1 }).eq('id', item.id)
      )
    )
    await fetchItems()
  }

  return (
    <div>
      <h1 className="page-title">Menu Management</h1>
      <div className="menu-management-grid">
        <MenuList
          items={items}
          loading={loading}
          selectedId={selected.id}
          onSelect={setSelected}
          onAddNew={() => setSelected(emptyItem)}
          onToggleActive={handleToggleActive}
          onReorder={handleReorder}
        />
        <MenuItemForm
          key={selected.id || 'new'}
          item={selected}
          onChange={setSelected}
          onSave={handleSave}
          onDelete={handleDelete}
        />
        <LivePreview item={selected} />
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
