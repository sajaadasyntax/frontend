'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { productsApi, procurementApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  stock: number
  costPrice: number
}

interface ProcurementItem {
  productId: string
  productName: string
  quantity: number
  costPrice: number
}

export default function ProcurementPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<ProcurementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [supplier, setSupplier] = useState('')
  const [notes, setNotes] = useState('')

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
        costPrice: product.costPrice || 0
      }])
    }
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

  const handleSubmit = async () => {
    if (items.length === 0 || !token) {
      toast.error(isArabic ? 'يرجى إضافة منتجات' : 'Please add products')
      return
    }

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
      setItems([])
      setSupplier('')
      setNotes('')
    } catch {
      toast.error(isArabic ? 'خطأ في إنشاء الطلب' : 'Error creating order')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">
        {isArabic ? 'طلب شراء' : 'Procurement Order'}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Products List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            {isArabic ? 'المنتجات' : 'Products'}
          </h2>

          {loading ? (
            <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-secondary cursor-pointer transition-colors"
                  onClick={() => addItem(product)}
                >
                  <p className="font-semibold text-primary">
                    {isArabic ? product.nameAr : product.nameEn}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isArabic ? 'المخزون:' : 'Stock:'} {product.stock}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isArabic ? 'التكلفة:' : 'Cost:'} SDG {(product.costPrice || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          {items.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              {isArabic ? 'لم تتم إضافة منتجات' : 'No items added'}
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      SDG {item.costPrice.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
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
                className="btn-primary w-full"
              >
                {isArabic ? 'إنشاء طلب الشراء' : 'Create Order'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
