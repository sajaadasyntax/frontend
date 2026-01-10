'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart-store'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale } = useLocaleStore()
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const { user, isAuthenticated, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Redirect admin users to admin panel (they shouldn't access user pages)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN' && !pathname.startsWith('/admin')) {
      router.replace('/admin')
    }
  }, [isAuthenticated, user, pathname, router])

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en'
    setLocale(newLocale)
    window.location.reload()
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-7xl mx-auto py-3 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/">
            <Image
              src="/images/Logo Mark.svg"
              alt="Mayan Logo"
              width={38}
              height={38}
              className="cursor-pointer"
            />
          </Link>
          <nav className="flex gap-7">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium text-[15px]">
              {t('shop')}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary font-medium text-[15px]">
              {t('about')}
            </Link>
          </nav>
        </div>

        {/* Search and Icons */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder={t('search')}
              className="border border-gray-300 rounded-full px-4 py-1.5 pr-10 w-60 text-sm focus:outline-none focus:border-secondary"
            />
            <Image
              src="/images/Search Icon.svg"
              alt="Search"
              width={18}
              height={18}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            />
          </div>

          {/* Language Toggle */}
          <button 
            onClick={toggleLocale}
            className="text-gray-700 font-medium text-sm hover:text-primary transition-colors"
          >
            {locale === 'en' ? 'عربي' : 'En'}
          </button>

          {/* Cart Icon */}
          <Link href="/cart" className="relative">
            <Image
              src="/images/Cart Icon.svg"
              alt="Cart"
              width={22}
              height={22}
              className="cursor-pointer"
            />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center"
            >
              <Image
                src="/images/User Icon.svg"
                alt="User"
                width={22}
                height={22}
                className="cursor-pointer"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-primary">{user.name || user.phone}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('profile')}
                    </Link>
                    <Link
                      href="/invoices"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      الفواتير / Invoices
                    </Link>
                    <Link
                      href="/messages"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      الرسائل / Messages
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-primary font-medium hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        لوحة التحكم / Admin
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('register')}
                    </Link>
                  </>
                )}
                <hr className="my-2" />
                <Link
                  href="/support"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  الدعم الفني / Support
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
