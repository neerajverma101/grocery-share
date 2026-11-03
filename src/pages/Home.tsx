import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { List } from '@/types/database'

export default function Home() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return

    const fetchLists = async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setLists(data)
      }
      setLoading(false)
    }

    fetchLists()
  }, [user])

  const createList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTitle.trim()) return

    setCreating(true)
    const { data, error } = await supabase
      .from('lists')
      .insert({
        title: newTitle.trim(),
        owner_id: user.id,
      })
      .select()
      .single()

    setCreating(false)

    if (!error && data) {
      setLists((prev) => [data, ...prev])
      setNewTitle('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-700">Grocery Share</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={createList} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New list name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>

        {lists.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No lists yet. Create your first one!
          </p>
        ) : (
          <ul className="space-y-3">
            {lists.map((list) => (
              <li key={list.id}>
                <Link
                  to={`/list/${list.id}`}
                  className="block bg-white p-4 rounded-lg border-gray-200 hover:border-green-400 transition"
                >
                  <div className="font-medium">{list.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {list.is_public ? 'Shared' : 'Private'} ·{' '}
                    {new Date(list.created_at).toLocaleDateString()}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
