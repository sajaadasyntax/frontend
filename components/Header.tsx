'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart-store'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { loyaltyShopApi, messagesApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function Header() {
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale } = useLocaleStore()
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const { user, isAuthenticated, logout, token } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loyaltyShopUnlocked, setLoyaltyShopUnlocked] = useState(false)
  const [hasShownUnlockMessage, setHasShownUnlockMessage] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  // Redirect admin users to admin panel (they shouldn't access user pages)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN' && !pathname.startsWith('/admin')) {
      router.replace('/admin')
    }
  }, [isAuthenticated, user, pathname, router])

  // Check loyalty shop access
  const checkLoyaltyAccess = useCallback(async () => {
    if (!token || user?.role === 'ADMIN') return

    try {
      const result = await loyaltyShopApi.checkAccess(token)
      const wasLocked = !loyaltyShopUnlocked
      setLoyaltyShopUnlocked(result.canAccess)

      // Show notification when shop is first unlocked
      const shownKey = `loyalty_unlock_shown_${user?.id}`
      const hasShown = localStorage.getItem(shownKey)
      
      if (result.canAccess && wasLocked && !hasShown && !hasShownUnlockMessage) {
        setHasShownUnlockMessage(true)
        localStorage.setItem(shownKey, 'true')
        toast.success(
          locale === 'ar' 
            ? '🎉 تهانينا! لقد فتحت متجر الولاء. يمكنك الآن استبدال نقاطك بمنتجات حصرية!'
            : '🎉 Congratulations! You\'ve unlocked the Loyalty Shop. You can now redeem your points for exclusive products!',
          { duration: 6000 }
        )
      }
    } catch (error) {
      console.error('Error checking loyalty access:', error)
    }
  }, [token, user?.role, user?.id, loyaltyShopUnlocked, hasShownUnlockMessage, locale])

  useEffect(() => {
    if (isAuthenticated && token && user?.role !== 'ADMIN') {
      checkLoyaltyAccess()
      checkUnreadMessages()
    }
  }, [isAuthenticated, token, user?.role, checkLoyaltyAccess])

  // Check for unread messages
  const checkUnreadMessages = async () => {
    if (!token || user?.role === 'ADMIN') return

    try {
      const messages = await messagesApi.getAll(token, 'inbox')
      const unreadCount = messages.filter((m: any) => !m.isRead).length
      setUnreadMessageCount(unreadCount)

      // Show notification for unread messages on first check
      const notifKey = `msg_notif_shown_${user?.id}`
      const lastShown = localStorage.getItem(notifKey)
      const now = Date.now()
      
      // Only show notification once per hour
      if (unreadCount > 0 && (!lastShown || (now - parseInt(lastShown)) > 3600000)) {
        localStorage.setItem(notifKey, now.toString())
        toast.success(
          locale === 'ar'
            ? `📬 لديك ${unreadCount} رسالة جديدة`
            : `📬 You have ${unreadCount} new message${unreadCount > 1 ? 's' : ''}`,
          { duration: 5000 }
        )
      }
    } catch (error) {
      console.error('Error checking messages:', error)
    }
  }

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e as unknown as React.FormEvent)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 px-3 md:px-[5%]">
      <div className="max-w-7xl mx-auto py-2 md:py-3 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/">
            <Image
              src="/images/Logo Mark.svg"
              alt="Mayan Logo"
              width={38}
              height={38}
              className="cursor-pointer w-8 h-8 md:w-[38px] md:h-[38px]"
            />
          </Link>
          <nav className="hidden md:flex gap-7">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium text-[15px]">
              {t('shop')}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary font-medium text-[15px]">
              {t('about')}
            </Link>
          </nav>
        </div>

        {/* Search and Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-1"
          >
            <Image
              src="/images/Search Icon.svg"
              alt="Search"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </button>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="border border-gray-300 rounded-full px-4 py-1.5 pr-10 w-60 text-sm focus:outline-none focus:border-secondary"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Image
                src="/images/Search Icon.svg"
                alt="Search"
                width={18}
                height={18}
                className="cursor-pointer"
              />
            </button>
          </form>

          {/* Language Toggle */}
          <button 
            onClick={toggleLocale}
            className="text-gray-700 font-medium text-xs md:text-sm hover:text-primary transition-colors"
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
              className="cursor-pointer w-5 h-5 md:w-[22px] md:h-[22px]"
            />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
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
                className="cursor-pointer w-5 h-5 md:w-[22px] md:h-[22px]"
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
                    {user.role === 'ADMIN' ? (
                      <>
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-primary font-medium hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          لوحة التحكم / Admin
                        </Link>
                      </>
                    ) : (
                      <>
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
                          الطلبات / Orders
                        </Link>
                        <Link
                          href="/messages"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative"
                          onClick={() => setShowUserMenu(false)}
                        >
                          الرسائل / Messages
                          {unreadMessageCount > 0 && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                              {unreadMessageCount}
                            </span>
                          )}
                        </Link>
                        {loyaltyShopUnlocked && (
                          <Link
                            href="/loyalty-shop"
                            className="block px-4 py-2 text-sm text-amber-600 font-medium hover:bg-amber-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            🎁 {locale === 'ar' ? 'متجر الولاء' : 'Loyalty Shop'}
                          </Link>
                        )}
                      </>
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

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-3 pb-3">
          <form onSubmit={(e) => { handleSearch(e); setShowMobileSearch(false); }} className="relative">
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2 pr-10 w-full text-sm focus:outline-none focus:border-secondary"
              autoFocus
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Image
                src="/images/Search Icon.svg"
                alt="Search"
                width={18}
                height={18}
                className="cursor-pointer"
              />
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
