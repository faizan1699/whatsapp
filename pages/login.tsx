import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  async function handleMagicLink(e: any) {
    e.preventDefault()
    if (!email) return
    await supabase.auth.signInWithOtp({ email })
    alert('Check your email for a magic link')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-wa-bg">
      <form onSubmit={handleMagicLink} className="w-80 p-6 shadow rounded bg-white">
        <h2 className="text-xl font-semibold mb-4">Sign in</h2>
        <input
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded mb-4"
        />
        <button className="w-full bg-wa-accent text-white py-2 rounded" type="submit">Send magic link</button>
      </form>
    </div>
  )
}
