'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { procurementApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface ProcurementOrder {
  id: string
  invoiceNumber: string
  poNumber: number
  supplier: string
  notes: string
  totalCost: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    costPrice: number
    product: {
      nameEn: string
      nameAr: string
    }
  }>
}

export default function ProcurementPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [orders, setOrders] = useState<ProcurementOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [token])

  const fetchOrders = async () => {
    if (!token) return
    try {
      const data = await procurementApi.getAll(token)
      setOrders(data)
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل الطلبات' : 'Error loading orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          {isArabic ? 'المشتريات' : 'Procurement'}
        </h1>
        <Link href="/admin/procurement/new">
          <button className="btn-primary">
            ➕ {isArabic ? 'طلب شراء جديد' : 'New Procurement Order'}
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">
            {isArabic ? 'لا توجد طلبات شراء حتى الآن' : 'No procurement orders yet'}
          </p>
          <Link href="/admin/procurement/new">
            <button className="btn-primary">
              {isArabic ? 'إنشاء أول طلب شراء' : 'Create First Procurement Order'}
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left p-4">{isArabic ? 'رقم طلب الشراء' : 'PO Number'}</th>
                  <th className="text-center p-4">{isArabic ? 'المورد' : 'Supplier'}</th>
                  <th className="text-center p-4">{isArabic ? 'عدد المنتجات' : 'Items'}</th>
                  <th className="text-center p-4">{isArabic ? 'المبلغ' : 'Amount'}</th>
                  <th className="text-center p-4">{isArabic ? 'التاريخ' : 'Date'}</th>
                  <th className="text-center p-4">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-primary">
                      PO-{order.poNumber}
                    </td>
                    <td className="text-center p-4">
                      {order.supplier || '-'}
                    </td>
                    <td className="text-center p-4">
                      {order.items?.length || 0}
                    </td>
                    <td className="text-center p-4 font-semibold">
                      SDG {order.totalCost.toLocaleString()}
                    </td>
                    <td className="text-center p-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center p-4">
                      <Link href={`/admin/procurement/${order.id}`}>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                          {isArabic ? 'عرض' : 'View'}
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-primary text-lg">PO-{order.poNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/admin/procurement/${order.id}`}>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {isArabic ? 'عرض' : 'View'}
                    </button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">{isArabic ? 'المورد:' : 'Supplier:'}</span>
                    <p className="font-medium">{order.supplier || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{isArabic ? 'المنتجات:' : 'Items:'}</span>
                    <p className="font-medium">{order.items?.length || 0}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">{isArabic ? 'المبلغ:' : 'Amount:'}</span>
                    <p className="font-semibold text-lg">SDG {order.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
