'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { useLocaleStore } from '@/store/locale-store'
import { productsApi, UPLOADS_URL } from '@/lib/api'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getById(params.id)
      .then(data => {
        setProduct(data)
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
  const perPack = isArabic ? '/ العبوة' : '/ Pack'

  const getImageSrc = (image: string) => {
    if (!image) return '/images/product-tube.png'
    if (image.startsWith('/uploads')) return `${UPLOADS_URL}${image}`
    return image
  }

  return (
    <div className="min-h-screen bg-gray-50 py-14" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-10">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Product Image */}
            <div className="relative">
              <div className="product-card">
                {product.isSale && (
                  <div className="badge badge-sale">
                    <svg width="28" height="36" viewBox="0 0 28 36" className="absolute inset-0">
                      <path d="M0 0 L28 0 L28 28 L14 36 L0 28 Z" fill="currentColor" />
                    </svg>
                    <span className="relative z-10 text-[10px]">
                      {product.discount ? `-${product.discount}%` : '-'}
                    </span>
                  </div>
                )}
                {product.isNew && (
                  <div className="badge badge-new" style={{ right: '0.75rem' }}>
                    <svg width="28" height="36" viewBox="0 0 28 36" className="absolute inset-0">
                      <path d="M0 0 L28 0 L28 28 L14 36 L0 28 Z" fill="currentColor" />
                    </svg>
                    <span className="relative z-10">+</span>
                  </div>
                )}
                <div className="flex justify-center items-center h-72">
                  <Image
                    src={getImageSrc(product.image)}
                    alt={name}
                    width={140}
                    height={210}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-5">
              <div>
                <h1 className="text-[30px] font-bold text-primary mb-1">{name}</h1>
                <p className="text-gray-600 font-semibold text-sm">
                  {currency} {product.price.toLocaleString()} {perPack}
                </p>
              </div>

              <AddToCartButton 
                product={{
                  id: product.id,
                  nameEn: product.nameEn,
                  nameAr: product.nameAr,
                  price: product.price,
                  image: product.image || '/images/product-tube.png'
                }}
                locale={locale}
              />

              {/* Description */}
              <div>
                <h3 className="font-bold text-primary mb-2 text-sm">
                  {isArabic ? 'الوصف:' : 'Description:'}
                </h3>
                <p className="text-gray-600 text-[13px] leading-relaxed">
                  {description || (isArabic 
                    ? 'منتج عالي الجودة للعناية بالبشرة. يساعد على تحسين مظهر البشرة وترطيبها.'
                    : 'High-quality skincare product. Helps improve skin appearance and hydration.'
                  )}
                </p>
              </div>

              {/* Loyalty Points Badge */}
              {product.loyaltyPointsEnabled && product.loyaltyPointsValue > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <p className="font-semibold text-amber-800">
                        {isArabic 
                          ? `اكسب ${product.loyaltyPointsValue} نقطة` 
                          : `Earn ${product.loyaltyPointsValue} points`
                        }
                      </p>
                      <p className="text-xs text-amber-700">
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
              <div className="pt-4 border-t border-gray-200">
                <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 
                    ? (isArabic ? `متوفر (${product.stock} في المخزون)` : `In Stock (${product.stock} available)`)
                    : (isArabic ? 'غير متوفر' : 'Out of Stock')
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
