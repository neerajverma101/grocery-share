import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { List, Item } from '@/types/database'

export default function ListDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isOwner = user && list?.owner_id === user.id

  // Fetch list + items
  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const { data: listData, error: listError } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .single()

      if (listError || !listData) {
        setLoading(false)
        return
      }

      setList(listData)

      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('list_id', id)
        .order('created_at', { ascending: true })

      if (itemsData) setItems(itemsData)
      setLoading(false)
    }

    fetchData()
  }, [id])

  // Realtime subscription
  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel(`list-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `list_id=eq.${id}`,
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
  }, [id])

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !newItem.trim()) return

    const { error } = await supabase.from('items').insert({
      list_id: id,
      text: newItem.trim(),
    })

    if (!error) {
      setNewItem('')
    }
  }

  const toggleItem = async (item: Item) => {
    await supabase
      .from('items')
      .update({ is_completed: !item.is_completed, updated_at: new Date().toISOString() })
      .eq('id', item.id)
  }

  const deleteItem = async (itemId: string) => {
    await supabase.from('items').delete().eq('id', itemId)
  }

  const enableSharing = async () => {
    if (!list || !isOwner) return

    const shareId = crypto.randomUUID().slice(0, 8)

    const { data, error } = await supabase
      .from('lists')
      .update({ is_public: true, share_id: shareId })
      .eq('id', list.id)
      .select()
      .single()

    if (!error && data) {
      setList(data)
      const url = `${window.location.origin}/share/${shareId}`
      setShareUrl(url)
    }
  }

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">List not found</p>
        <Link to="/" className="text-green-600 hover:underline">
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              {isOwner && (
                <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                  ← Back
                </Link>
              )}
              <h1 className="text-xl font-bold text-gray-900 mt-1">{list.title}</h1>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                {list.is_public ? (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/share/${list.share_id}`
                      setShareUrl(url)
                      copyShareLink()
                    }}
                    className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    {copied ? 'Copied!' : 'Copy share link'}
                  </button>
                ) : (
                  <button
                    onClick={enableSharing}
                    className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Share list
                  </button>
                )}
              </div>
            )}
          </div>

          {shareUrl && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm flex items-center justify-between gap-2">
              <span className="truncate text-green-800">{shareUrl}</span>
              <button
                onClick={copyShareLink}
                className="shrink-0 text-green-700 font-medium"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
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
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
