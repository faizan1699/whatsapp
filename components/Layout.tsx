import React from 'react'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen text-sm">
      <aside className="w-80 bg-wa-side text-white p-4 flex-shrink-0 flex flex-col">
        <header className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">WA</div>
          <h1 className="font-semibold">WhatsApp</h1>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="mb-3">
            <Link href="/profile" className="block px-2 py-1 rounded hover:bg-white/5">Profile</Link>
            <Link href="/admin" className="block px-2 py-1 rounded hover:bg-white/5">Admin</Link>
          </div>

          <div className="mt-4">
            <div className="px-2 text-xs text-white/70 mb-2">CHATS</div>
            <ul className="space-y-2">
              <li className="px-2 py-2 bg-white/5 rounded">General</li>
              <li className="px-2 py-2 bg-white/5 rounded">Random</li>
            </ul>
          </div>
        </div>

        <footer className="mt-4 text-xs text-white/60">
          Logged in as <span className="font-medium">you</span>
        </footer>
      </aside>

      <main className="flex-1 flex flex-col bg-wa-bg">
        {children}
      </main>
    </div>
  )
}
