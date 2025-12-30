import React from 'react'

type Props = {
  text: string
  from?: string
  me?: boolean
}

export default function ChatBubble({ text, from, me }: Props) {
  return (
    <div className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
      <div className={`${me ? 'bg-wa-accent text-white' : 'bg-white'} max-w-xs px-4 py-2 rounded-lg shadow-sm`}>
        {from && <div className="text-[10px] opacity-70 mb-1">{from}</div>}
        <div>{text}</div>
      </div>
    </div>
  )
}
