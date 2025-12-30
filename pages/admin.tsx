import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type UserRow = { id: string; email?: string | null }

export default function Admin() {
  const [users, setUsers] = useState<UserRow[]>([])

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    // Fetch users from Supabase auth via service role (not safe client-side); this is a stub.
    const { data } = await supabase.from('profiles').select('id,email')
    setUsers((data as any) || [])
  }

  async function removeUser(id: string) {
    if (!confirm('Delete user?')) return
    await supabase.from('profiles').delete().eq('id', id)
    fetchUsers()
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Admin — Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Email</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u=> (
                <tr key={u.id} className="border-b">
                  <td className="py-2 max-w-xs truncate">{u.id}</td>
                  <td className="py-2">{(u as any).email}</td>
                  <td className="py-2"><button onClick={()=>removeUser(u.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
