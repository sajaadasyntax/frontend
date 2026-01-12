'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { UPLOADS_URL } from '@/lib/api'

interface ProductCardProps {
  id: string
  nameEn: string
  nameAr: string
  price: number
  image?: string
  isSale?: boolean
  isNew?: boolean
  discount?: number
  loyaltyPointsEnabled?: boolean
  loyaltyPointsValue?: number
  hasRecipes?: boolean
}

export default function ProductCard({ 
  id, 
  nameEn, 
  nameAr, 
  price, 
  image, 
  isSale, 
  isNew,
  discount,
  loyaltyPointsEnabled,
  loyaltyPointsValue,
  hasRecipes
}: ProductCardProps) {
  const t = useTranslations('home')
  const tc = useTranslations('common')
  const { locale } = useLocaleStore()
  
  const name = locale === 'ar' ? nameAr : nameEn
  const displayPrice = discount ? price - (price * discount / 100) : price

  const getImageSrc = (img?: string) => {
    if (!img) return '/images/product-tube.png'
    if (img.startsWith('/uploads')) return `${UPLOADS_URL}${img}`
    return img
  }

  return (
    <div className="product-card relative">
      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="flex justify-center items-center h-44 mb-3 cursor-pointer">
          <Image
            src={getImageSrc(image)}
            alt={name}
            width={100}
            height={150}
            className="object-contain hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      {/* Product Name */}
      <h3 className="text-center text-primary font-semibold text-[13px] mb-2">{name}</h3>

      {/* Loyalty Points */}
      {loyaltyPointsEnabled && loyaltyPointsValue && loyaltyPointsValue > 0 && (
        <p className="text-center text-amber-600 text-xs mb-2">
          ⭐ +{loyaltyPointsValue} {locale === 'ar' ? 'نقطة' : 'points'}
        </p>
      )}

      {/* Price */}
      <div className="text-center mb-3">
        <span className="text-gray-600 text-sm">
          {tc('currency')} {displayPrice.toLocaleString()} {tc('perUnit')}
        </span>
        {discount && discount > 0 && (
          <span className="text-gray-400 line-through text-xs ml-2">
            {tc('currency')} {price.toLocaleString()}
          </span>
        )}
      </div>

      {/* Shop Now Button */}
      <Link href={`/products/${id}`}>
        <button className="btn-primary w-full">
          {t('shopNow')}
          <Image src="/images/Proceed Icon.svg" alt="proceed" width={14} height={14} />
        </button>
      </Link>

      {/* Recipes Button */}
      {hasRecipes && (
        <a 
          href={`/recipes/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block"
        >
          <button className="w-full py-2 px-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2">
            📋 {locale === 'ar' ? 'عرض الوصفات' : 'View Recipes'}
          </button>
        </a>
      )}
    </div>
  )
}
