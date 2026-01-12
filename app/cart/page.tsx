'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart-store'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ordersApi, couponsApi } from '@/lib/api'

export default function CartPage() {
  const t = useTranslations('cart')
  const tc = useTranslations('common')
  const router = useRouter()
  const { locale } = useLocaleStore()
  const { user, token, isAuthenticated } = useAuthStore()
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()

  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [country, setCountry] = useState('Sudan')
  const [state, setState] = useState('Kassala')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)

  const subtotal = getTotal()
  const delivery = 3000
  
  // Calculate loyalty points discount (1 point = 1 SDG)
  const userLoyaltyPoints = user?.loyaltyPoints || 0
  const maxLoyaltyDiscount = Math.min(userLoyaltyPoints, subtotal + delivery - discount)
  
  // Update loyalty discount when toggle changes
  const effectiveLoyaltyDiscount = useLoyaltyPoints ? maxLoyaltyDiscount : 0
  const grandTotal = Math.max(0, subtotal + delivery - discount - effectiveLoyaltyDiscount)

  const handleApplyCoupon = async () => {
    if (!couponCode) return

    try {
      const data = await couponsApi.validate({ code: couponCode, subtotal })
      setDiscount(data.discount)
      toast.success('Coupon applied!')
    } catch (error: any) {
      toast.error(error.message || 'Error applying coupon')
    }
  }

  const handleCheckout = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to continue')
      router.push('/auth/login')
      return
    }

    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setLoading(true)

    try {
      const order = await ordersApi.create({
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        country,
        state,
        address,
        couponCode: couponCode || undefined,
        useLoyaltyPoints
      }, token)

      clearCart()
      router.push(`/payment/${order.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Error creating order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-16 px-3 md:px-[5%]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-6 md:mb-8">{t('title')}</h1>
          <p className="text-gray-600 text-base md:text-xl mb-6 md:mb-8">{t('emptyCart')}</p>
          <Link href="/">
            <button className="btn-primary px-6 md:px-8 py-2 md:py-3">
              {t('continueShopping')}
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-[5%]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-primary text-center mb-4 md:mb-8">{t('title')}</h1>

        {/* Cart Table Header - Desktop */}
        <div className="hidden md:grid bg-primary text-white py-4 px-6 rounded-t-lg grid-cols-12 gap-4 font-semibold">
          <div className="col-span-5">{t('product')}</div>
          <div className="col-span-4 text-center">{t('quantity')}</div>
          <div className="col-span-3 text-center">{t('total')}</div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg md:rounded-t-none md:rounded-b-lg shadow-md">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 md:p-6 ${
                index !== items.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image
                      src={item.image || '/images/product-tube.png'}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary text-sm mb-0.5 truncate">
                      {locale === 'ar' ? item.nameAr : item.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {tc('currency')} {item.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xl self-start"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border-2 border-gray-300 rounded-full px-2 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <Image src="/images/Subtract Icon.svg" alt="decrease" width={12} height={12} />
                    </button>
                    <span className="text-sm font-semibold text-primary w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <Image src="/images/Add Icon.svg" alt="increase" width={12} height={12} />
                    </button>
                  </div>
                  <p className="text-base font-bold text-primary">
                    {tc('currency')} {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                {/* Product Info */}
                <div className="col-span-5 flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image
                      src={item.image || '/images/product-tube.png'}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-primary mb-1">
                      {locale === 'ar' ? item.nameAr : item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tc('currency')} {item.price.toLocaleString()} {tc('perPack')}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="col-span-4 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 border-2 border-gray-300 rounded-full px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Image src="/images/Subtract Icon.svg" alt="decrease" width={14} height={14} />
                    </button>
                    <span className="text-xl font-semibold text-primary w-10 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Image src="/images/Add Icon.svg" alt="increase" width={14} height={14} />
                    </button>
                  </div>
                </div>

                {/* Total and Remove */}
                <div className="col-span-3 flex items-center justify-between">
                  <p className="text-xl font-bold text-primary">
                    {tc('currency')} {(item.price * item.quantity).toLocaleString()}.00
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirm Details Section */}
        <div className="mt-4 md:mt-8 bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-2xl font-semibold text-primary text-center mb-4 md:mb-6">{t('confirmDetails')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Coupon Code */}
            <div>
              <label className="block font-semibold text-primary text-sm md:text-base mb-2">{t('couponCode')}:</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="input-field mb-2 md:mb-3 text-sm"
                placeholder="SAVE10"
              />
              <button 
                onClick={handleApplyCoupon}
                className="btn-outline text-sm"
              >
                {t('applyCoupon')}
              </button>
            </div>

            {/* Delivery Info */}
            <div>
              <label className="block font-semibold text-primary text-sm md:text-base mb-2">{t('delivery')}:</label>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <label className="block text-xs md:text-sm text-gray-600 mb-1">{t('country')}</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="select-field text-sm"
                  >
                    <option>Sudan</option>
                    <option>Egypt</option>
                    <option>Saudi Arabia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm text-gray-600 mb-1">{t('state')}</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="select-field text-sm"
                  >
                    <option>Kassala</option>
                    <option>Khartoum</option>
                    <option>Port Sudan</option>
                    <option>Omdurman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm text-gray-600 mb-1">{t('address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('addressPlaceholder')}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              {/* Loyalty Points Section */}
              {isAuthenticated && userLoyaltyPoints > 0 && (
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLoyaltyPoints}
                      onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                      className="w-4 h-4 md:w-5 md:h-5"
                    />
                    <span className="text-amber-900 text-sm md:text-base">
                      {locale === 'ar' ? 'استخدم نقاط الولاء' : 'Use Loyalty Points'}
                    </span>
                  </label>
                  <p className="text-xs md:text-sm text-amber-700 mt-1">
                    {locale === 'ar' 
                      ? `لديك ${userLoyaltyPoints} نقطة (= SDG ${userLoyaltyPoints})`
                      : `You have ${userLoyaltyPoints} points (= SDG ${userLoyaltyPoints})`
                    }
                  </p>
                  {useLoyaltyPoints && (
                    <p className="text-xs md:text-sm font-semibold text-amber-800 mt-1">
                      {locale === 'ar' 
                        ? `سيتم خصم: SDG ${maxLoyaltyDiscount}`
                        : `Will apply: SDG ${maxLoyaltyDiscount} discount`
                      }
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="flex justify-between text-primary text-sm md:text-base">
                  <span className="font-semibold">{t('cartSubtotal')}:</span>
                  <span className="font-bold">{tc('currency')} {subtotal.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-primary text-sm md:text-base">
                  <span className="font-semibold">{t('delivery')}:</span>
                  <span className="font-bold">{tc('currency')} {delivery.toLocaleString()}.00</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm md:text-base">
                    <span className="font-semibold">{t('discount')}:</span>
                    <span className="font-bold">-{tc('currency')} {discount.toFixed(2)}</span>
                  </div>
                )}
                {effectiveLoyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 text-sm md:text-base">
                    <span className="font-semibold">⭐ {locale === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}:</span>
                    <span className="font-bold">-{tc('currency')} {effectiveLoyaltyDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t-2 border-primary pt-2 md:pt-3 mt-2 md:mt-3">
                  <div className="flex justify-between text-primary">
                    <span className="font-bold text-base md:text-lg">{t('grandTotal')}:</span>
                    <span className="font-bold text-xl md:text-2xl">{tc('currency')} {grandTotal.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full text-sm md:text-lg py-2.5 md:py-3"
              >
                {loading ? tc('loading') : t('proceedToCheckout')}
                <Image src="/images/Proceed Icon.svg" alt="proceed" width={16} height={16} className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
