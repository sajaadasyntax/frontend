'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { ordersApi } from '@/lib/api'

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
  createdAt: string
  items: OrderItem[]
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('invoice')
  const tc = useTranslations('common')
  const { isAuthenticated, token } = useAuthStore()
  const router = useRouter()
  const { locale } = useLocaleStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login')
      return
    }

    ordersApi.getById(params.id, token)
      .then(data => {
        setOrder(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id, isAuthenticated, token, router])

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  const isArabic = locale === 'ar'

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/invoices" className="inline-flex items-center text-primary mb-6 hover:underline">
          ← {tc('back')}
        </Link>

        <h1 className="text-4xl font-bold text-primary text-center mb-8">{t('invoiceDetails')}</h1>

        {/* Invoice Header */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('invoiceNumber')}</p>
              <p className="text-2xl font-bold text-primary">{order.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">{t('date')}</p>
              <p className="text-lg font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card mb-6">
          <h2 className="font-bold text-primary text-xl mb-4">{t('items')}</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image
                    src={item.product.image || '/images/product-tube.png'}
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
                    {item.quantity} x {tc('currency')} {item.price.toLocaleString()}
                  </p>
                </div>
                <p className="font-bold text-primary">
                  {tc('currency')} {(item.quantity * item.price).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-semibold">{tc('currency')} {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{isArabic ? 'التوصيل' : 'Delivery'}</span>
              <span className="font-semibold">{tc('currency')} {order.delivery.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{isArabic ? 'الخصم' : 'Discount'}</span>
              <span className="font-semibold text-green-600">-{tc('currency')} {order.discount.toLocaleString()}</span>
            </div>
            <hr />
            <div className="flex justify-between text-xl">
              <span className="font-bold text-primary">{isArabic ? 'المجموع الكلي' : 'Total'}</span>
              <span className="font-bold text-primary">{tc('currency')} {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div className="card">
            <h2 className="font-bold text-primary text-xl mb-4">
              {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
            </h2>
            <p className="text-gray-700">
              {order.address}, {order.state}, {order.country}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
