'use client'

import { NextIntlClientProvider } from 'next-intl'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

interface ProvidersProps {
  children: React.ReactNode
  locale: string
  messages: any
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <Toaster position="top-center" />
    </NextIntlClientProvider>
  )
}
