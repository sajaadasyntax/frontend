'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { ordersApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Order {
  id: string
  invoiceNumber: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  delivery: number
  discount: number
  loyaltyPointsEarned: number
  loyaltyPointsUsed: number
  couponCode: string | null
  createdAt: string
  user: {
    name: string
    phone: string
    loyaltyPoints: number
  }
}

export default function AdminInvoicesPage() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(statusFilter || 'all')

  useEffect(() => {
    fetchOrders()
  }, [filter, token])

  const fetchOrders = async () => {
    if (!token) return
    
    try {
      const data = await ordersApi.getAll(token, filter !== 'all' ? filter : undefined)
      setOrders(data)
    } catch {
      toast.error('Error loading orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!token) return
    
    try {
      await ordersApi.update(orderId, { status }, token)
      fetchOrders()
      toast.success(isArabic ? 'تم التحديث بنجاح' : 'Updated successfully')
    } catch {
      toast.error(isArabic ? 'خطأ في التحديث' : 'Error updating')
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    if (!token) return
    
    try {
      await ordersApi.update(orderId, { paymentStatus }, token)
      fetchOrders()
      toast.success(isArabic ? 'تم التحديث بنجاح' : 'Updated successfully')
    } catch {
      toast.error(isArabic ? 'خطأ في التحديث' : 'Error updating')
    }
  }

  const statusOptions = [
    { value: 'PENDING', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
    { value: 'CONFIRMED', labelEn: 'Confirmed', labelAr: 'مؤكد' },
    { value: 'PROCESSING', labelEn: 'Processing', labelAr: 'قيد المعالجة' },
    { value: 'SHIPPED', labelEn: 'Shipped', labelAr: 'تم الشحن' },
    { value: 'DELIVERED', labelEn: 'Delivered', labelAr: 'تم التسليم' },
    { value: 'CANCELLED', labelEn: 'Cancelled', labelAr: 'ملغي' }
  ]

  const paymentOptions = [
    { value: 'PENDING', labelEn: 'Pending', labelAr: 'بانتظار الدفع' },
    { value: 'VERIFIED', labelEn: 'Verified', labelAr: 'تم التحقق' },
    { value: 'REJECTED', labelEn: 'Rejected', labelAr: 'مرفوض' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">
        {isArabic ? 'الفواتير' : 'Invoices'}
      </h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {isArabic ? 'الكل' : 'All'}
        </button>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === opt.value ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {isArabic ? opt.labelAr : opt.labelEn}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left p-4">{isArabic ? 'رقم الفاتورة' : 'Invoice #'}</th>
                <th className="text-center p-4">{isArabic ? 'العميل' : 'Customer'}</th>
                <th className="text-center p-4">{isArabic ? 'المبلغ' : 'Amount'}</th>
                <th className="text-center p-4">{isArabic ? 'النقاط' : 'Points'}</th>
                <th className="text-center p-4">{isArabic ? 'حالة الطلب' : 'Order Status'}</th>
                <th className="text-center p-4">{isArabic ? 'حالة الدفع' : 'Payment'}</th>
                <th className="text-center p-4">{isArabic ? 'التاريخ' : 'Date'}</th>
                <th className="text-center p-4">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-semibold text-primary">
                    {order.invoiceNumber}
                    {order.couponCode && (
                      <span className="block text-xs text-green-600 mt-1">
                        🎫 {order.couponCode}
                      </span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    <p>{order.user?.name || '-'}</p>
                    <p className="text-sm text-gray-500">{order.user?.phone}</p>
                  </td>
                  <td className="text-center p-4 font-semibold">
                    SDG {order.total.toLocaleString()}
                    {order.discount > 0 && (
                      <span className="block text-xs text-green-600">
                        -{order.discount.toLocaleString()} {isArabic ? 'خصم' : 'discount'}
                      </span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    <div className="flex flex-col gap-1">
                      {order.loyaltyPointsEarned > 0 && (
                        <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          +{order.loyaltyPointsEarned} ⭐
                        </span>
                      )}
                      {order.loyaltyPointsUsed > 0 && (
                        <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          -{order.loyaltyPointsUsed} ⭐
                        </span>
                      )}
                      {order.loyaltyPointsEarned === 0 && order.loyaltyPointsUsed === 0 && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="select-field text-sm py-1"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isArabic ? opt.labelAr : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center p-4">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                      className={`select-field text-sm py-1 ${
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
                  </td>
                  <td className="text-center p-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-center p-4">
                    <Link href={`/admin/invoices/${order.id}`}>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        {isArabic ? 'عرض' : 'View'}
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              {isArabic ? 'لا توجد فواتير' : 'No invoices found'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
