'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { loyaltyShopApi, UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface LoyaltyProduct {
  id: string
  pointsRequired: number
  stockLimit: number | null
  stockUsed: number
  isActive: boolean
  product: {
    id: string
    nameEn: string
    nameAr: string
    descriptionEn: string
    descriptionAr: string
    price: number
    image: string | null
  }
}

interface Redemption {
  id: string
  pointsSpent: number
  quantity: number
  status: string
  createdAt: string
  loyaltyProduct: {
    product: {
      nameEn: string
      nameAr: string
      image: string | null
    }
  }
}

export default function LoyaltyShopPage() {
  const { locale } = useLocaleStore()
  const { user, token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [loading, setLoading] = useState(true)
  const [canAccess, setCanAccess] = useState(false)
  const [requiredPoints, setRequiredPoints] = useState(500)
  const [userPoints, setUserPoints] = useState(0)
  const [products, setProducts] = useState<LoyaltyProduct[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [showRedemptions, setShowRedemptions] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<LoyaltyProduct | null>(null)
  const [address, setAddress] = useState({
    country: user?.country || 'Sudan',
    state: user?.state || '',
    address: user?.address || ''
  })

  useEffect(() => {
    if (token) {
      checkAccess()
    } else {
      setLoading(false)
    }
  }, [token])

  const checkAccess = async () => {
    if (!token) return
    
    try {
      const result = await loyaltyShopApi.checkAccess(token)
      setCanAccess(result.canAccess)
      setUserPoints(result.userPoints)
      setRequiredPoints(result.requiredPoints)

      if (result.canAccess) {
        fetchProducts()
        fetchRedemptions()
      }
    } catch (error) {
      console.error('Error checking access:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    if (!token) return
    try {
      const data = await loyaltyShopApi.getProducts(token)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchRedemptions = async () => {
    if (!token) return
    try {
      const data = await loyaltyShopApi.getMyRedemptions(token)
      setRedemptions(data)
    } catch (error) {
      console.error('Error fetching redemptions:', error)
    }
  }

  const handleRedeemClick = (product: LoyaltyProduct) => {
    if (userPoints < product.pointsRequired) {
      toast.error(isArabic ? 'نقاطك غير كافية' : 'Insufficient points')
      return
    }
    setSelectedProduct(product)
    setShowAddressModal(true)
  }

  const handleRedeem = async () => {
    if (!token || !selectedProduct) return

    setRedeemingId(selectedProduct.id)
    try {
      await loyaltyShopApi.redeemProduct({
        loyaltyProductId: selectedProduct.id,
        quantity: 1,
        country: address.country,
        state: address.state,
        address: address.address
      }, token)

      toast.success(isArabic ? 'تم استبدال المنتج بنجاح!' : 'Product redeemed successfully!')
      setShowAddressModal(false)
      setSelectedProduct(null)
      checkAccess() // Refresh points and products
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل في استبدال المنتج' : 'Failed to redeem product'))
    } finally {
      setRedeemingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statuses: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      confirmed: { en: 'Confirmed', ar: 'مؤكد' },
      shipped: { en: 'Shipped', ar: 'تم الشحن' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' }
    }
    return statuses[status]?.[isArabic ? 'ar' : 'en'] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-primary mb-4">
              {isArabic ? 'يرجى تسجيل الدخول' : 'Please Login'}
            </h1>
            <p className="text-gray-600 mb-8">
              {isArabic 
                ? 'يجب تسجيل الدخول للوصول إلى متجر الولاء'
                : 'You need to login to access the Loyalty Shop'}
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition"
            >
              {isArabic ? 'تسجيل الدخول' : 'Login'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!canAccess) {
    const pointsNeeded = requiredPoints - userPoints
    const progress = (userPoints / requiredPoints) * 100

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-12 text-center">
            <div className="text-7xl mb-6">🎁</div>
            <h1 className="text-3xl font-bold text-primary mb-4">
              {isArabic ? 'متجر الولاء' : 'Loyalty Shop'}
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              {isArabic 
                ? `اجمع ${requiredPoints} نقطة لفتح متجر الولاء واستبدال نقاطك بمنتجات حصرية!`
                : `Collect ${requiredPoints} points to unlock the Loyalty Shop and redeem your points for exclusive products!`}
            </p>

            <div className="bg-white rounded-xl p-6 max-w-md mx-auto mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{isArabic ? 'نقاطك الحالية' : 'Your Points'}</span>
                <span>{userPoints} / {requiredPoints}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {isArabic 
                  ? `تحتاج ${pointsNeeded} نقطة إضافية لفتح المتجر`
                  : `You need ${pointsNeeded} more points to unlock`}
              </p>
            </div>

            <Link
              href="/"
              className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition"
            >
              {isArabic ? 'تسوق الآن واجمع النقاط' : 'Shop Now & Earn Points'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🎁 {isArabic ? 'متجر الولاء' : 'Loyalty Shop'}
              </h1>
              <p className="opacity-90">
                {isArabic 
                  ? 'استبدل نقاطك بمنتجات حصرية'
                  : 'Redeem your points for exclusive products'}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
              <p className="text-sm opacity-90">{isArabic ? 'نقاطك' : 'Your Points'}</p>
              <p className="text-3xl font-bold">⭐ {userPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowRedemptions(false)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              !showRedemptions 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isArabic ? 'المنتجات' : 'Products'}
          </button>
          <button
            onClick={() => setShowRedemptions(true)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              showRedemptions 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isArabic ? 'طلباتي' : 'My Redemptions'}
          </button>
        </div>

        {/* Products Grid */}
        {!showRedemptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((lp) => {
              const availableStock = lp.stockLimit ? lp.stockLimit - lp.stockUsed : null
              const canRedeem = userPoints >= lp.pointsRequired && (availableStock === null || availableStock > 0)

              return (
                <div 
                  key={lp.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="aspect-square relative bg-gray-100">
                    {lp.product.image ? (
                      <Image
                        src={`${UPLOADS_URL}${lp.product.image}`}
                        alt={isArabic ? lp.product.nameAr : lp.product.nameEn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                        🎁
                      </div>
                    )}
                    {availableStock !== null && availableStock <= 5 && availableStock > 0 && (
                      <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {isArabic ? `متبقي ${availableStock}` : `${availableStock} left`}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary mb-1 line-clamp-1">
                      {isArabic ? lp.product.nameAr : lp.product.nameEn}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {isArabic ? lp.product.descriptionAr : lp.product.descriptionEn}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        ⭐ {lp.pointsRequired.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRedeemClick(lp)}
                        disabled={!canRedeem || redeemingId === lp.id}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                          canRedeem
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {redeemingId === lp.id ? (
                          <span className="animate-spin">⏳</span>
                        ) : userPoints < lp.pointsRequired ? (
                          isArabic ? 'نقاط غير كافية' : 'Need More Points'
                        ) : availableStock === 0 ? (
                          isArabic ? 'نفذت الكمية' : 'Out of Stock'
                        ) : (
                          isArabic ? 'استبدال' : 'Redeem'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!showRedemptions && products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">
              {isArabic ? 'لا توجد منتجات متاحة حالياً' : 'No products available at the moment'}
            </p>
          </div>
        )}

        {/* Redemptions List */}
        {showRedemptions && (
          <div className="space-y-4">
            {redemptions.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {r.loyaltyProduct.product.image ? (
                    <Image
                      src={`${UPLOADS_URL}${r.loyaltyProduct.product.image}`}
                      alt={isArabic ? r.loyaltyProduct.product.nameAr : r.loyaltyProduct.product.nameEn}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                      🎁
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-primary">
                    {isArabic ? r.loyaltyProduct.product.nameAr : r.loyaltyProduct.product.nameEn}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString(isArabic ? 'ar-SD' : 'en-US')}
                    {r.quantity > 1 && ` × ${r.quantity}`}
                  </p>
                  <p className="text-sm text-amber-600 font-medium">
                    ⭐ {r.pointsSpent.toLocaleString()} {isArabic ? 'نقطة' : 'points'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.status)}`}>
                  {getStatusText(r.status)}
                </span>
              </div>
            ))}
          </div>
        )}

        {showRedemptions && redemptions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-gray-500">
              {isArabic ? 'لم تقم باستبدال أي منتجات بعد' : 'You haven\'t redeemed any products yet'}
            </p>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                {selectedProduct.product.image ? (
                  <Image
                    src={`${UPLOADS_URL}${selectedProduct.product.image}`}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {isArabic ? selectedProduct.product.nameAr : selectedProduct.product.nameEn}
                </p>
                <p className="text-amber-600 font-bold">
                  ⭐ {selectedProduct.pointsRequired.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الدولة' : 'Country'}
                </label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الولاية / المدينة' : 'State / City'}
                </label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'العنوان التفصيلي' : 'Full Address'}
                </label>
                <textarea
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddressModal(false)
                  setSelectedProduct(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleRedeem}
                disabled={redeemingId !== null}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {redeemingId ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  isArabic ? 'تأكيد الاستبدال' : 'Confirm Redemption'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

