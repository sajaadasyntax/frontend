'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { ordersApi } from '@/lib/api'

interface Order {
  id: string
  invoiceNumber: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  items: any[]
}

export default function InvoicesPage() {
  const t = useTranslations('invoice')
  const tc = useTranslations('common')
  const { isAuthenticated, token } = useAuthStore()
  const router = useRouter()
  const { locale } = useLocaleStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login')
      return
    }

    ordersApi.getAll(token)
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isAuthenticated, token, router])

  const getStatusLabel = (orderStatus: string) => {
    const labels: Record<string, { en: string; ar: string; color: string }> = {
      PENDING: { en: 'Pending', ar: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { en: 'Confirmed', ar: 'مؤكد', color: 'bg-blue-100 text-blue-800' },
      PROCESSING: { en: 'Processing', ar: 'قيد المعالجة', color: 'bg-purple-100 text-purple-800' },
      SHIPPED: { en: 'Shipped', ar: 'تم الشحن', color: 'bg-indigo-100 text-indigo-800' },
      DELIVERED: { en: 'Delivered', ar: 'تم التسليم', color: 'bg-green-100 text-green-800' },
      CANCELLED: { en: 'Cancelled', ar: 'ملغي', color: 'bg-red-100 text-red-800' }
    }
    const label = labels[orderStatus] || labels.PENDING
    return { text: locale === 'ar' ? label.ar : label.en, color: label.color }
  }

  const getPaymentStatusLabel = (paymentStatus: string) => {
    const labels: Record<string, { en: string; ar: string; color: string }> = {
      PENDING: { en: 'Payment Pending', ar: 'بانتظار الدفع', color: 'text-yellow-600' },
      VERIFIED: { en: 'Payment Verified', ar: 'تم التحقق من الدفع', color: 'text-green-600' },
      REJECTED: { en: 'Payment Rejected', ar: 'تم رفض الدفع', color: 'text-red-600' }
    }
    const label = labels[paymentStatus] || labels.PENDING
    return { text: locale === 'ar' ? label.ar : label.en, color: label.color }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">{t('title')}</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {locale === 'ar' ? 'لا توجد فواتير' : 'No invoices yet'}
            </p>
            <Link href="/">
              <button className="btn-primary">
                {locale === 'ar' ? 'تسوق الآن' : 'Start Shopping'}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="bg-primary text-white py-4 px-6 rounded-t-lg grid grid-cols-5 gap-4 font-semibold">
              <div>{t('invoiceNumber')}</div>
              <div className="text-center">{t('date')}</div>
              <div className="text-center">{t('status')}</div>
              <div className="text-center">{t('total')}</div>
              <div className="text-center">{tc('view')}</div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-b-lg shadow-md divide-y divide-gray-200">
              {orders.map((order) => {
                const status = getStatusLabel(order.status)
                const paymentStatus = getPaymentStatusLabel(order.paymentStatus)
                
                return (
                  <div key={order.id} className="grid grid-cols-5 gap-4 p-6 items-center">
                    <div>
                      <p className="font-bold text-primary">{order.invoiceNumber}</p>
                      <p className={`text-sm ${paymentStatus.color}`}>{paymentStatus.text}</p>
                    </div>
                    <div className="text-center text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="text-center font-bold text-primary">
                      {tc('currency')} {order.total.toLocaleString()}.00
                    </div>
                    <div className="text-center">
                      <Link href={`/invoices/${order.id}`}>
                        <button className="btn-primary text-sm px-4">
                          {tc('view')}
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
