import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { List, Item } from '@/types/database'

export default function ShareView() {
  const { shareId } = useParams<{ shareId: string }>()
  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shareId) return

    const fetchData = async () => {
      const { data: listData, error } = await supabase
        .from('lists')
        .select('*')
        .eq('share_id', shareId)
        .eq('is_public', true)
        .single()

      if (error || !listData) {
        setLoading(false)
        return
      }

      setList(listData)

      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('list_id', listData.id)
        .order('created_at', { ascending: true })

      if (itemsData) setItems(itemsData)
      setLoading(false)
    }

    fetchData()
  }, [shareId])

  // Realtime
  useEffect(() => {
    if (!list) return

    const channel = supabase
      .channel(`share-${list.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `list_id=eq.${list.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [...prev, payload.new as Item])
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) =>
                item.id === (payload.new as Item).id ? (payload.new as Item) : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== (payload.old as Item).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [list])

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!list || !newItem.trim()) return

    await supabase.from('items').insert({
      list_id: list.id,
      text: newItem.trim(),
    })

    setNewItem('')
  }

  const toggleItem = async (item: Item) => {
    await supabase
      .from('items')
      .update({ is_completed: !item.is_completed, updated_at: new Date().toISOString() })
      .eq('id', item.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">This shared list is not available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <p className="text-sm text-green-600 font-medium">Shared list</p>
          <h1 className="text-xl font-bold text-gray-900">{list.title}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={addItem} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an item..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!newItem.trim()}
            className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No items yet</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200"
              >
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={() => toggleItem(item)}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span
                  className={`flex-1 ${
                    item.is_completed ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
