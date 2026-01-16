'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { ordersApi, UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    nameEn: string
    nameAr: string
    image: string
  }
}

interface Order {
  id: string
  invoiceNumber: string
  status: string
  paymentStatus: string
  subtotal: number
  delivery: number
  discount: number
  total: number
  country: string
  state: string
  address: string
  loyaltyPointsEarned: number
  loyaltyPointsUsed: number
  couponCode: string | null
  paymentScreenshot: string | null
  createdAt: string
  items: OrderItem[]
  user: {
    id: string
    name: string
    phone: string
    email: string
    loyaltyPoints: number
  }
}

export default function AdminInvoiceDetailPage({ params }: { params: { id: string } }) {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const router = useRouter()
  const isArabic = locale === 'ar'

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }

    ordersApi.getById(params.id, token)
      .then(data => {
        setOrder(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error(isArabic ? 'خطأ في تحميل الفاتورة' : 'Error loading invoice')
        setLoading(false)
      })
  }, [params.id, token, router, isArabic])

  const updateOrderStatus = async (status: string) => {
    if (!token || !order) return
    
    try {
      await ordersApi.update(order.id, { status }, token)
      setOrder({ ...order, status })
      toast.success(isArabic ? 'تم التحديث بنجاح' : 'Updated successfully')
    } catch {
      toast.error(isArabic ? 'خطأ في التحديث' : 'Error updating')
    }
  }

  const updatePaymentStatus = async (paymentStatus: string) => {
    if (!token || !order) return
    
    try {
      await ordersApi.update(order.id, { paymentStatus }, token)
      setOrder({ ...order, paymentStatus })
      toast.success(isArabic ? 'تم التحديث بنجاح' : 'Updated successfully')
    } catch {
      toast.error(isArabic ? 'خطأ في التحديث' : 'Error updating')
    }
  }

  const statusOptions = [
    { value: 'PENDING', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
    { value: 'CONFIRMED', labelEn: 'Confirmed', labelAr: 'مؤكد' },
    { value: 'PROCESSING', labelEn: 'Processing', labelAr: 'قيد المعالجة' },
    { value: 'DELIVERED', labelEn: 'Delivered', labelAr: 'تم التسليم' },
    { value: 'CANCELLED', labelEn: 'Cancelled', labelAr: 'ملغي' }
  ]

  const paymentOptions = [
    { value: 'PENDING', labelEn: 'Pending', labelAr: 'بانتظار الدفع' },
    { value: 'VERIFIED', labelEn: 'Verified', labelAr: 'تم التحقق' },
    { value: 'REJECTED', labelEn: 'Rejected', labelAr: 'مرفوض' }
  ]

  const getImageSrc = (img?: string) => {
    if (!img) return '/images/product-tube.png'
    if (img.startsWith('/uploads')) return `${UPLOADS_URL}${img}`
    return img
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{isArabic ? 'الفاتورة غير موجودة' : 'Invoice not found'}</p>
        <Link href="/admin/invoices" className="text-primary hover:underline mt-2 inline-block">
          {isArabic ? 'العودة للفواتير' : 'Back to Invoices'}
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices" className="text-primary hover:underline">
            ← {isArabic ? 'العودة' : 'Back'}
          </Link>
          <h1 className="text-3xl font-bold text-primary">
            {isArabic ? 'فاتورة رقم' : 'Invoice #'} {order.invoiceNumber}
          </h1>
        </div>
        <div className="text-gray-600">
          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Info & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'معلومات العميل' : 'Customer Information'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{isArabic ? 'الاسم' : 'Name'}</p>
                <p className="font-semibold">{order.user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{isArabic ? 'رقم الهاتف' : 'Phone'}</p>
                <p className="font-semibold font-mono">{order.user?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{isArabic ? 'البريد الإلكتروني' : 'Email'}</p>
                <p className="font-semibold">{order.user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{isArabic ? 'نقاط الولاء' : 'Loyalty Points'}</p>
                <p className="font-semibold">⭐ {order.user?.loyaltyPoints || 0}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
            </h2>
            <p className="text-gray-700">
              {order.address || '-'}, {order.state}, {order.country}
            </p>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'المنتجات' : 'Items'}
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image
                      src={getImageSrc(item.product.image)}
                      alt={isArabic ? item.product.nameAr : item.product.nameEn}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-primary">
                      {isArabic ? item.product.nameAr : item.product.nameEn}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x SDG {item.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-bold text-primary">
                    SDG {(item.quantity * item.price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status & Summary */}
        <div className="space-y-6">
          {/* Payment Screenshot - Show FIRST for visibility */}
          {order.paymentScreenshot && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-primary mb-4">
                {isArabic ? 'إيصال الدفع (mBoK)' : 'Payment Receipt (mBoK)'}
              </h2>
              <a 
                href={getImageSrc(order.paymentScreenshot)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Image
                  src={getImageSrc(order.paymentScreenshot)}
                  alt="Payment Screenshot"
                  width={300}
                  height={400}
                  className="rounded-lg w-full object-cover hover:opacity-80 transition-opacity cursor-zoom-in border border-gray-200"
                />
                <p className="text-center text-sm text-primary mt-2 hover:underline">
                  {isArabic ? 'اضغط للتكبير' : 'Click to enlarge'}
                </p>
              </a>
            </div>
          )}

          {/* Status Controls */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'حالة الطلب' : 'Order Status'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'حالة الطلب' : 'Order Status'}
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  className="select-field"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'حالة الدفع' : 'Payment Status'}
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  className={`select-field ${
                    order.paymentStatus === 'VERIFIED' 
                      ? 'bg-green-50' 
                      : order.paymentStatus === 'REJECTED'
                      ? 'bg-red-50'
                      : 'bg-yellow-50'
                  }`}
                >
                  {paymentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'ملخص الطلب' : 'Order Summary'}
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-semibold">SDG {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isArabic ? 'التوصيل' : 'Delivery'}</span>
                <span className="font-semibold">SDG {order.delivery.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                  <span>-SDG {order.discount.toLocaleString()}</span>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>{isArabic ? 'كود الخصم' : 'Coupon'}</span>
                  <span>🎫 {order.couponCode}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-xl">
                <span className="font-bold text-primary">{isArabic ? 'المجموع الكلي' : 'Total'}</span>
                <span className="font-bold text-primary">SDG {order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Loyalty Points */}
            {(order.loyaltyPointsEarned > 0 || order.loyaltyPointsUsed > 0) && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-700 mb-2">
                  ⭐ {isArabic ? 'نقاط الولاء' : 'Loyalty Points'}
                </h3>
                {order.loyaltyPointsEarned > 0 && (
                  <p className="text-green-600 text-sm">
                    +{order.loyaltyPointsEarned} {isArabic ? 'نقطة مكتسبة' : 'points earned'}
                  </p>
                )}
                {order.loyaltyPointsUsed > 0 && (
                  <p className="text-amber-600 text-sm">
                    -{order.loyaltyPointsUsed} {isArabic ? 'نقطة مستخدمة' : 'points used'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

