'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { productsApi, categoriesApi, UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'

interface Category {
  id: string
  nameEn: string
  nameAr: string
  parentId: string | null
  parent?: Category | null
  children?: Category[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    price: '',
    costPrice: '',
    categoryId: '',
    image: '',
    isNew: false,
    isSale: false,
    discount: '',
    loyaltyPointsEnabled: false,
    loyaltyPointsValue: ''
  })

  // Helper to build category display name with parent info
  const getCategoryDisplayName = (cat: Category): string => {
    const name = isArabic ? cat.nameAr : cat.nameEn
    if (cat.parent) {
      const parentName = isArabic ? cat.parent.nameAr : cat.parent.nameEn
      return `${parentName} → ${name}`
    }
    return name
  }

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(true), // Get flat list with parent info
      productsApi.getById(productId)
    ]).then(([cats, product]) => {
      setCategories(cats)
      setFormData({
        nameEn: product.nameEn || '',
        nameAr: product.nameAr || '',
        descriptionEn: product.descriptionEn || '',
        descriptionAr: product.descriptionAr || '',
        price: product.price?.toString() || '',
        costPrice: product.costPrice?.toString() || '',
        categoryId: product.categoryId || '',
        image: product.image || '',
        isNew: product.isNew || false,
        isSale: product.isSale || false,
        discount: product.discount?.toString() || '',
        loyaltyPointsEnabled: product.loyaltyPointsEnabled || false,
        loyaltyPointsValue: product.loyaltyPointsValue?.toString() || '0'
      })
      if (product.image) {
        setImagePreview(product.image.startsWith('/uploads') ? `${UPLOADS_URL}${product.image}` : product.image)
      }
    }).catch(() => {
      toast.error(isArabic ? 'خطأ في تحميل المنتج' : 'Error loading product')
    }).finally(() => {
      setLoading(false)
    })
  }, [productId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setSaving(true)

    try {
      const data = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' || !imageFile) {
          data.append(key, String(value))
        }
      })
      
      // Add image file if selected
      if (imageFile) {
        data.append('image', imageFile)
      }

      await productsApi.update(productId, data, token, true)
      toast.success(isArabic ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
      router.push('/admin/inventory')
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ في تحديث المنتج' : 'Error updating product'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">
        {isArabic ? 'تعديل المنتج' : 'Edit Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-3xl">
        {/* Stock Note */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 {isArabic 
              ? 'ملاحظة: المخزون يدار عبر صفحة المشتريات. لتعديل كمية المخزون، استخدم صفحة المشتريات.'
              : 'Note: Stock is managed via the Procurement page. To update inventory quantity, use the Procurement page.'
            }
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isArabic ? 'صورة المنتج' : 'Product Image'}
            </label>
            <div className="flex items-start gap-6">
              <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-400 text-4xl">📷</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {isArabic ? 'PNG, JPG, WEBP حتى 5MB' : 'PNG, JPG, WEBP up to 5MB'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'} *
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'} *
            </label>
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              className="input-field"
              dir="rtl"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
            </label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              className="input-field h-24"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
            </label>
            <textarea
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              className="input-field h-24"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'السعر (SDG)' : 'Price (SDG)'} *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input-field"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'سعر التكلفة (SDG)' : 'Cost Price (SDG)'}
            </label>
            <input
              type="number"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="input-field"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'الفئة' : 'Category'} *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="select-field"
              required
            >
              <option value="">{isArabic ? 'اختر الفئة' : 'Select Category'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent ? '└ ' : ''}{getCategoryDisplayName(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Loyalty Points Section */}
          <div className="md:col-span-2 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-3">
              ⭐ {isArabic ? 'نقاط الولاء' : 'Loyalty Points'}
            </h3>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.loyaltyPointsEnabled}
                  onChange={(e) => setFormData({ ...formData, loyaltyPointsEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-amber-900">
                  {isArabic ? 'تفعيل نقاط الولاء لهذا المنتج' : 'Enable loyalty points for this product'}
                </span>
              </label>

              {formData.loyaltyPointsEnabled && (
                <div className="flex items-center gap-2">
                  <label className="text-amber-900">
                    {isArabic ? 'النقاط المكتسبة:' : 'Points earned:'}
                  </label>
                  <input
                    type="number"
                    value={formData.loyaltyPointsValue}
                    onChange={(e) => setFormData({ ...formData, loyaltyPointsValue: e.target.value })}
                    className="input-field w-24"
                    min="0"
                  />
                  <span className="text-amber-700 text-sm">
                    {isArabic ? 'لكل وحدة' : 'per unit'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4"
              />
              <span>{isArabic ? 'منتج جديد' : 'New Product'}</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isSale}
                onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                className="w-4 h-4"
              />
              <span>{isArabic ? 'عرض خاص' : 'On Sale'}</span>
            </label>
          </div>

          {formData.isSale && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'نسبة الخصم %' : 'Discount %'}
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="input-field"
                min="0"
                max="100"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving 
              ? (isArabic ? 'جاري الحفظ...' : 'Saving...') 
              : (isArabic ? 'حفظ التغييرات' : 'Save Changes')
            }
          </button>
        </div>
      </form>
    </div>
  )
}

