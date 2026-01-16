'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { productsApi, UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  price: number
  costPrice: number
  stock: number
  image: string
  loyaltyPointsEnabled: boolean
  loyaltyPointsValue: number
  isNew: boolean
  isSale: boolean
  discount: number
  isArchived: boolean
  category: {
    nameEn: string
    nameAr: string
  }
}

export default function InventoryPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Admin always fetches all products including archived
      const data = await productsApi.getAll({ includeArchived: 'true' })
      setProducts(data)
    } catch {
      toast.error('Error loading products')
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveToggle = async (product: Product) => {
    if (!token) return

    try {
      await productsApi.update(product.id, { isArchived: !product.isArchived }, token)
      setProducts(products.map(p => p.id === product.id ? { ...p, isArchived: !product.isArchived } : p))
      toast.success(
        product.isArchived 
          ? (isArabic ? 'تم إلغاء الأرشفة' : 'Product unarchived')
          : (isArabic ? 'تم أرشفة المنتج' : 'Product archived')
      )
    } catch {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return
    if (!token) return

    try {
      await productsApi.delete(id, token)
      setProducts(products.filter(p => p.id !== id))
      toast.success(isArabic ? 'تم الحذف بنجاح' : 'Deleted successfully')
    } catch {
      toast.error(isArabic ? 'خطأ في الحذف' : 'Error deleting')
    }
  }

  const getImageSrc = (image: string) => {
    if (!image) return '/images/product-tube.png'
    if (image.startsWith('/uploads')) return `${UPLOADS_URL}${image}`
    return image
  }

  const filteredProducts = products
    .filter(p => showArchived ? p.isArchived : !p.isArchived)
    .filter(p => 
    p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    p.nameAr.includes(search)
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-primary">
          {isArabic ? 'المخزون' : 'Inventory'}
        </h1>
        <Link href="/admin/inventory/add">
          <button className="btn-primary w-full md:w-auto text-sm md:text-base">
            ➕ {isArabic ? 'إضافة منتج' : 'Add Product'}
          </button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={isArabic ? 'البحث عن منتج...' : 'Search products...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full sm:max-w-md"
        />
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
            showArchived 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📦 {showArchived 
            ? (isArabic ? 'المؤرشفة' : 'Archived')
            : (isArabic ? 'عرض المؤرشفة' : 'Show Archived')
          }
          {showArchived && ` (${products.filter(p => p.isArchived).length})`}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[700px]">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left p-4">{isArabic ? 'المنتج' : 'Product'}</th>
                <th className="text-center p-4">{isArabic ? 'الفئة' : 'Category'}</th>
                <th className="text-center p-4">{isArabic ? 'السعر' : 'Price'}</th>
                <th className="text-center p-4">{isArabic ? 'المخزون' : 'Stock'}</th>
                <th className="text-center p-4">{isArabic ? 'نقاط الولاء' : 'Loyalty'}</th>
                <th className="text-center p-4">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={getImageSrc(product.image)}
                        alt={product.nameEn}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-primary">
                          {isArabic ? product.nameAr : product.nameEn}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center p-4 text-gray-600">
                    {product.category ? (isArabic ? product.category.nameAr : product.category.nameEn) : '-'}
                  </td>
                  <td className="text-center p-4 font-semibold">
                    SDG {product.price.toLocaleString()}
                  </td>
                  <td className="text-center p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product.stock < 10 
                        ? 'bg-red-100 text-red-800' 
                        : product.stock < 50 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="text-center p-4">
                    {product.loyaltyPointsEnabled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        ⭐ {product.loyaltyPointsValue}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center gap-2">
                      <Link href={`/admin/inventory/${product.id}`}>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          {isArabic ? 'تعديل' : 'Edit'}
                        </button>
                      </Link>
                      <button
                        onClick={() => handleArchiveToggle(product)}
                        className={`px-3 py-1 rounded hover:opacity-80 ${
                          product.isArchived 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}
                        title={product.isArchived 
                          ? (isArabic ? 'إلغاء الأرشفة' : 'Unarchive')
                          : (isArabic ? 'أرشفة' : 'Archive')
                        }
                      >
                        {product.isArchived ? '↩️' : '📦'}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        {isArabic ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              {isArabic ? 'لا توجد منتجات' : 'No products found'}
            </p>
          )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Image
                    src={getImageSrc(product.image)}
                    alt={product.nameEn}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-base">
                      {isArabic ? product.nameAr : product.nameEn}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.category ? (isArabic ? product.category.nameAr : product.category.nameEn) : '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">{isArabic ? 'السعر:' : 'Price:'}</span>
                    <p className="font-semibold">SDG {product.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{isArabic ? 'المخزون:' : 'Stock:'}</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      product.stock < 10 
                        ? 'bg-red-100 text-red-800' 
                        : product.stock < 50 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock}
                    </span>
                  </div>
                </div>

                {product.loyaltyPointsEnabled && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                      ⭐ {product.loyaltyPointsValue} {isArabic ? 'نقطة' : 'points'}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Link href={`/admin/inventory/${product.id}`} className="flex-1">
                    <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                  </Link>
                  <button
                    onClick={() => handleArchiveToggle(product)}
                    className={`px-3 py-2 rounded text-sm ${
                      product.isArchived 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {product.isArchived ? '↩️' : '📦'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-600 py-8">
                {isArabic ? 'لا توجد منتجات' : 'No products found'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
