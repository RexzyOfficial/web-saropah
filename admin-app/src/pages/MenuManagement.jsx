import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import MenuList from '../components/MenuList'
import MenuItemForm from '../components/MenuItemForm'
import LivePreview from '../components/LivePreview'

const emptyItem = { name: '', price: '', description: '', image_url: '', category: 'coffee-basic', active: true }

export default function MenuManagement() {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(emptyItem)
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('menu_items').select('*').order('category').order('sort_order')
    if (!error) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleSave = async (item) => {
    if (item.id) {
      await supabase.from('menu_items').update(item).eq('id', item.id)
    } else {
      await supabase.from('menu_items').insert(item)
    }
    await fetchItems()
    setSelected(emptyItem)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus item ini?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    await fetchItems()
    setSelected(emptyItem)
  }

  const handleToggleActive = async (item) => {
    await supabase.from('menu_items').update({ active: !item.active }).eq('id', item.id)
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
    </div>
  )
}