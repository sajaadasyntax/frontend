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

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getAll()
      setProducts(data)
    } catch {
      toast.error('Error loading products')
    } finally {
      setLoading(false)
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

  const filteredProducts = products.filter(p => 
    p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    p.nameAr.includes(search)
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {isArabic ? 'المخزون' : 'Inventory'}
        </h1>
        <Link href="/admin/inventory/add">
          <button className="btn-primary">
            ➕ {isArabic ? 'إضافة منتج' : 'Add Product'}
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={isArabic ? 'البحث عن منتج...' : 'Search products...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left p-4">{isArabic ? 'المنتج' : 'Product'}</th>
                <th className="text-center p-4">{isArabic ? 'الفئة' : 'Category'}</th>
                <th className="text-center p-4">{isArabic ? 'السعر' : 'Price'}</th>
                <th className="text-center p-4">{isArabic ? 'التكلفة' : 'Cost'}</th>
                <th className="text-center p-4">{isArabic ? 'المخزون' : 'Stock'}</th>
                <th className="text-center p-4">{isArabic ? 'نقاط الولاء' : 'Loyalty'}</th>
                <th className="text-center p-4">{isArabic ? 'الحالة' : 'Status'}</th>
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
                  <td className="text-center p-4 text-gray-600">
                    SDG {(product.costPrice || 0).toLocaleString()}
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
                    <div className="flex flex-wrap justify-center gap-1">
                      {product.isNew && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {isArabic ? 'جديد' : 'New'}
                        </span>
                      )}
                      {product.isSale && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                          {product.discount}% {isArabic ? 'خصم' : 'off'}
                        </span>
                      )}
                      {!product.isNew && !product.isSale && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center gap-2">
                      <Link href={`/admin/inventory/${product.id}`}>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          {isArabic ? 'تعديل' : 'Edit'}
                        </button>
                      </Link>
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
      )}
    </div>
  )
}
