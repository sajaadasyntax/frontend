'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { couponsApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
  minPurchase: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
}

export default function CouponsPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxUses: '',
    expiresAt: ''
  })

  useEffect(() => {
    if (!token) return
    fetchCoupons()
  }, [token])

  const fetchCoupons = async () => {
    if (!token) return
    
    try {
      const data = await couponsApi.getAll(token)
      setCoupons(data)
    } catch {
      toast.error('Error loading coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      await couponsApi.create(formData, token)
      toast.success(isArabic ? 'تم إضافة الكود بنجاح' : 'Coupon added successfully')
      setShowForm(false)
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
        maxUses: '',
        expiresAt: ''
      })
      fetchCoupons()
    } catch {
      toast.error(isArabic ? 'خطأ في إضافة الكود' : 'Error adding coupon')
    }
  }

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    if (!token) return

    try {
      await couponsApi.update(couponId, { isActive: !currentStatus }, token)
      toast.success(isArabic ? 'تم تحديث الحالة' : 'Status updated')
      fetchCoupons()
    } catch {
      toast.error(isArabic ? 'خطأ في التحديث' : 'Error updating')
    }
  }

  const handleDelete = async (couponId: string) => {
    if (!token) return
    if (!confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return

    try {
      await couponsApi.delete(couponId, token)
      toast.success(isArabic ? 'تم حذف الكود' : 'Coupon deleted')
      fetchCoupons()
    } catch {
      toast.error(isArabic ? 'خطأ في الحذف' : 'Error deleting')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {isArabic ? 'أكواد الخصم' : 'Discount Codes'}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          ➕ {isArabic ? 'إضافة كود' : 'Add Coupon'}
        </button>
      </div>

      {/* Add Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'إضافة كود خصم جديد' : 'Add New Coupon'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الكود' : 'Code'}
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="SAVE10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'نوع الخصم' : 'Discount Type'}
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="select-field"
                  >
                    <option value="percentage">{isArabic ? 'نسبة مئوية' : 'Percentage'}</option>
                    <option value="fixed">{isArabic ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'القيمة' : 'Value'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="input-field"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الحد الأدنى للشراء' : 'Min. Purchase'}
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الحد الأقصى للاستخدام' : 'Max Uses'}
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'تاريخ الانتهاء' : 'Expires At'}
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {isArabic ? 'إضافة' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left p-4">{isArabic ? 'الكود' : 'Code'}</th>
                <th className="text-center p-4">{isArabic ? 'الخصم' : 'Discount'}</th>
                <th className="text-center p-4">{isArabic ? 'الحد الأدنى' : 'Min. Purchase'}</th>
                <th className="text-center p-4">{isArabic ? 'الاستخدام' : 'Usage'}</th>
                <th className="text-center p-4">{isArabic ? 'الانتهاء' : 'Expires'}</th>
                <th className="text-center p-4">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="text-center p-4">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-primary">{coupon.code}</td>
                  <td className="text-center p-4">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}%` 
                      : `SDG ${coupon.discountValue}`
                    }
                  </td>
                  <td className="text-center p-4">
                    {coupon.minPurchase ? `SDG ${coupon.minPurchase.toLocaleString()}` : '-'}
                  </td>
                  <td className="text-center p-4">
                    {coupon.usedCount} / {coupon.maxUses || '∞'}
                  </td>
                  <td className="text-center p-4 text-gray-600">
                    {coupon.expiresAt 
                      ? new Date(coupon.expiresAt).toLocaleDateString()
                      : isArabic ? 'بدون انتهاء' : 'No expiry'
                    }
                  </td>
                  <td className="text-center p-4">
                    <button
                      onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                        coupon.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {coupon.isActive 
                        ? (isArabic ? 'نشط' : 'Active')
                        : (isArabic ? 'غير نشط' : 'Inactive')
                      }
                    </button>
                  </td>
                  <td className="text-center p-4">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {coupons.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              {isArabic ? 'لا توجد أكواد خصم' : 'No coupons found'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
