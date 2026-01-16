'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'

const adminNavItems = [
  { href: '/admin', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: '📊' },
  { href: '/admin/categories', labelEn: 'Categories', labelAr: 'الفئات', icon: '📁' },
  { href: '/admin/inventory', labelEn: 'Inventory', labelAr: 'المخزون', icon: '📦' },
  { href: '/admin/invoices', labelEn: 'Orders', labelAr: 'الطلبات', icon: '🧾' },
  { href: '/admin/procurement', labelEn: 'Procurement', labelAr: 'المشتريات', icon: '🛒' },
  { href: '/admin/reports', labelEn: 'Reports', labelAr: 'التقارير', icon: '📈' },
  { href: '/admin/messages', labelEn: 'Messages', labelAr: 'الرسائل', icon: '💬' },
  { href: '/admin/loyalty', labelEn: 'Loyalty Points', labelAr: 'نقاط الولاء', icon: '⭐' },
  { href: '/admin/loyalty-shop', labelEn: 'Loyalty Shop', labelAr: 'متجر الولاء', icon: '🎁' },
  { href: '/admin/coupons', labelEn: 'Discount Codes', labelAr: 'أكواد الخصم', icon: '🎫' },
  { href: '/admin/users', labelEn: 'Users', labelAr: 'المستخدمين', icon: '👥' },
  { href: '/admin/bank-accounts', labelEn: 'Bank Accounts', labelAr: 'الحسابات البنكية', icon: '🏦' },
  { href: '/admin/settings', labelEn: 'Settings', labelAr: 'الإعدادات', icon: '⚙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const tc = useTranslations('common')
  const { locale } = useLocaleStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const isArabic = locale === 'ar'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else if (user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    window.location.href = '/auth/login'
  }

  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary text-white z-50 px-4 py-3 flex items-center justify-between shadow-md">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">
          {isArabic ? 'لوحة الإدارة' : 'Admin Panel'}
        </h1>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          title={isArabic ? 'تسجيل الخروج' : 'Logout'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[60]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-[70]
        w-64 bg-primary text-white flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:transform-none
        pt-14 lg:pt-0
      `}>
        <div className="p-4 lg:p-6 flex items-center justify-between">
          <h1 className="text-lg lg:text-xl font-bold">
            {isArabic ? 'لوحة الإدارة' : 'Admin Panel'}
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white hover:bg-opacity-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-2 lg:mt-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 lg:px-6 py-2.5 lg:py-3 transition-colors text-sm lg:text-base ${
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
        
        {/* Logout Button */}
        <div className="absolute bottom-0 w-64 p-4 lg:p-6 border-t border-white border-opacity-20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white opacity-80 hover:opacity-100 w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isArabic ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto mt-14 lg:mt-0">
        {children}
      </main>
    </div>
  )
}
