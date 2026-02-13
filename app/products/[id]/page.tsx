'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { useLocaleStore } from '@/store/locale-store'
import { productsApi, recipesApi, UPLOADS_URL } from '@/lib/api'
import AddToCartButton from './AddToCartButton'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  longDescriptionEn: string
  longDescriptionAr: string
  price: number
  stock: number
  image: string
  isNew: boolean
  isSale: boolean
  isComingSoon: boolean
  discount: number
  loyaltyPointsEnabled: boolean
  loyaltyPointsValue: number
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const { locale } = useLocaleStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [hasRecipes, setHasRecipes] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview')

  useEffect(() => {
    Promise.all([
      productsApi.getById(params.id),
      recipesApi.checkProductHasRecipes(params.id)
    ])
      .then(([productData, recipesData]) => {
        setProduct(productData)
        setHasRecipes(recipesData.hasRecipes)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const isArabic = locale === 'ar'
  const name = isArabic ? product.nameAr : product.nameEn
  const shortDescription = isArabic ? product.descriptionAr : product.descriptionEn
  const longDescription = isArabic ? product.longDescriptionAr : product.longDescriptionEn
  const currency = isArabic ? 'ج.س' : 'SDG'
  const perUnit = isArabic ? '/ الوحدة' : '/ Unit'
  
  // Calculate display price (with discount if applicable)
  const displayPrice = product.discount && product.discount > 0 
    ? product.price - (product.price * product.discount / 100) 
    : product.price

  const getImageSrc = (image: string) => {
    if (!image) return '/images/product-tube.png'
    if (image.startsWith('/uploads')) return `${UPLOADS_URL}${image}`
    return image
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-14 px-3 md:px-[5%]">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-4 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            {/* Product Image */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative w-full aspect-square">
                  <Image
                    src={getImageSrc(product.image)}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3 md:space-y-5">
              <div>
                <h1 className="text-xl md:text-[30px] font-bold text-primary mb-1">{name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-gray-600 font-semibold text-sm">
                    {currency} {displayPrice.toLocaleString()} {perUnit}
                  </p>
                  {product.discount && product.discount > 0 && (
                    <span className="text-gray-400 line-through text-xs md:text-sm">
                      {currency} {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.discount && product.discount > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                    -{product.discount}% {isArabic ? 'خصم' : 'OFF'}
                  </span>
                )}
              </div>

              <AddToCartButton 
                product={{
                  id: product.id,
                  nameEn: product.nameEn,
                  nameAr: product.nameAr,
                  price: displayPrice,
                  image: product.image || '/images/product-tube.png',
                  stock: product.stock,
                  isComingSoon: product.isComingSoon
                }}
                locale={locale}
              />

              {/* Stock Status */}
              <div className="pt-2 md:pt-4 border-t border-gray-200">
                {product.isComingSoon ? (
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-blue-600">
                      {isArabic ? 'قريباً' : 'Coming Soon'}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                      {isArabic ? 'ترقّب إطلاقه قريبًا' : 'Stay tuned'}
                    </p>
                  </div>
                ) : product.stock > 0 ? (
                  <p className="text-xs md:text-sm font-medium text-green-600">
                    {isArabic ? `متوفر (${product.stock} في المخزون)` : `In Stock (${product.stock} available)`}
                  </p>
                ) : (
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-red-600">
                      {isArabic ? 'غير متوفر الآن' : 'Out of stock'}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                      {isArabic ? 'ترقّب عودته قريبًا' : 'Coming back soon'}
                    </p>
                  </div>
                )}
              </div>

              {/* Recipes Button */}
              {hasRecipes && (
                <div className="pt-2 md:pt-4">
                  <a 
                    href={`/recipes/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <button className="w-full py-2 md:py-3 px-4 md:px-6 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium flex items-center justify-center gap-2 text-sm md:text-base">
                      📋 {isArabic ? 'عرض الوصفات' : 'View Recipes'}
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description Tabs */}
          <div className="mt-6 md:mt-10 border-t border-gray-200 pt-6">
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isArabic ? 'نظرة عامة' : 'Overview'}
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isArabic ? 'التفاصيل الكاملة' : 'Full Details'}
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              {activeTab === 'overview' ? (
                <div>
                  <h3 className="font-bold text-primary mb-2 text-sm md:text-base">
                    {isArabic ? 'وصف المنتج' : 'Product Description'}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {shortDescription || (isArabic 
                      ? 'منتج عالي الجودة للعناية بالبشرة. يساعد على تحسين مظهر البشرة وترطيبها.'
                      : 'High-quality skincare product. Helps improve skin appearance and hydration.'
                    )}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-primary mb-2 text-sm md:text-base">
                    {isArabic ? 'التفاصيل الكاملة' : 'Full Product Details'}
                  </h3>
                  {longDescription ? (
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                      {longDescription}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm md:text-base italic">
                      {isArabic 
                        ? 'لا توجد تفاصيل إضافية متاحة لهذا المنتج.'
                        : 'No additional details available for this product.'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
