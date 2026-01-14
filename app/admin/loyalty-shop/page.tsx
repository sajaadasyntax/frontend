'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { loyaltyShopApi, UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  price: number
  image: string | null
  category: { nameEn: string; nameAr: string }
}

interface LoyaltyProduct {
  id: string
  productId: string
  pointsRequired: number
  stockLimit: number | null
  stockUsed: number
  isActive: boolean
  product: Product
}

interface Redemption {
  id: string
  pointsSpent: number
  quantity: number
  status: string
  country: string | null
  state: string | null
  address: string | null
  createdAt: string
  user: {
    id: string
    name: string
    phone: string
    email: string
  }
  loyaltyProduct: {
    product: {
      nameEn: string
      nameAr: string
      image: string | null
    }
  }
}

interface LoyaltySettings {
  minPointsToUnlock: number
  pointsPerCurrency: number
}

export default function AdminLoyaltyShopPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [activeTab, setActiveTab] = useState<'products' | 'redemptions' | 'settings'>('products')
  const [loading, setLoading] = useState(true)
  
  // Products state
  const [loyaltyProducts, setLoyaltyProducts] = useState<LoyaltyProduct[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<LoyaltyProduct | null>(null)
  
  // Redemptions state
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  // Settings state
  const [settings, setSettings] = useState<LoyaltySettings>({ minPointsToUnlock: 500, pointsPerCurrency: 1 })
  const [savingSettings, setSavingSettings] = useState(false)

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    productId: '',
    pointsRequired: 100,
    stockLimit: null as number | null,
    isActive: true
  })

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  const fetchData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [productsData, availableData, settingsData] = await Promise.all([
        loyaltyShopApi.getProducts(token),
        loyaltyShopApi.getAvailableProducts(token),
        loyaltyShopApi.getSettings()
      ])
      setLoyaltyProducts(productsData)
      setAvailableProducts(availableData)
      setSettings(settingsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(isArabic ? 'خطأ في تحميل البيانات' : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRedemptions = async () => {
    if (!token) return
    try {
      const data = await loyaltyShopApi.getAllRedemptions(token, statusFilter || undefined)
      setRedemptions(data)
    } catch (error) {
      console.error('Error fetching redemptions:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'redemptions' && token) {
      fetchRedemptions()
    }
  }, [activeTab, statusFilter, token])

  const handleAddProduct = async () => {
    if (!token || !formData.productId) return

    try {
      await loyaltyShopApi.addProduct({
        productId: formData.productId,
        pointsRequired: formData.pointsRequired,
        stockLimit: formData.stockLimit || undefined,
        isActive: formData.isActive
      }, token)

      toast.success(isArabic ? 'تم إضافة المنتج بنجاح' : 'Product added successfully')
      setShowAddModal(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ في إضافة المنتج' : 'Error adding product'))
    }
  }

  const handleUpdateProduct = async () => {
    if (!token || !editingProduct) return

    try {
      await loyaltyShopApi.updateProduct(editingProduct.id, {
        pointsRequired: formData.pointsRequired,
        stockLimit: formData.stockLimit,
        isActive: formData.isActive
      }, token)

      toast.success(isArabic ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
      setEditingProduct(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ في تحديث المنتج' : 'Error updating product'))
    }
  }

  const handleRemoveProduct = async (id: string) => {
    if (!token) return
    if (!confirm(isArabic ? 'هل أنت متأكد من إزالة هذا المنتج؟' : 'Are you sure you want to remove this product?')) return

    try {
      await loyaltyShopApi.removeProduct(id, token)
      toast.success(isArabic ? 'تم إزالة المنتج' : 'Product removed')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ في إزالة المنتج' : 'Error removing product'))
    }
  }

  const handleUpdateRedemptionStatus = async (id: string, newStatus: string) => {
    if (!token) return

    try {
      await loyaltyShopApi.updateRedemptionStatus(id, newStatus, token)
      toast.success(isArabic ? 'تم تحديث الحالة' : 'Status updated')
      fetchRedemptions()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ في تحديث الحالة' : 'Error updating status'))
    }
  }

  const handleSaveSettings = async () => {
    if (!token) return
    setSavingSettings(true)

    try {
      await loyaltyShopApi.updateSettings(settings, token)
      toast.success(isArabic ? 'تم حفظ الإعدادات' : 'Settings saved')
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ في حفظ الإعدادات' : 'Error saving settings'))
    } finally {
      setSavingSettings(false)
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      pointsRequired: 100,
      stockLimit: null,
      isActive: true
    })
  }

  const openEditModal = (lp: LoyaltyProduct) => {
    setEditingProduct(lp)
    setFormData({
      productId: lp.productId,
      pointsRequired: lp.pointsRequired,
      stockLimit: lp.stockLimit,
      isActive: lp.isActive
    })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">
        🎁 {isArabic ? 'متجر الولاء' : 'Loyalty Shop'}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeTab === 'products' 
              ? 'text-primary border-primary' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          {isArabic ? 'المنتجات' : 'Products'}
        </button>
        <button
          onClick={() => setActiveTab('redemptions')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeTab === 'redemptions' 
              ? 'text-primary border-primary' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          {isArabic ? 'طلبات الاستبدال' : 'Redemptions'}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeTab === 'settings' 
              ? 'text-primary border-primary' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          {isArabic ? 'الإعدادات' : 'Settings'}
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isArabic ? 'منتجات متجر الولاء' : 'Loyalty Shop Products'}
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              + {isArabic ? 'إضافة منتج' : 'Add Product'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left p-4">{isArabic ? 'المنتج' : 'Product'}</th>
                  <th className="text-center p-4">{isArabic ? 'النقاط المطلوبة' : 'Points Required'}</th>
                  <th className="text-center p-4">{isArabic ? 'المخزون' : 'Stock'}</th>
                  <th className="text-center p-4">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="text-center p-4">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loyaltyProducts.map((lp) => (
                  <tr key={lp.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {lp.product.image ? (
                            <Image
                              src={`${UPLOADS_URL}${lp.product.image}`}
                              alt=""
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-primary">
                            {isArabic ? lp.product.nameAr : lp.product.nameEn}
                          </p>
                          <p className="text-sm text-gray-500">
                            {lp.product.price.toLocaleString()} {isArabic ? 'ج.س' : 'SDG'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <span className="font-bold text-amber-600">⭐ {lp.pointsRequired.toLocaleString()}</span>
                    </td>
                    <td className="text-center p-4">
                      {lp.stockLimit ? (
                        <span className={lp.stockLimit - lp.stockUsed <= 5 ? 'text-orange-600' : ''}>
                          {lp.stockUsed} / {lp.stockLimit}
                        </span>
                      ) : (
                        <span className="text-gray-400">{isArabic ? 'غير محدود' : 'Unlimited'}</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        lp.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {lp.isActive 
                          ? (isArabic ? 'نشط' : 'Active')
                          : (isArabic ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="text-center p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(lp)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {isArabic ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleRemoveProduct(lp.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          {isArabic ? 'إزالة' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {loyaltyProducts.length === 0 && (
              <p className="text-center text-gray-600 py-8">
                {isArabic ? 'لا توجد منتجات في متجر الولاء' : 'No products in the loyalty shop'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Redemptions Tab */}
      {activeTab === 'redemptions' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isArabic ? 'طلبات استبدال النقاط' : 'Redemption Orders'}
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
              <option value="shipped">{isArabic ? 'تم الشحن' : 'Shipped'}</option>
              <option value="delivered">{isArabic ? 'تم التسليم' : 'Delivered'}</option>
              <option value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left p-4">{isArabic ? 'المنتج' : 'Product'}</th>
                  <th className="text-left p-4">{isArabic ? 'العميل' : 'Customer'}</th>
                  <th className="text-center p-4">{isArabic ? 'النقاط' : 'Points'}</th>
                  <th className="text-left p-4">{isArabic ? 'العنوان' : 'Address'}</th>
                  <th className="text-center p-4">{isArabic ? 'التاريخ' : 'Date'}</th>
                  <th className="text-center p-4">{isArabic ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {r.loyaltyProduct.product.image ? (
                            <Image
                              src={`${UPLOADS_URL}${r.loyaltyProduct.product.image}`}
                              alt=""
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">🎁</div>
                          )}
                        </div>
                        <span className="font-medium">
                          {isArabic ? r.loyaltyProduct.product.nameAr : r.loyaltyProduct.product.nameEn}
                          {r.quantity > 1 && <span className="text-gray-500"> × {r.quantity}</span>}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-primary">{r.user.name || '-'}</p>
                      <p className="text-sm text-gray-500">{r.user.phone}</p>
                    </td>
                    <td className="text-center p-4">
                      <span className="font-bold text-amber-600">⭐ {r.pointsSpent}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs">
                      {r.country && `${r.country}, `}
                      {r.state && `${r.state}, `}
                      {r.address || '-'}
                    </td>
                    <td className="text-center p-4 text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString(isArabic ? 'ar-SD' : 'en-US')}
                    </td>
                    <td className="text-center p-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleUpdateRedemptionStatus(r.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(r.status)}`}
                      >
                        <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                        <option value="shipped">{isArabic ? 'تم الشحن' : 'Shipped'}</option>
                        <option value="delivered">{isArabic ? 'تم التسليم' : 'Delivered'}</option>
                        <option value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {redemptions.length === 0 && (
              <p className="text-center text-gray-600 py-8">
                {isArabic ? 'لا توجد طلبات استبدال' : 'No redemption orders'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-xl">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">
              {isArabic ? 'إعدادات متجر الولاء' : 'Loyalty Shop Settings'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الحد الأدنى للنقاط لفتح المتجر' : 'Minimum Points to Unlock Shop'}
                </label>
                <input
                  type="number"
                  value={settings.minPointsToUnlock}
                  onChange={(e) => setSettings({ ...settings, minPointsToUnlock: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isArabic 
                    ? 'العملاء الذين لديهم نقاط أقل من هذا الحد لن يتمكنوا من رؤية متجر الولاء'
                    : 'Customers with points below this threshold will not be able to see the loyalty shop'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'قيمة النقطة الواحدة (ج.س)' : 'Points per Currency (SDG)'}
                </label>
                <input
                  type="number"
                  value={settings.pointsPerCurrency}
                  onChange={(e) => setSettings({ ...settings, pointsPerCurrency: parseFloat(e.target.value) || 1 })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  min="0.01"
                  step="0.01"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isArabic 
                    ? 'كم نقطة تساوي جنيه سوداني واحد (للعرض فقط)'
                    : 'How many points equal one SDG (for display purposes)'}
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {savingSettings 
                  ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                  : (isArabic ? 'حفظ الإعدادات' : 'Save Settings')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'إضافة منتج لمتجر الولاء' : 'Add Product to Loyalty Shop'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'اختر المنتج' : 'Select Product'}
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="">{isArabic ? '-- اختر منتج --' : '-- Select Product --'}</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isArabic ? p.nameAr : p.nameEn} ({p.price.toLocaleString()} {isArabic ? 'ج.س' : 'SDG'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'النقاط المطلوبة' : 'Points Required'}
                </label>
                <input
                  type="number"
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'حد المخزون (اختياري)' : 'Stock Limit (Optional)'}
                </label>
                <input
                  type="number"
                  value={formData.stockLimit || ''}
                  onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder={isArabic ? 'اتركه فارغاً لمخزون غير محدود' : 'Leave empty for unlimited'}
                  min="1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  {isArabic ? 'نشط' : 'Active'}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); resetForm() }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleAddProduct}
                disabled={!formData.productId}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isArabic ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'تعديل منتج الولاء' : 'Edit Loyalty Product'}
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                {editingProduct.product.image ? (
                  <Image
                    src={`${UPLOADS_URL}${editingProduct.product.image}`}
                    alt=""
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                )}
              </div>
              <p className="font-semibold">
                {isArabic ? editingProduct.product.nameAr : editingProduct.product.nameEn}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'النقاط المطلوبة' : 'Points Required'}
                </label>
                <input
                  type="number"
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'حد المخزون' : 'Stock Limit'}
                </label>
                <input
                  type="number"
                  value={formData.stockLimit || ''}
                  onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder={isArabic ? 'اتركه فارغاً لمخزون غير محدود' : 'Leave empty for unlimited'}
                  min="1"
                />
                {editingProduct.stockUsed > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {isArabic ? `تم استبدال ${editingProduct.stockUsed} وحدة` : `${editingProduct.stockUsed} units redeemed`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">
                  {isArabic ? 'نشط' : 'Active'}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setEditingProduct(null); resetForm() }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleUpdateProduct}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                {isArabic ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

