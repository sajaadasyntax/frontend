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
  price: number
  stock: number
  image: string
  isNew: boolean
  isSale: boolean
  discount: number
  loyaltyPointsEnabled: boolean
  loyaltyPointsValue: number
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const { locale } = useLocaleStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [hasRecipes, setHasRecipes] = useState(false)
  const [loading, setLoading] = useState(true)

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
  const description = isArabic ? product.descriptionAr : product.descriptionEn
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
              <div className="product-card p-4 md:p-5">
                <div className="flex justify-center items-center h-48 md:h-72">
                  <Image
                    src={getImageSrc(product.image)}
                    alt={name}
                    width={140}
                    height={210}
                    className="object-contain w-28 h-40 md:w-[140px] md:h-[210px]"
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
                  image: product.image || '/images/product-tube.png'
                }}
                locale={locale}
              />

              {/* Description */}
              <div>
                <h3 className="font-bold text-primary mb-1 md:mb-2 text-sm">
                  {isArabic ? 'الوصف:' : 'Description:'}
                </h3>
                <p className="text-gray-600 text-xs md:text-[13px] leading-relaxed">
                  {description || (isArabic 
                    ? 'منتج عالي الجودة للعناية بالبشرة. يساعد على تحسين مظهر البشرة وترطيبها.'
                    : 'High-quality skincare product. Helps improve skin appearance and hydration.'
                  )}
                </p>
              </div>

              {/* Loyalty Points Badge */}
              {product.loyaltyPointsEnabled && product.loyaltyPointsValue > 0 && (
                <div className="bg-amber-50 p-2 md:p-3 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl md:text-2xl">⭐</span>
                    <div>
                      <p className="font-semibold text-amber-800 text-sm md:text-base">
                        {isArabic 
                          ? `اكسب ${product.loyaltyPointsValue} نقطة` 
                          : `Earn ${product.loyaltyPointsValue} points`
                        }
                      </p>
                      <p className="text-[10px] md:text-xs text-amber-700">
                        {isArabic 
                          ? 'عند شراء هذا المنتج' 
                          : 'When you purchase this product'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="pt-2 md:pt-4 border-t border-gray-200">
                <p className={`text-xs md:text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 
                    ? (isArabic ? `متوفر (${product.stock} في المخزون)` : `In Stock (${product.stock} available)`)
                    : (isArabic ? 'غير متوفر' : 'Out of Stock')
                  }
                </p>
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
        </div>
      </div>
    </div>
  )
}
