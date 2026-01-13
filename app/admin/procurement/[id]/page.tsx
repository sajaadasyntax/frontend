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

export default function ProcurementDetailPage({ params }: { params: { id: string } }) {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [order, setOrder] = useState<ProcurementOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchOrder()
    }
  }, [token, params.id])

  const fetchOrder = async () => {
    try {
      const data = await procurementApi.getById(params.id, token!)
      setOrder(data)
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل الطلب' : 'Error loading order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{isArabic ? 'الطلب غير موجود' : 'Order not found'}</p>
        <Link href="/admin/procurement" className="text-primary hover:underline mt-4 inline-block">
          ← {isArabic ? 'رجوع للمشتريات' : 'Back to Procurement'}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/procurement" className="text-primary hover:underline">
          ← {isArabic ? 'رجوع' : 'Back'}
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          {isArabic ? 'تفاصيل الفاتورة' : 'Invoice Details'}
        </h1>
      </div>

      {/* Invoice Header */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">{isArabic ? 'رقم الفاتورة' : 'Invoice Number'}</p>
            <p className="text-xl md:text-2xl font-bold text-primary">{order.invoiceNumber}</p>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-gray-600 mb-1">{isArabic ? 'التاريخ' : 'Date'}</p>
            <p className="text-lg font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {order.supplier && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{isArabic ? 'المورد' : 'Supplier'}</p>
            <p className="font-semibold text-primary">{order.supplier}</p>
          </div>
        )}
        
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{isArabic ? 'ملاحظات' : 'Notes'}</p>
            <p className="text-gray-700">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
        <h2 className="font-bold text-primary text-lg md:text-xl mb-4">{isArabic ? 'المنتجات' : 'Items'}</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">{isArabic ? 'المنتج' : 'Product'}</th>
                <th className="text-center p-3">{isArabic ? 'الكمية' : 'Quantity'}</th>
                <th className="text-center p-3">{isArabic ? 'سعر الوحدة' : 'Unit Cost'}</th>
                <th className="text-right p-3">{isArabic ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-primary">
                    {isArabic ? item.product.nameAr : item.product.nameEn}
                  </td>
                  <td className="text-center p-3">{item.quantity}</td>
                  <td className="text-center p-3">SDG {item.costPrice.toLocaleString()}</td>
                  <td className="text-right p-3 font-semibold">
                    SDG {(item.quantity * item.costPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <div className="flex justify-between items-center text-lg md:text-xl">
          <span className="font-bold text-primary">{isArabic ? 'المجموع الكلي' : 'Total Amount'}</span>
          <span className="font-bold text-primary">SDG {order.totalCost.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

