import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { Providers } from './providers'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Mayan Shop - منتجات العناية بالبشرة',
  description: 'Premium skincare products - منتجات العناية بالبشرة الفاخرة',
}

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default
  } catch {
    return (await import(`@/messages/en.json`)).default
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'en'
  const messages = await getMessages(locale)

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <Providers locale={locale} messages={messages}>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
