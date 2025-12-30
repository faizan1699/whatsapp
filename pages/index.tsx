import { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import ChatBubble from '../components/ChatBubble'

let socket: any = null

export default function Home() {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [user, setUser] = useState<any>(null)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    // ensure server-side socket endpoint is initialized
    fetch('/api/socketio').finally(() => {
      const s = io()
      socket = s
      s.on('connect', () => console.log('connected'))
      s.on('message', (msg: any) => {
        setMessages((m) => [...m, msg])
      })
    })
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted.current) setUser(user)
    })

    return () => { mounted.current = false; socket?.disconnect() }
  }, [])

  function send() {
    if (!text) return
    const msg = { id: Date.now(), text, from: user?.email || 'anon' }
    socket.emit('message', msg)
    setMessages((m) => [...m, msg])
    setText('')
  }

  return (
    <Layout>
      <div className="flex-1 p-4 overflow-auto bg-gradient-to-b from-white to-wa-chatbg">
        <div className="space-y-3">
          {messages.map((m) => (
            <ChatBubble key={m.id} text={m.text} from={m.from} me={m.from === (user?.email || 'anon')} />
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t sticky bottom-0">
        <div className="flex gap-3">
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-full border px-4 py-2 focus:outline-none"
          />
          <button onClick={send} className="bg-wa-accent text-white rounded-full px-4 py-2">Send</button>
        </div>
      </div>
    </Layout>
  )
}
