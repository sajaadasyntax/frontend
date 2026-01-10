'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'

const adminNavItems = [
  { href: '/admin', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: '📊' },
  { href: '/admin/categories', labelEn: 'Categories', labelAr: 'الفئات', icon: '📁' },
  { href: '/admin/inventory', labelEn: 'Inventory', labelAr: 'المخزون', icon: '📦' },
  { href: '/admin/invoices', labelEn: 'Invoices', labelAr: 'الفواتير', icon: '🧾' },
  { href: '/admin/procurement', labelEn: 'Procurement', labelAr: 'المشتريات', icon: '🛒' },
  { href: '/admin/reports', labelEn: 'Reports', labelAr: 'التقارير', icon: '📈' },
  { href: '/admin/messages', labelEn: 'Messages', labelAr: 'الرسائل', icon: '💬' },
  { href: '/admin/loyalty', labelEn: 'Loyalty Points', labelAr: 'نقاط الولاء', icon: '⭐' },
  { href: '/admin/coupons', labelEn: 'Discount Codes', labelAr: 'أكواد الخصم', icon: '🎫' },
  { href: '/admin/users', labelEn: 'Users', labelAr: 'المستخدمين', icon: '👥' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const tc = useTranslations('common')
  const { locale } = useLocaleStore()
  
  const isArabic = locale === 'ar'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else if (user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold">
            {isArabic ? 'لوحة الإدارة' : 'Admin Panel'}
          </h1>
        </div>
        <nav className="mt-4">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-white bg-opacity-20 border-l-4 border-secondary'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{isArabic ? item.labelAr : item.labelEn}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-white opacity-80 hover:opacity-100"
          >
            ← {isArabic ? 'العودة للمتجر' : 'Back to Store'}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
