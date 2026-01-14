import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { AlertProvider } from '../components/AlertProvider'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // client-side only: fast check
  }, [])

  return (
    <AlertProvider>
      <Component {...pageProps} />
    </AlertProvider>
  )
}
