'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { productsApi, procurementApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  stock: number
}

interface ProcurementItem {
  productId: string
  productName: string
  quantity: number
  costPrice: number
}

export default function NewProcurementPage() {
  const router = useRouter()
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<ProcurementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [notes, setNotes] = useState('')
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

  const addItem = (product: Product) => {
    const exists = items.find(i => i.productId === product.id)
    if (exists) {
      setItems(items.map(i => 
        i.productId === product.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ))
    } else {
      setItems([...items, {
        productId: product.id,
        productName: isArabic ? product.nameAr : product.nameEn,
        quantity: 1,
        costPrice: 0
      }])
    }
  }

  const updateCostPrice = (productId: string, costPrice: number) => {
    setItems(items.map(i => 
      i.productId === productId ? { ...i, costPrice } : i
    ))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter(i => i.productId !== productId))
    } else {
      setItems(items.map(i => 
        i.productId === productId ? { ...i, quantity } : i
      ))
    }
  }

  const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)

  const filteredProducts = products.filter(p => 
    p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    p.nameAr.includes(search)
  )

  const handleSubmit = async () => {
    if (items.length === 0 || !token) {
      toast.error(isArabic ? 'يرجى إضافة منتجات' : 'Please add products')
      return
    }

    setSubmitting(true)
    try {
      await procurementApi.create({
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice
        })),
        supplier,
        notes,
        totalCost
      }, token)

      toast.success(isArabic ? 'تم إنشاء طلب الشراء بنجاح' : 'Procurement order created')
      router.push('/admin/procurement')
    } catch {
      toast.error(isArabic ? 'خطأ في إنشاء الطلب' : 'Error creating order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/procurement" className="text-primary hover:underline">
          ← {isArabic ? 'رجوع' : 'Back'}
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          {isArabic ? 'طلب شراء جديد' : 'New Procurement Order'}
        </h1>
      </div>

      {/* Info Note */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 {isArabic 
            ? 'أدخل سعر التكلفة لكل منتج في هذه الدفعة. سعر التكلفة يمكن أن يختلف بين الدفعات المختلفة.'
            : 'Enter the cost price for each product in this batch. Cost price can vary between different procurement batches.'
          }
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Products List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-primary mb-4">
            {isArabic ? 'المنتجات' : 'Products'}
          </h2>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={isArabic ? 'البحث عن منتج...' : 'Search products...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>

          {loading ? (
            <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-[400px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-secondary cursor-pointer transition-colors"
                  onClick={() => addItem(product)}
                >
                  <p className="font-semibold text-primary text-sm md:text-base">
                    {isArabic ? product.nameAr : product.nameEn}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    {isArabic ? 'المخزون الحالي:' : 'Current Stock:'} {product.stock}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-primary mb-4">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          {items.length === 0 ? (
            <p className="text-gray-600 text-center py-8 text-sm">
              {isArabic ? 'اضغط على منتج لإضافته' : 'Click a product to add it'}
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="pb-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <button
                      onClick={() => updateQuantity(item.productId, 0)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Cost Price Input */}
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      {isArabic ? 'سعر التكلفة (SDG)' : 'Cost Price (SDG)'}
                    </label>
                    <input
                      type="number"
                      value={item.costPrice || ''}
                      onChange={(e) => updateCostPrice(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {isArabic ? 'الكمية:' : 'Quantity:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Line Total */}
                  <p className="text-sm text-gray-600 mt-2 text-right">
                    {isArabic ? 'الإجمالي:' : 'Total:'} SDG {(item.costPrice * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="pt-4">
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                  <span>SDG {totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'المورد' : 'Supplier'}
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field h-20"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting
                  ? (isArabic ? 'جاري الإنشاء...' : 'Creating...')
                  : (isArabic ? 'إنشاء طلب الشراء' : 'Create Order')
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

