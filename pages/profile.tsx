import { useEffect, useState } from 'react'
import { supabase, UserProfile } from '../lib/supabaseClient'

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single().maybeSingle()
      if (p) setProfile(p as UserProfile)
    })
  }, [])

  async function updateProfile(e: any) {
    e.preventDefault()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, full_name: name }, { onConflict: 'id' })
    alert('Saved')
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={updateProfile}>
          <label className="block text-sm mb-1">Full name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 border rounded mb-4" />
          <button className="bg-wa-accent text-white px-4 py-2 rounded" type="submit">Save</button>
        </form>
        <pre className="mt-4 text-xs bg-gray-50 p-2 rounded">{JSON.stringify(profile,null,2)}</pre>
      </div>
    </div>
  )
}
